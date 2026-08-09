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
        timerDuration: (() => {
            const stored = parseInt(localStorage.getItem('quiz_timerDuration') || '', 10);
            if (!isNaN(stored)) return stored;
            return localStorage.getItem('quiz_timer') === 'true' ? 15 : 0;
        })(),
        timeLeft: 0,
        timerInterval: null,
        timeoutAdvanceTimer: null,
        timeoutCount: 0,
        totalTimeUsed: 0,
        answeredCount: 0,
        answers: [],

        ...mpMixin(),

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
            this.initMp();
            document.addEventListener('click', this.onDocClick.bind(this));
        },

        async onDocClick(e) {
            const btn = e.target.closest('.copy-btn');
            if (!btn) return;
            const code = btn.closest('.code-block')?.querySelector('pre');
            if (!code) return;
            const text = code.textContent.trim();
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

        get timerEnabled() {
            return this.timerDuration > 0;
        },

        setTimerDuration(secs) {
            this.timerDuration = parseInt(secs, 10) || 0;
            localStorage.setItem('quiz_timerDuration', this.timerDuration);
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
            if (this.timeoutAdvanceTimer) {
                clearTimeout(this.timeoutAdvanceTimer);
                this.timeoutAdvanceTimer = null;
            }
        },

        onTimeout() {
            this.stopTimer();
            this.showToast(t('timeUp'));
            this.answeredCurrent = true;
            this.selectedOptionIdx = -1;
            this.timeoutCount++;
            const q = this.currentQuestion;
            this.answers[this.currentPointer] = { selected: -1, correct: false };
            this.history[q.id] = {
                correct: false,
                lastAnsweredAt: new Date().toISOString().split('T')[0],
                timedOut: true
            };
            localStorage.setItem('quiz_history', JSON.stringify(this.history));
            this.lastRank = this.rankName;
            localStorage.setItem('quiz_lastRank', this.lastRank);
            this.timeoutAdvanceTimer = setTimeout(() => this.nextQuestion(), 3000);
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

        togglePack(pack) {
            pack.selected = !pack.selected;
        },

        selectAllPacks() {
            const allSelected = this.packs.every(p => p.selected);
            this.packs.forEach(p => { p.selected = !allSelected; });
        },

        async removeUserPack(pack) {
            if (pack.source !== 'user') return;
            const ok = await this.askConfirm(t('removePackConfirm', { name: pack.name, count: pack.questions.length }), t('removePack'));
            if (ok) {
                this.packs.splice(this.packs.indexOf(pack), 1);
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
            this.activeQuestions = pool.slice(0, count).map(shuffleQuestionOptions);
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
            this.answers = [];
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
            this.answers[this.currentPointer] = { selected: optIdx, correct: isCorrect };

            this.history[q.id] = {
                correct: isCorrect,
                lastAnsweredAt: new Date().toISOString().split('T')[0]
            };
            localStorage.setItem('quiz_history', JSON.stringify(this.history));
            this.lastRank = this.rankName;
            localStorage.setItem('quiz_lastRank', this.lastRank);
        },

        getOptionState(oIdx) {
            if (!this.answeredCurrent) return { cls: '', icon: '' };
            const q = this.currentQuestion;
            if (oIdx === q.answer) return { cls: 'correct', icon: 'fa-check' };
            if (oIdx === this.selectedOptionIdx) return { cls: 'wrong', icon: 'fa-xmark' };
            return { cls: 'faded', icon: '' };
        },

        handleImageError(event) {
            event.target.parentElement.innerHTML = `<div class="img-error-placeholder"><i class="fa-solid fa-triangle-exclamation"></i> ${t('imageLoadError')}</div>`;
        },

        nextQuestion() {
            if (this.currentPointer < this.activeQuestions.length - 1) {
                this.currentPointer++;
                const a = this.answers[this.currentPointer];
                this.answeredCurrent = !!a;
                this.selectedOptionIdx = a ? a.selected : null;
                if (a) {
                    this.stopTimer();
                } else {
                    this.startTimer();
                }
            } else {
                this.stopTimer();
                this.view = 'results';
            }
        },

        previousQuestion() {
            if (this.currentPointer <= 0) return;
            this.stopTimer();
            this.currentPointer--;
            const a = this.answers[this.currentPointer];
            this.answeredCurrent = !!a;
            this.selectedOptionIdx = a ? a.selected : null;
            if (!a) this.startTimer();
        },

        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    this.addPackFromText(content, file.name.replace(/\.md$/, ''));
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
                    this.helpContent = marked.parse(await res.text())
                        .replace(/<pre><code>/g, `<div class="code-block"><button class="copy-btn" type="button" title="${t('copyPrompt')}"><i class="fa-solid fa-copy"></i></button><pre><code>`)
                        .replace(/<\/code><\/pre>/g, '</code></pre></div>');
                }
            } catch (e) {
                console.warn('Failed to load help:', e);
            }
        },

        downloadBlob(blob, fileName) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        async exportSave() {
            const exportData = {
                username: this.username || t('anonymous'),
                exportedAt: new Date().toISOString(),
                theme: this.isDark ? 'dark' : 'light',
                palette: this.palette,
                lang: currentLang,
                lastRank: this.lastRank,
                timerDuration: this.timerDuration,
                history: this.history,
                userPacks: this.packs
                    .filter(p => p.source === 'user')
                    .map(({ name, questions }) => ({ name, questions }))
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const fileName = `kapral_save_${this.username || 'user'}.json`;

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
            this.downloadBlob(blob, fileName);
        },

        importSave(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                let data;
                try {
                    data = JSON.parse(e.target.result);
                } catch (err) {
                    this.showToast(t('invalidSave'));
                    return;
                }
                if (!data.exportedAt || !data.history) {
                    this.showToast(t('invalidSave'));
                    return;
                }

                this.history = data.history;
                localStorage.setItem('quiz_history', JSON.stringify(this.history));

                if (data.username != null) {
                    this.username = data.username;
                    localStorage.setItem('quiz_username', this.username);
                }
                if (data.lastRank) {
                    this.lastRank = data.lastRank;
                    localStorage.setItem('quiz_lastRank', this.lastRank);
                }
                if (data.timerDuration != null) {
                    this.timerDuration = parseInt(data.timerDuration, 10) || 0;
                    localStorage.setItem('quiz_timerDuration', this.timerDuration);
                }
                if (data.theme) {
                    this.isDark = data.theme === 'dark';
                    localStorage.setItem('quiz_theme', this.isDark ? 'dark' : 'light');
                    this.applyTheme();
                }
                if (data.palette) {
                    this.setPalette(data.palette);
                }

                if (Array.isArray(data.userPacks) && data.userPacks.length > 0) {
                    const restorePacks = await this.askConfirm(
                        t('restorePacksConfirm', { count: data.userPacks.length }),
                        t('restoreSave')
                    );
                    if (restorePacks) {
                        localStorage.setItem('quiz_user_packs', JSON.stringify(data.userPacks));
                        if (data.lang && data.lang !== currentLang) setLang(data.lang);
                        location.reload();
                        return;
                    }
                }

                if (data.lang && data.lang !== currentLang) {
                    setLang(data.lang);
                    location.reload();
                    return;
                }
                this.showToast(t('restoreSuccess'));
            };
            reader.readAsText(file);
        },

        exportPackAsMarkdown(pack) {
            if (!pack) return;

            const byCategory = {};
            pack.questions.forEach(q => {
                if (!byCategory[q.category]) byCategory[q.category] = [];
                byCategory[q.category].push(q);
            });

            const lines = [`# ${pack.name}`];
            for (const [cat, qs] of Object.entries(byCategory)) {
                lines.push(`\n## ${cat}`);
                qs.forEach(q => {
                    lines.push(`\n### ${q.question}`);
                    if (q.imageUrl) lines.push(`\n![${q.question}](${q.imageUrl})`);
                    lines.push('');
                    q.options.forEach((opt, i) => {
                        lines.push(`${i === q.answer ? '- [x]' : '- [ ]'} ${opt}`);
                    });
                    if (q.explanation) lines.push(`\n> ${currentLang === 'en' ? 'Explanation' : 'Wyjaśnienie'}: ${q.explanation}`);
                });
            }

            const md = lines.join('\n');
            const blob = new Blob([md], { type: 'text/markdown' });
            this.downloadBlob(blob, `${pack.name.replace(/\s+/g, '_')}.md`);
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
        },

    };
}