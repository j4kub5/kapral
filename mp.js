// mp.js — multiplayer state and logic (mixins into quizApp())
function mpMixin() {
    return {
        // Multiplayer state
        mpSocket: null,
        mpServer: window.location.origin,
        mpScreen: 'connect',
        mpNickname: '',
        mpJoinCode: '',
        mpCode: '',
        mpRoomName: '',
        mpQr: '',
        mpJoinUrl: '',
        mpIsHost: false,
        mpHostPlays: false,
        mpPlayers: [],
        mpQuestionCount: 0,
        mpPackName: '',
        mpPackText: '',
        mpStartCount: 10,
        mpTimePerQuestion: 15,
        mpCurrentQuestion: null,
        mpIndex: 0,
        mpTotal: 0,
        mpTimeLeft: 0,
        mpAnswered: false,
        mpMyAnswer: null,
        mpMyScore: 0,
        mpResults: [],
        mpReview: [],
        mpCountdownTimer: null,
        mpAutoHost: false,
        mpPendingPack: '',

        initMp() {
            const room = new URLSearchParams(location.search).get('room');
            if (!room) return;
            this.mpJoinCode = room.toUpperCase();
            this.mpServer = window.location.origin;
            this.view = 'multiplayer';
            this.connectServer();
        },

_mpSanitizeQuestion(q) {
            return sanitizeQuestion(q);
        },

        mpRandomSuffix(label) {
            return label + '-' + Math.floor(1000 + Math.random() * 9000);
        },

        mpRandomNickname() {
            const name = this.mpRandomSuffix(t('mpRandomPrefix'));
            localStorage.setItem('quiz_mp_nickname', name);
            return name;
        },

        ensureMpNickname() {
            if (this.mpNickname) return;
            this.mpNickname = this.username || localStorage.getItem('quiz_mp_nickname') || this.mpRandomNickname();
        },

        mpPersistNickname() {
            if (this.mpNickname) localStorage.setItem('quiz_mp_nickname', this.mpNickname);
        },

mpRandomRoomName() {
            return this.mpRandomSuffix(t('room'));
        },

        connectServer() {
            if (this.mpSocket?.connected) return;
            this.mpSocket?.disconnect();
            this.mpSocket = null;
            this.mpSocket = io(this.mpServer.trim() || undefined);
            this.mpSocket.on('connect', () => {
                this.mpScreen = 'menu';
                this.ensureMpNickname();
                this.showToast(t('mpConnected'));
                if (this.mpAutoHost) this.createRoom();
            });
            this.mpSocket.on('connect_error', () => {
                this.showToast(t('mpConnectError'));
            });
            this.mpSocket.on('disconnect', () => {
                this.mpScreen = 'connect';
                this.mpIsHost = false;
                this.mpHostPlays = false;
                this.mpCode = '';
                this.mpRoomName = '';
                this.mpQr = '';
                this.mpJoinUrl = '';
                this.showToast(t('mpDisconnected'));
            });
            this.mpSocket.on('player-list', ({ players }) => {
                this.mpPlayers = players;
            });
            this.mpSocket.on('game-start', ({ total, timePerQuestion, name, code }) => {
                this.mpTotal = total;
                this.mpTimePerQuestion = timePerQuestion;
                this.mpRoomName = name;
                this.mpCode = code || this.mpCode;
                this.mpScreen = 'game';
            });
            this.mpSocket.on('question', (d) => {
                this.mpCurrentQuestion = this._mpSanitizeQuestion(d.q);
                this.mpIndex = d.index;
                this.mpTotal = d.total;
                this.mpAnswered = false;
                this.mpMyAnswer = null;
                this.mpTimeLeft = d.timePerQuestion;
                clearInterval(this.mpCountdownTimer);
                this.mpCountdownTimer = setInterval(() => {
                    this.mpTimeLeft--;
                    if (this.mpTimeLeft <= 0) {
                        clearInterval(this.mpCountdownTimer);
                    }
                }, 1000);
                $nextTick(() => MathJax.typesetPromise?.());
            });
            this.mpSocket.on('answer-result', ({ score }) => {
                this.mpMyScore = score;
                this.mpAnswered = true;
            });
            this.mpSocket.on('game-end', ({ results, review }) => {
                this.mpResults = results;
                this.mpReview = (review || []).map(r => this._mpSanitizeQuestion(r));
                this.mpScreen = 'results';
                clearInterval(this.mpCountdownTimer);
            });
            this.mpSocket.on('host-left', () => {
                this.leaveMultiplayer(true);
                this.showToast(t('mpHostLeft'));
            });
            this.mpSocket.on('room-closed', () => {
                this.leaveMultiplayer(true);
                this.showToast(t('mpRoomClosed'));
            });
        },

        createRoom() {
            const nickname = this.mpNickname.trim() || this.username || t('guest');
            if (!this.mpSocket || !this.mpSocket.connected) {
                this.showToast(t('mpNotConnected'));
                return;
            }
            this.mpSocket.emit('create-room', { nickname, roomName: this.mpRoomName.trim() || this.mpRandomRoomName(), hostPlays: this.mpHostPlays }, (res) => {
                if (!res.ok) {
                    this.showToast(t('mpCreateError'));
                    return;
                }
                this.mpCode = res.code;
                this.mpRoomName = res.name;
                this.mpIsHost = true;
                this.mpPlayers = res.players;
                this.mpQr = res.qr || '';
                this.mpJoinUrl = res.joinUrl || '';
                this.mpQuestionCount = 0;
                this.mpPackName = '';
                this.mpPackText = '';
                this.mpScreen = 'lobby';
                if (this.mpAutoHost) {
                    this.mpAutoHost = false;
                    const md = this.mpPendingPack;
                    this.mpPendingPack = '';
                    this.mpSendMarkdown(md);
                }
            });
        },

        async mpCopyRoomLink() {
            if (!this.mpJoinUrl) return;
            const text = this.mpJoinUrl;
            try {
                await navigator.clipboard.writeText(text);
                this.showToast(t('copied'));
            } catch (err) {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
                this.showToast(t('copied'));
            }
        },

        joinRoom() {
            const nickname = this.mpNickname.trim() || this.username || t('guest');
            const code = (this.mpJoinCode || '').trim().toUpperCase();
            if (!code) {
                this.showToast(t('mpEnterCode'));
                return;
            }
            if (!this.mpSocket || !this.mpSocket.connected) {
                this.showToast(t('mpNotConnected'));
                return;
            }
            this.mpSocket.emit('join-room', { code, nickname }, (res) => {
                if (!res.ok) {
                    this.showToast(res.error === 'room-full' ? t('mpRoomFull') : t('mpRoomNotFound'));
                    return;
                }
                this.mpCode = res.code;
                this.mpRoomName = res.name;
                this.mpIsHost = false;
                this.mpPlayers = res.players;
                this.mpQuestionCount = 0;
                this.mpScreen = 'lobby';
            });
        },

        mpHostFromPacks() {
            const selected = this.selectedPacks();
            if (!selected.length) { this.showToast(t('selectAtLeastOne')); return; }
            if (selected.some(p => p.source === 'ai_infinite')) { this.showToast(t('mpAiInfiniteSolo')); return; }
            let pool = selected.flatMap(p => p.questions);
            if (this.filterOutAnswered) pool = pool.filter(q => !this.history[q.id]);
            if (!pool.length) { this.showToast(t('noAvailableQuestions')); return; }
            const packName = selected.length === 1 ? selected[0].name : t('mpPacksName');
            this.mpPendingPack = questionsToMarkdown(pool, packName);
            this.view = 'multiplayer';
            if (this.mpSocket?.connected) {
                this.mpAutoHost = true;
                this.createRoom();
            } else {
                this.mpAutoHost = true;
                this.mpServer = this.mpServer || window.location.origin;
                this.connectServer();
            }
        },

        mpSendPack() {
            this.mpSendMarkdown(this.mpPackText);
        },

        mpSendMarkdown(markdown) {
            if (!this.mpSocket) return;
            this.mpSocket.emit('upload-pack', { markdown }, (res) => {
                if (!res.ok) {
                    this.showToast(t('mpPackInvalid'));
                    return;
                }
                this.mpQuestionCount = res.count;
                this.mpPackName = res.packName;
                this.mpPackText = '';
                this.showToast(t('mpPackReady', { name: res.packName, count: res.count }));
            });
        },

        mpSetHostPlays() {
            if (!this.mpSocket || !this.mpSocket.connected) return;
            this.mpSocket.emit('set-host-plays', { hostPlays: this.mpHostPlays }, (res) => {
                if (!res.ok) {
                    this.mpHostPlays = !this.mpHostPlays;
                    this.showToast(t('mpStartError'));
                }
            });
        },

        mpStartGame() {
            if (!this.mpSocket || this.mpQuestionCount === 0) return;
            this.mpSocket.emit('start-game', { questionCount: this.mpStartCount, timePerQuestion: this.mpTimePerQuestion }, (res) => {
                if (!res.ok) {
                    this.showToast(t('mpStartError'));
                    return;
                }
                this.mpPlayers = this.mpPlayers.map(p => ({ ...p, score: 0 }));
            });
        },

        mpAnswer(oIdx) {
            if (this.mpAnswered || !this.mpSocket) return;
            this.mpAnswered = true;
            this.mpMyAnswer = oIdx;
            this.mpSocket.emit('answer', { answer: oIdx }, (res) => {
                if (res && !res.ok) this.mpAnswered = false;
            });
        },

        mpOptionState(oIdx) {
            if (!this.mpAnswered) return { cls: '', icon: '' };
            if (oIdx === this.mpMyAnswer) return { cls: 'selected', icon: '' };
            return { cls: 'faded', icon: '' };
        },

        mpReviewSummary(item) {
            const counts = { correct: 0, wrong: 0, none: 0 };
            for (const a of item.answers) {
                if (a.answer === null || a.answer === undefined) counts.none++;
                else if (a.answer === item.correctIndex) counts.correct++;
                else counts.wrong++;
            }
            return counts;
        },

        mpRematch() {
            this.mpResults = [];
            this.mpScreen = 'lobby';
        },

        leaveMultiplayer(silent = false) {
            clearInterval(this.mpCountdownTimer);
            if (this.mpSocket) {
                this.mpSocket.disconnect();
                this.mpSocket = null;
            }
            this.mpScreen = 'connect';
            this.mpIsHost = false;
            this.mpHostPlays = false;
            this.mpCode = '';
            this.mpRoomName = '';
            this.mpQr = '';
            this.mpJoinUrl = '';
            this.mpPlayers = [];
            this.mpQuestionCount = 0;
            this.mpPackName = '';
            this.mpCurrentQuestion = null;
            this.mpResults = [];
            if (!silent) this.view = 'dashboard';
        }
    };
}
