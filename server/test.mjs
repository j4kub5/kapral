import { io } from 'socket.io-client';
const URL = process.env.URL || 'http://localhost:3000';
const md = `# Test Pack\n\n## Geo\n\n### Q1?\n- [ ] Alfa\n- [x] Bravo\n\n> Wyjaśnienie: bo Bravo\n\n### Q2?\n- [x] Charlie\n- [ ] Delta`;
const host = io(URL);
const player = io(URL);
let sawGameEnd = false;
let playingHost = false;

host.on('connect', () => {
  host.emit('create-room', { nickname: 'Host', hostPlays: false }, (res) => {
    if (!res.ok) { fail('create-room'); }
    if (res.players.length !== 0) { fail('host-only room should have no players'); }
    if (typeof res.qr !== 'string' || !res.qr.startsWith('data:image/')) { fail('create-room: qr data URL missing'); }
    if (typeof res.joinUrl !== 'string' || !res.joinUrl.includes(res.code)) { fail('create-room: joinUrl missing'); }
    if (typeof res.name !== 'string' || !res.name.includes('Room')) { fail('create-room: room name missing'); }
    player.emit('join-room', { code: res.code, nickname: 'Player' }, (res2) => {
      if (!res2.ok || res2.players.length !== 1) { fail('join-room'); }
      host.emit('upload-pack', { markdown: md }, (res3) => {
        if (!res3.ok || res3.count !== 2) { fail('upload-pack'); }
        host.emit('set-host-plays', { hostPlays: true }, (res4) => {
          if (!res4.ok) { fail('set-host-plays'); }
          playingHost = true;
          host.emit('start-game', { questionCount: 2, timePerQuestion: 10 }, (res5) => {
            if (!res5.ok) { fail('start-game'); }
          });
        });
      });
    });
  });
});

player.on('question', (d) => player.emit('answer', { answer: 0 }));
player.on('game-start', (d) => {
  if (typeof d.name !== 'string' || !d.name) fail('game-start: room name missing');
  if (typeof d.code !== 'string' || !d.code) fail('game-start: room code missing');
});
player.on('answer-result', (d) => {
  if (typeof d.score !== 'number') fail('answer-result');
  if (d.correct !== undefined) fail('answer-result: correct must not leak mid-game');
});
host.on('question', (d) => {
  if (!playingHost) fail('host should receive questions');
  host.emit('answer', { answer: d.q.options.length - 1 });
});
host.on('game-end', (d) => {
  if (!Array.isArray(d.results)) fail('game-end');
  if (playingHost && d.results.length !== 2) fail('game-end: host should be in results when playing');
  if (!Array.isArray(d.review) || d.review.length !== 2) fail('game-end: review missing');
  const q0 = d.review[0];
  if (typeof q0.correctIndex !== 'number' || !Array.isArray(q0.options)) fail('game-end: review question missing answer');
  if (!Array.isArray(q0.answers) || q0.answers.length !== 2) fail('game-end: review player answers missing');
  sawGameEnd = true;
  console.log('E2E OK:', JSON.stringify(d.results));
  host.close(); player.close();
  process.exit(0);
});
host.on('player-list', () => {});

function fail(step) {
  console.error('E2E FAILED at', step);
  host.close(); player.close();
  process.exit(1);
}

setTimeout(() => { console.error('E2E TIMEOUT'); process.exit(1); }, 15000);
