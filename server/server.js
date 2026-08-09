import { createServer } from 'http';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import QRCode from 'qrcode';
import { parseMarkdown } from './parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = 200;
const ROOM_TTL_MS = 30 * 60 * 1000;
const REVEAL_DELAY_MS = 3000;

function getLanIp() {
    const ifs = os.networkInterfaces();
    for (const addrs of Object.values(ifs)) {
        for (const a of addrs || []) {
            if (a.family === 'IPv4' && !a.internal) return a.address;
        }
    }
    return 'localhost';
}
const PUBLIC_URL = process.env.PUBLIC_URL || `http://${getLanIp()}:${PORT}`;

const app = express();
app.use(cors());
// Serwuj tylko pliki frontendu (reszta repo, w tym server/, jest prywatna).
const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_FILES = ['index.html', 'styles.css', 'logo.png', 'app.js', 'parser.js', 'mp.js', 'translations.js', 'help_pl.md', 'help_en.md'];
app.use((req, res, next) => {
    const p = decodeURIComponent(req.path.replace(/^\//, ''));
    const allowed = p === '' || PUBLIC_FILES.includes(p) || p.startsWith('packs/');
    if (!allowed) return res.status(404).end();
    next();
}, express.static(ROOT_DIR));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const rooms = new Map();

function genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
        code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while ([...rooms.values()].some(r => r.code === code));
    return code;
}

function getRoomOf(socket) {
    return rooms.get(socket.data.roomId);
}

function broadcastRoom(room, event, payload) {
    io.to(room.roomId).emit(event, payload);
}

function playerList(room) {
    return room.players.map(p => ({ nickname: p.nickname, score: p.score, isHost: p.isHost, answered: p.answered }));
}

function safeQuestions(qs) {
    return qs.map(q => ({ category: q.category, question: q.question, imageUrl: q.imageUrl, options: q.options }));
}

function startRound(room) {
    room.currentIndex = -1;
    room.players.forEach(p => { p.score = 0; p.answered = false; p.answers = []; });
    broadcastRoom(room, 'game-start', { total: room.questions.length, timePerQuestion: room.timePerQuestion, name: room.name, code: room.code });
    sendNextQuestion(room);
}

function sendNextQuestion(room) {
    room.currentIndex++;
    if (room.currentIndex >= room.questions.length) {
        endGame(room);
        return;
    }
    room.players.forEach(p => { p.answered = false; });
    const q = room.questions[room.currentIndex];
    broadcastRoom(room, 'question', {
        index: room.currentIndex,
        total: room.questions.length,
        timePerQuestion: room.timePerQuestion,
        q: safeQuestions([q])[0]
    });
    clearTimeout(room.timer);
    room.timer = setTimeout(() => advanceRound(room), room.timePerQuestion * 1000);
}

function advanceRound(room) {
    clearTimeout(room.timer);
    room.timer = setTimeout(() => sendNextQuestion(room), REVEAL_DELAY_MS);
}

function endGame(room) {
    clearTimeout(room.timer);
    const review = room.questions.map((q, i) => ({
        question: q.question,
        imageUrl: q.imageUrl,
        options: q.options,
        correctIndex: q.answer,
        explanation: q.explanation,
        answers: room.players.map(p => ({ nickname: p.nickname, answer: p.answers[i] ?? null }))
    }));
    broadcastRoom(room, 'game-end', { results: playerList(room), review });
}

io.on('connection', (socket) => {
    socket.data.roomId = null;

    socket.on('create-room', async ({ nickname, hostPlays, roomName }, ack) => {
        const roomId = `room_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
        const room = {
            roomId,
            code: genCode(),
            name: roomName || 'Room',
            hostSocketId: socket.id,
            hostNickname: nickname || 'Host',
            hostPlays: !!hostPlays,
            players: [],
            questions: [],
            currentIndex: -1,
            timer: null,
            timePerQuestion: 15,
            started: false,
            lastActivity: Date.now()
        };
        if (room.hostPlays) {
            room.players.push({ id: socket.id, nickname: room.hostNickname, score: 0, isHost: true, answered: false, answers: [] });
        }
        rooms.set(roomId, room);
        socket.join(roomId);
        socket.data.roomId = roomId;
        const joinUrl = `${PUBLIC_URL}/index.html?room=${room.code}`;
        let qr = '';
        try {
            qr = await QRCode.toDataURL(joinUrl, { margin: 1, width: 400 });
        } catch {
            // QR niekrytyczny — gracze mogą wpisać kod ręcznie
        }
        ack({ ok: true, roomId, code: room.code, name: room.name, players: playerList(room), qr, joinUrl });
    });

    socket.on('set-host-plays', ({ hostPlays }, ack) => {
        const room = getRoomOf(socket);
        if (!room) return ack?.({ ok: false, error: 'no-room' });
        if (socket.id !== room.hostSocketId) return ack?.({ ok: false, error: 'not-host' });
        if (room.started) return ack?.({ ok: false, error: 'game-in-progress' });
        room.hostPlays = !!hostPlays;
        room.players = room.players.filter(p => p.id !== room.hostSocketId);
        if (room.hostPlays) {
            room.players.unshift({ id: room.hostSocketId, nickname: room.hostNickname, score: 0, isHost: true, answered: false, answers: [] });
        }
        ack?.({ ok: true });
        broadcastRoom(room, 'player-list', { players: playerList(room) });
    });

    socket.on('join-room', ({ code, nickname }, ack) => {
        const room = [...rooms.values()].find(r => r.code === (code || '').toUpperCase());
        if (!room) return ack({ ok: false, error: 'room-not-found' });
        if (room.players.length >= MAX_PLAYERS) return ack({ ok: false, error: 'room-full' });
        if (room.started) return ack({ ok: false, error: 'game-in-progress' });

        const player = { id: socket.id, nickname: nickname || 'Player', score: 0, isHost: false, answered: false, answers: [] };
        room.players.push(player);
        socket.join(room.roomId);
        socket.data.roomId = room.roomId;
        room.lastActivity = Date.now();
        ack({ ok: true, roomId: room.roomId, code: room.code, name: room.name, players: playerList(room) });
        io.to(room.hostSocketId).emit('player-list', { players: playerList(room) });
    });

    socket.on('upload-pack', ({ markdown }, ack) => {
        const room = getRoomOf(socket);
        if (!room) return ack({ ok: false, error: 'no-room' });
        if (socket.id !== room.hostSocketId) return ack({ ok: false, error: 'not-host' });
        const questions = parseMarkdown(markdown);
        if (questions.length === 0) return ack({ ok: false, error: 'no-questions' });
        room.questions = questions;
        room.lastActivity = Date.now();
        ack({ ok: true, count: questions.length, packName: questions[0]?.packName || 'Pakiet' });
    });

    socket.on('start-game', ({ questionCount, timePerQuestion }, ack) => {
        const room = getRoomOf(socket);
        if (!room) return ack({ ok: false, error: 'no-room' });
        if (socket.id !== room.hostSocketId) return ack({ ok: false, error: 'not-host' });
        if (room.questions.length === 0) return ack({ ok: false, error: 'no-questions' });
        if (room.players.length === 0) return ack({ ok: false, error: 'no-players' });

        const n = Math.min(questionCount || room.questions.length, room.questions.length);
        const shuffled = [...room.questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        room.questions = shuffled.slice(0, n);
        room.timePerQuestion = Math.min(Math.max(parseInt(timePerQuestion, 10) || 15, 5), 120);
        room.started = true;
        room.lastActivity = Date.now();
        ack({ ok: true });
        startRound(room);
    });

    socket.on('answer', ({ answer }, ack) => {
        const room = getRoomOf(socket);
        if (!room) return;
        const player = room.players.find(p => p.id === socket.id);
        if (!player || player.answered) return;
        const q = room.questions[room.currentIndex];
        if (!q) return;

        player.answered = true;
        player.answers[room.currentIndex] = answer;
        const correct = (answer === q.answer);
        if (correct) player.score++;
        room.lastActivity = Date.now();

        socket.emit('answer-result', { score: player.score });
        io.to(room.hostSocketId).emit('player-list', { players: playerList(room) });

        if (room.players.every(p => p.answered)) {
            advanceRound(room);
        }
        if (ack) ack({ ok: true });
    });

    socket.on('disconnect', () => {
        const room = getRoomOf(socket);
        if (!room) return;
        room.lastActivity = Date.now();

        if (socket.id === room.hostSocketId) {
            broadcastRoom(room, 'host-left', {});
            clearTimeout(room.timer);
            rooms.delete(room.roomId);
        } else {
            room.players = room.players.filter(p => p.id !== socket.id);
            io.to(room.hostSocketId).emit('player-list', { players: playerList(room) });
        }
    });
});

setInterval(() => {
    const now = Date.now();
    for (const [id, room] of rooms) {
        if (now - room.lastActivity > ROOM_TTL_MS) {
            broadcastRoom(room, 'room-closed', { reason: 'timeout' });
            clearTimeout(room.timer);
            rooms.delete(id);
        }
    }
}, 60 * 1000);

httpServer.listen(PORT, () => {
    console.log(`Kapral server listening on http://localhost:${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}/index.html`);
    console.log(`Join URL (QR): ${PUBLIC_URL}/index.html?room=XXXXXX`);
});
