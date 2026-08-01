function quizApp() {
    return {
        view: 'dashboard',
        packs: [],
        activeQuestions: [],
        currentPointer: 0,
        batchScore: 0,
        answeredCurrent: false,
        selectedOptionIdx: null,
        filterOutAnswered: false,
        questionCount: 10,
        packSearch: '',
        isDark: true,
        username: localStorage.getItem('quiz_username') || '',
        lastRank: localStorage.getItem('quiz_lastRank') || getDefaultRank(),
        history: (() => { try { return JSON.parse(localStorage.getItem('quiz_history') || '{}'); } catch { return {}; } })(),
        toast: { visible: false, message: '', ttl: 0 },
        modal: { visible: false, kind: 'confirm', title: '', message: '', inputValue: '', placeholder: '', confirmLabel: 'OK', cancelLabel: t('cancel'), resolve: () => {} },
        loading: false,
        palette: localStorage.getItem('quiz_palette') || 'pink',
        helpContent: '',
        showRankList: false,
        editingUsername: false,
        usernameInputValue: '',
        ranks: getRanks(),
        timerEnabled: localStorage.getItem('quiz_timer') === 'true',
        timerDuration: parseInt(localStorage.getItem('quiz_timerDuration') || '15', 10),
        penaltyEnabled: localStorage.getItem('quiz_penalty') === 'true',
        timeLeft: 0,
        timerInterval: null,
        timeoutCount: 0,
        totalTimeUsed: 0,
        answeredCount: 0,

        initApp() {
            setLang(currentLang);
            const savedTheme = localStorage.getItem('quiz_theme');
            if (savedTheme) {
                this.isDark = (savedTheme === 'dark');
            } else {
                this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            this.applyTheme();
            document.documentElement.setAttribute('data-palette', this.palette);
            this.loadUserPacks();
            this.loadBuiltinPacks();
            this.loadHelp();
        },

        loadUserPacks() {
            try {
                const stored = JSON.parse(localStorage.getItem('quiz_user_packs') || '[]');
                stored.forEach(p => {
                    if (p.name && Array.isArray(p.questions)) {
                        this.packs.push({ name: p.name, source: 'user', questions: p.questions, selected: false });
                    }
                });
            } catch (e) {
                console.warn('Failed to load user packs:', e);
            }
        },

        persistUserPacks() {
            const userPacks = this.packs
                .filter(p => p.source === 'user')
                .map(({ name, questions }) => ({ name, questions }));
            try {
                localStorage.setItem('quiz_user_packs', JSON.stringify(userPacks));
            } catch (e) {
                console.warn('Failed to persist user packs:', e);
            }
        },

        toggleTheme() {
            this.isDark = !this.isDark;
            localStorage.setItem('quiz_theme', this.isDark ? 'dark' : 'light');
            this.applyTheme();
        },

        applyTheme() {
            document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
        },

        setPalette(name) {
            this.palette = name;
            localStorage.setItem('quiz_palette', name);
            document.documentElement.setAttribute('data-palette', name);
        },

        toggleTimer() {
            this.timerEnabled = !this.timerEnabled;
            localStorage.setItem('quiz_timer', this.timerEnabled);
        },

        setTimerDuration(secs) {
            this.timerDuration = secs;
            localStorage.setItem('quiz_timerDuration', secs);
        },

        togglePenalty() {
            this.penaltyEnabled = !this.penaltyEnabled;
            localStorage.setItem('quiz_penalty', this.penaltyEnabled);
        },

        startTimer() {
            this.stopTimer();
            if (!this.timerEnabled) return;
            this.timeLeft = this.timerDuration;
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.onTimeout();
                }
            }, 1000);
        },

        stopTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        },

        onTimeout() {
            this.stopTimer();
            this.showToast(t('timeUp'));
            this.answeredCurrent = true;
            this.selectedOptionIdx = -1;
            this.timeoutCount++;
            const q = this.currentQuestion;
            if (this.penaltyEnabled) this.batchScore = Math.max(0, this.batchScore - 1);
            this.history[q.id] = {
                correct: false,
                lastAnsweredAt: new Date().toISOString().split('T')[0],
                timedOut: true
            };
            localStorage.setItem('quiz_history', JSON.stringify(this.history));
            this.lastRank = this.rankName;
            localStorage.setItem('quiz_lastRank', this.lastRank);
            setTimeout(() => this.nextQuestion(), 3000);
        },

        showToast(message) {
            this.toast.message = message;
            this.toast.visible = true;
            clearTimeout(this.toast.ttl);
            this.toast.ttl = setTimeout(() => { this.toast.visible = false; }, 3000);
        },

        askConfirm(text, title) {
            return new Promise((resolve) => {
                this.modal = {
                    visible: true,
                    kind: 'confirm',
                    title: title || t('confirmTitle'),
                    message: text,
                    inputValue: '',
                    placeholder: '',
                    confirmLabel: 'OK',
                    cancelLabel: t('cancel'),
                    resolve
                };
            });
        },

        askPrompt(text, currentValue = '', title) {
            return new Promise((resolve) => {
                this.modal = {
                    visible: true,
                    kind: 'prompt',
                    title: title || t('promptTitle'),
                    message: text,
                    inputValue: currentValue,
                    placeholder: '',
                    confirmLabel: t('save'),
                    cancelLabel: t('cancel'),
                    resolve
                };
            });
        },

        saveUsername() {
            const trimmed = this.usernameInputValue.trim();
            if (trimmed.length > 20) {
                this.showToast(t('usernameTooLong'));
                return;
            }
            this.username = trimmed;
            localStorage.setItem('quiz_username', this.username);
            this.editingUsername = false;
        },

        cancelEditUsername() {
            this.editingUsername = false;
        },

        getAnsweredCount() {
            return Object.keys(this.history).length;
        },

        get allPacksFiltered() {
            const q = this.packSearch.toLowerCase();
            return this.packs.filter(p => (!q || p.name.toLowerCase().includes(q)));
        },

        selectedPacks() {
            return this.packs.filter(p => p.selected);
        },

        totalSelectedQuestions() {
            return this.selectedPacks().reduce((sum, p) => {
                const qs = this.filterOutAnswered ? p.questions.filter(q => !this.history[q.id]) : p.questions;
                return sum + qs.length;
            }, 0);
        },

        togglePack(idx) {
            this.packs[idx].selected = !this.packs[idx].selected;
        },

        selectAllPacks() {
            const allSelected = this.packs.every(p => p.selected);
            this.packs.forEach(p => { p.selected = !allSelected; });
        },

        async removeUserPack(idx) {
            const pack = this.packs[idx];
            if (pack.source !== 'user') return;
            const ok = await this.askConfirm(t('removePackConfirm', { name: pack.name, count: pack.questions.length }), t('removePack'));
            if (ok) {
                this.packs.splice(idx, 1);
                this.persistUserPacks();
            }
        },

        showDashboard() {
            this.stopTimer();
            this.view = 'dashboard';
        },

        startQuizFromPacks() {
            const selected = this.selectedPacks();
            if (selected.length === 0) {
                this.showToast(t('selectAtLeastOne'));
                return;
            }
            let pool = selected.flatMap(p => p.questions);
            if (this.filterOutAnswered) {
                pool = pool.filter(q => !this.history[q.id]);
            }
            if (pool.length === 0) {
                this.showToast(t('noAvailableQuestions'));
                return;
            }
            // Fisher-Yates shuffle
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            const count = this.questionCount === 0 ? pool.length : Math.min(this.questionCount, pool.length);
            this.activeQuestions = pool.slice(0, count);
            this.startQuiz();
        },

        startQuiz() {
            if (this.activeQuestions.length === 0) {
                this.showToast(t('noQuestionsInPack'));
                return;
            }
            this.currentPointer = 0;
            this.batchScore = 0;
            this.answeredCurrent = false;
            this.selectedOptionIdx = null;
            this.timeoutCount = 0;
            this.totalTimeUsed = 0;
            this.answeredCount = 0;
            this.view = 'quiz';
            this.startTimer();
        },

        get currentQuestion() {
            return this.activeQuestions[this.currentPointer] || null;
        },

        get rankName() {
            if (!this.activeQuestions.length) return getDefaultRank();
            const pct = Math.round((this.batchScore / this.activeQuestions.length) * 100);
            const rank = this.ranks.find(r => pct >= r.min);
            return rank ? rank.name : getDefaultRank();
        },

        packProgress(pack) {
            const answered = pack.questions.filter(q => this.history[q.id]).length;
            return { answered, total: pack.questions.length, newQ: pack.questions.length - answered };
        },

        get dashboardGreeting() {
            const name = this.username || t('guest');
            return t('greeting', { name, rank: this.lastRank });
        },

        get activeRankIndex() {
            return this.ranks.findIndex(r => this.lastRank === r.name);
        },

        get avgTime() {
            return this.answeredCount > 0 ? Math.round(this.totalTimeUsed / this.answeredCount) : 0;
        },

        selectOption(optIdx) {
            if (this.answeredCurrent) return;
            this.answeredCurrent = true;
            this.selectedOptionIdx = optIdx;
            this.stopTimer();

            const q = this.currentQuestion;
            const isCorrect = (optIdx === q.answer);

            if (isCorrect) this.batchScore++;
            if (this.timerEnabled) {
                this.totalTimeUsed += (this.timerDuration - this.timeLeft);
                this.answeredCount++;
            }

            this.history[q.id] = {
                correct: isCorrect,
                lastAnsweredAt: new Date().toISOString().split('T')[0]
            };
            localStorage.setItem('quiz_history', JSON.stringify(this.history));
            this.lastRank = this.rankName;
            localStorage.setItem('quiz_lastRank', this.lastRank);
        },

        getOptionClass(oIdx) {
            if (!this.answeredCurrent) return '';
            const q = this.currentQuestion;
            if (oIdx === q.answer) return 'correct';
            if (oIdx === this.selectedOptionIdx && oIdx !== q.answer) return 'wrong';
            return 'faded';
        },

        getOptionIcon(oIdx) {
            if (!this.answeredCurrent) return '';
            const q = this.currentQuestion;
            if (oIdx === q.answer) return 'fa-check';
            if (oIdx === this.selectedOptionIdx && oIdx !== q.answer) return 'fa-xmark';
            return '';
        },

        handleImageError(event) {
            event.target.parentElement.innerHTML = `<div class="img-error-placeholder"><i class="fa-solid fa-triangle-exclamation"></i> ${t('imageLoadError')}</div>`;
        },

        nextQuestion() {
            if (this.currentPointer < this.activeQuestions.length - 1) {
                this.currentPointer++;
                this.answeredCurrent = false;
                this.selectedOptionIdx = null;
                this.startTimer();
            } else {
                this.stopTimer();
                this.view = 'results';
            }
        },

        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    if (file.name.endsWith('.json')) {
                        const parsed = JSON.parse(content);
                        parsed.forEach(q => {
                            if (!q.id) q.id = generateQuestionHash(q.category || 'Ogólne', q.question);
                        });
                        if (parsed.length > 0) {
                            this.pushUserPack(parsed, file.name.replace(/\.(md|json)$/, ''));
                        } else {
                            this.showToast(t('invalidFile'));
                        }
                    } else {
                        this.addPackFromText(content, file.name.replace(/\.(md|json)$/, ''));
                    }
                } catch (err) {
                    this.showToast(t('fileReadError') + err.message);
                }
            };
            reader.readAsText(file);
        },

        addPackFromText(content, name) {
            const parsed = parseMarkdownWithMarked(content);
            if (!parsed.length) {
                this.showToast(t('invalidFile'));
                return;
            }
            this.pushUserPack(parsed, name);
        },

        pushUserPack(parsed, name) {
            const packName = parsed[0]?.packName || name || t('userBadge');
            this.packs.push({ name: packName, source: 'user', questions: parsed, selected: true });
            this.persistUserPacks();
            this.showToast(t('packAdded', { name: packName, count: parsed.length }));
        },

        pasteMarkdown() {
            this.modal = {
                visible: true,
                kind: 'markdown',
                title: t('pasteMarkdownTitle'),
                message: '',
                inputValue: '',
                placeholder: t('pasteMarkdownPlaceholder'),
                confirmLabel: t('save'),
                cancelLabel: t('cancel'),
                resolve: (text) => {
                    if (text && text.trim()) this.addPackFromText(text);
                }
            };
        },

        async loadBuiltinPacks() {
            this.loading = true;
            const loaded = [];
            let paths = [];
            try {
                const manifestRes = await fetch('packs/manifest.json');
                if (manifestRes.ok) {
                    paths = await manifestRes.json();
                }
            } catch (e) {
                console.warn('Failed to load manifest:', e);
            }
            for (const path of paths) {
                try {
                    const res = await fetch(path);
                    if (res.ok) {
                        const md = await res.text();
                        const questions = parseMarkdownWithMarked(md);
                        if (questions.length > 0) {
                            const name = questions[0].packName || path.split('/').pop().replace('.md', '');
                            loaded.push({ name, source: 'builtin', questions, selected: false });
                        }
                    }
                } catch (e) {
                    console.warn('Failed to load pack:', path, e);
                }
            }
            this.packs = [...loaded, ...this.packs.filter(p => p.source === 'user')];
            this.loading = false;
            const total = loaded.reduce((s, p) => s + p.questions.length, 0);
            this.showToast(t('loadedStats', { total, count: loaded.length }));
        },

        async loadHelp() {
            try {
                const lang = currentLang;
                const filename = lang === 'en' ? 'help_en.md' : 'help_pl.md';
                const res = await fetch(filename);
                if (res.ok) {
                    this.helpContent = marked.parse(await res.text());
                }
            } catch (e) {
                console.warn('Failed to load help:', e);
            }
        },

        async exportStats() {
            const exportData = {
                username: this.username || t('anonymous'),
                exportedAt: new Date().toISOString(),
                history: this.history
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const fileName = `kapral_quiz_stats_${this.username || 'user'}.json`;

            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: t('fileJSON'),
                            accept: { 'application/json': ['.json'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(jsonString);
                    await writable.close();
                    return;
                } catch (err) {
                    if (err.name === 'AbortError') return;
                }
            }

            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        async resetHistory() {
            const confirmed = await this.askConfirm(t('resetHistoryConfirm'), t('clearHistory'));
            if (confirmed) {
                this.history = {};
                localStorage.removeItem('quiz_history');
                this.lastRank = getDefaultRank();
                localStorage.setItem('quiz_lastRank', this.lastRank);
                this.showToast(t('historyCleared'));
            }
        }
    };
}
