function quizApp() {
    return {
        view: 'dashboard',
        packs: [],
        activeQuestions: [],
        currentPointer: 0,
        batchScore: 0,
        answeredCurrent: false,
        selectedOptionIdx: null,
        filterOutAnswered: localStorage.getItem('quiz_filterAnswered') !== '0',
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
        soundFeedback: localStorage.getItem('quiz_soundFeedback') !== '0',
        _audioCtx: null,
        geminiKey: localStorage.getItem('quiz_gemini_key') || '',
        aiTopic: '',
        aiCount: 10,
        aiUseWiki: true,
        aiLoading: false,
        aiStep: '',
        aiError: '',
        aiModalVisible: false,
        geminiModel: 'gemini-3.6-flash',
        aiInfiniteActive: false,
        aiInfiniteTopic: '',
        aiInfiniteSubtopic: '',
        aiInfiniteSuggestions: [],
        aiInfiniteLoading: false,
        aiInfiniteGenerating: false,
        aiInfiniteModalVisible: false,
        aiCategoryModalVisible: false,
        aiCategoryCustom: '',

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
                        p.questions = p.questions.map(sanitizeQuestion);
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

        toggleSound() {
            this.soundFeedback = !this.soundFeedback;
            localStorage.setItem('quiz_soundFeedback', this.soundFeedback ? '1' : '0');
        },

        _playFeedback(correct) {
            if (!this.soundFeedback) return;
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                this._audioCtx = this._audioCtx || new AC();
                const ctx = this._audioCtx;
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                const tones = correct
                    ? [
                        { f: 660, t: 0, d: 0.25, type: 'sine', g: 0.15 },
                        { f: 880, t: 0.12, d: 0.25, type: 'sine', g: 0.15 },
                        { f: 990, t: 0.24, d: 0.3, type: 'sine', g: 0.15 }
                    ]
                    : [
                        { f: 392, t: 0, d: 0.3, type: 'square', g: 0.06 },
                        { f: 262, t: 0.15, d: 0.35, type: 'square', g: 0.06 }
                    ];
                tones.forEach(({ f, t, d, type, g }) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = type;
                    osc.frequency.value = f;
                    const start = now + t;
                    gain.gain.setValueAtTime(0, start);
                    gain.gain.linearRampToValueAtTime(g, start + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, start + d);
                    osc.connect(gain).connect(ctx.destination);
                    osc.start(start);
                    osc.stop(start + d + 0.05);
                });
            } catch (e) {
                // feedback sound is optional
            }
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
            this._playFeedback(false);
            this.showToast(t('timeUp'));
            this.answeredCurrent = true;
            this.selectedOptionIdx = -1;
            this.timeoutCount++;
            const q = this.currentQuestion;
            this.answers[this.currentPointer] = { selected: -1, correct: false };
            this.recordAnswer(q.id, false, true);
            if (this.aiInfiniteActive) this.ensureInfiniteGeneration();
            this.timeoutAdvanceTimer = setTimeout(() => this.nextQuestion(), 3000);
        },

        recordAnswer(qId, correct, timedOut) {
            this.history[qId] = {
                correct,
                lastAnsweredAt: new Date().toISOString().split('T')[0],
                ...(timedOut ? { timedOut: true } : {})
            };
            localStorage.setItem('quiz_history', JSON.stringify(this.history));
            this.lastRank = this.rankName;
            localStorage.setItem('quiz_lastRank', this.lastRank);
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

        removeUserPack(pack) {
            if (pack.source !== 'user') return;
            this.packs.splice(this.packs.indexOf(pack), 1);
            this.persistUserPacks();
        },

        showDashboard() {
            this.stopTimer();
            this.aiInfiniteActive = false;
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
            pool = shuffleArray(pool);
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
            const total = this.quizAnsweredTotal || this.activeQuestions.length;
            if (!total) return getDefaultRank();
            const pct = Math.round((this.batchScore / total) * 100);
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

        get quizAnsweredTotal() {
            return this.answers.filter(Boolean).length;
        },

        selectOption(optIdx) {
            if (this.answeredCurrent) return;
            this.answeredCurrent = true;
            this.selectedOptionIdx = optIdx;
            this.stopTimer();

            const q = this.currentQuestion;
            const isCorrect = (optIdx === q.answer);
            this._playFeedback(isCorrect);

            if (isCorrect) this.batchScore++;
            if (this.timerEnabled) {
                this.totalTimeUsed += (this.timerDuration - this.timeLeft);
                this.answeredCount++;
            }
            this.answers[this.currentPointer] = { selected: optIdx, correct: isCorrect };
            this.recordAnswer(q.id, isCorrect);
            if (this.aiInfiniteActive) this.ensureInfiniteGeneration();
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
                if (this.aiInfiniteActive && this.aiInfiniteGenerating) return;
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
            // Sanitize all HTML fields before they hit the DOM (x-html): covers
            // uploads, pasted markdown and AI output alike (AGENTS §6.3).
            parsed = parsed.map(sanitizeQuestion);
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

        setFilterAnswered() {
            localStorage.setItem('quiz_filterAnswered', this.filterOutAnswered ? '1' : '0');
        },

        wikiHost(lang) {
            return lang === 'en' ? 'en.wikipedia.org' : 'pl.wikipedia.org';
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
                if (!data.exportedAt || typeof data.history !== 'object' || data.history === null || Array.isArray(data.history)) {
                    this.showToast(t('invalidSave'));
                    return;
                }
                if (data.userPacks != null && !Array.isArray(data.userPacks)) {
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

        setGeminiKey(key) {
            const trimmed = (key || '').trim();
            this.geminiKey = trimmed;
            if (trimmed) {
                localStorage.setItem('quiz_gemini_key', trimmed);
                this.showToast(t('aiKeySaved'));
            }
            else {
                localStorage.removeItem('quiz_gemini_key');
                this.showToast(t('aiKeyRemoved'));
            }
        },

        openAIGenerate() {
            if (!this.geminiKey) {
                this.showToast(t('aiNoKey'));
                return;
            }
            this.aiTopic = '';
            this.aiCount = 10;
            this.aiUseWiki = true;
            this.aiError = '';
            this.aiModalVisible = true;
        },

        closeAIGenerate() {
            if (this.aiLoading) return;
            this.aiStep = '';
            this.aiModalVisible = false;
        },

        async generateQuestions() {
            if (this.aiLoading) return;
            const topic = (this.aiTopic || '').trim();
            if (!topic) { this.aiError = t('aiNoTopic'); return; }

            this.aiLoading = true;
            this.aiError = '';
            try {
                const lang = currentLang;
                const wiki = this.wikiHost(lang);
                this.aiStep = 'wiki';
                let context = '';
                if (this.aiUseWiki) context = await this.fetchWikiContext(wiki, topic);
                this.aiStep = 'generating';
                const prompt = this.buildAIQuestionPrompt(lang, topic, this.aiCount, context);
                const md = await this.callGemini(prompt);
                this.aiStep = 'parsing';
                const parsed = parseMarkdownWithMarked(md);
                if (!parsed.length) throw new Error(t('aiEmptyResult'));
                const valid = parsed.filter(q => q.answer >= 0 && q.options?.length === 4);
                if (!valid.length) throw new Error(t('aiEmptyResult'));
                valid[0].packName = 'AI: ' + topic;
                this.pushUserPack(valid);
                this.aiModalVisible = false;
            } catch (err) {
                this.aiError = t('aiError') + (err.message || '');
            } finally {
                this.aiStep = '';
                this.aiLoading = false;
            }
        },

        openInfiniteAIModal() {
            if (!this.geminiKey) { this.showToast(t('aiNoKey')); return; }
            this.aiInfiniteModalVisible = true;
        },

        closeInfiniteAIModal() {
            if (this.aiInfiniteLoading) return;
            this.aiInfiniteModalVisible = false;
        },

        async startInfiniteAIQuiz() {
            if (this.aiInfiniteLoading) return;
            const topic = (this.aiInfiniteTopic || '').trim();
            if (!topic) { this.showToast(t('aiNoTopic')); return; }
            this.aiInfiniteLoading = true;
            this.aiInfiniteActive = true;
            this.aiInfiniteSubtopic = '';
            this.aiInfiniteSuggestions = [];
            this.activeQuestions = [];
            try {
                const questions = await this.generateInfiniteBatch();
                if (!questions.length) {
                    this.aiInfiniteActive = false;
                    return;
                }
                const tempPack = { name: 'AI: ' + topic, source: 'ai_infinite', questions, selected: true };
                this.packs = [tempPack, ...this.packs.filter(p => p.source !== 'ai_infinite')];
                this.questionCount = 0;
                this.filterOutAnswered = false;
                this.setFilterAnswered();
                this.startQuizFromPacks();
                this.aiInfiniteModalVisible = false;
                this.generateInfiniteSuggestions();
            } catch (err) {
                this.aiInfiniteActive = false;
                this.showToast(t('aiError') + (err.message || ''));
            } finally {
                this.aiInfiniteLoading = false;
            }
        },

        async generateInfiniteBatch() {
            if (this.aiInfiniteGenerating) return [];
            this.aiInfiniteGenerating = true;
            try {
                const lang = currentLang;
                const wiki = this.wikiHost(lang);
                const topic = this.aiInfiniteSubtopic || this.aiInfiniteTopic;
                const context = this.aiUseWiki ? await this.fetchWikiContext(wiki, topic) : '';
                const recent = this.activeQuestions.slice(-20).map(q => q.question).join('\n- ');
                const count = this.activeQuestions.length === 0 ? 10 : 5;
                const prompt = this.buildAIQuestionPrompt(lang, topic, count, context, recent);
                const md = await this.callGemini(prompt);
                const parsed = parseMarkdownWithMarked(md);
                const valid = parsed.filter(q => q.answer >= 0 && q.options?.length === 4);
                if (!valid.length) throw new Error(t('aiEmptyResult'));
                valid.forEach(q => { q.packName = 'AI: ' + this.aiInfiniteTopic; });
                const shuffled = valid.map(shuffleQuestionOptions);
                if (this.aiInfiniteActive && this.view === 'quiz') {
                    this.activeQuestions.push(...shuffled);
                    if (this.currentPointer === this.activeQuestions.length - 2) this.nextQuestion();
                    return [];
                }
                return shuffled;
            } catch (err) {
                this.showToast(t('aiInfiniteFailed'));
                return [];
            } finally {
                this.aiInfiniteGenerating = false;
            }
        },

        async generateInfiniteSuggestions() {
            if (!this.aiInfiniteActive) return;
            const lang = currentLang;
            const prompt = lang === 'en'
                ? `Topic: "${this.aiInfiniteTopic}"\nCurrent subtopic: "${this.aiInfiniteSubtopic || 'general'}".\nSuggest 3 NEW specific subcategories for further quiz questions.\nReturn ONLY the 3 names, one per line, no bullets, no markdown.`
                : `Temat: "${this.aiInfiniteTopic}"\nAktualna podkategoria: "${this.aiInfiniteSubtopic || 'ogólna'}".\nZasugeruj 3 NOWE konkretne podkategorie dla kolejnych pytań quizu.\nZwróć TYLKO 3 nazwy, każdą w osobnej linii, bez wypunktowania, bez markdown.`;
            try {
                const md = await this.callGemini(prompt);
                const names = (md || '').split('\n').map(s => s.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean).slice(0, 3);
                this.aiInfiniteSuggestions = names;
            } catch {
                this.aiInfiniteSuggestions = [];
            }
        },

        openCategoryModal() {
            this.aiCategoryCustom = '';
            this.aiCategoryModalVisible = true;
        },

        closeCategoryModal() {
            this.aiCategoryModalVisible = false;
        },

        applyInfiniteSubtopic(sub) {
            const next = (sub || '').trim();
            if (!next) return;
            this.aiInfiniteSubtopic = next;
            this.aiCategoryModalVisible = false;
            if (this.aiInfiniteActive && this.view === 'quiz' && !this.aiInfiniteGenerating) {
                this.generateInfiniteBatch();
            }
            this.generateInfiniteSuggestions();
        },

        stopInfiniteQuiz() {
            if (!this.aiInfiniteActive) return;
            this.stopTimer();
            this.view = 'results';
            this.showToast(t('aiInfiniteStopped'));
        },

        ensureInfiniteGeneration() {
            if (!this.aiInfiniteActive || this.aiInfiniteGenerating) return;
            const remaining = this.activeQuestions.length - this.currentPointer;
            if (remaining <= 3) {
                this.generateInfiniteBatch();
            }
        },

        async _wikiExtract(host, title) {
            const url = `https://${host}/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(title)}&exintro=true&explaintext=true&redirects=true&format=json&origin=*`;
            const res = await fetch(url);
            if (!res.ok) return '';
            const data = await res.json();
            const page = Object.values(data.query?.pages || {})[0];
            return page?.extract || '';
        },

        async _wikiSearchExtract(host, topic) {
            const url = `https://${host}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&srlimit=1&format=json&origin=*`;
            const res = await fetch(url);
            if (!res.ok) return '';
            const data = await res.json();
            const first = data.query?.search?.[0];
            if (!first) return '';
            return this._wikiExtract(host, first.title);
        },

        async _wikiOpenSearchExtract(host, topic) {
            const url = `https://${host}/w/api.php?action=opensearch&search=${encodeURIComponent(topic)}&limit=1&format=json&origin=*`;
            const res = await fetch(url);
            if (!res.ok) return '';
            const data = await res.json();
            const title = data?.[1]?.[0];
            if (!title) return '';
            return this._wikiExtract(host, title);
        },

        async fetchWikiContext(host, topic) {
            try {
                let extract = await this._wikiExtract(host, topic);
                if (!extract) extract = await this._wikiSearchExtract(host, topic);
                if (!extract) extract = await this._wikiOpenSearchExtract(host, topic);
                return extract.slice(0, 5000);
            } catch (err) {
                console.warn('Wiki fetch failed:', err);
                return '';
            }
        },

        buildAIQuestionPrompt(lang, topic, count, context, recent) {
            const isEn = lang === 'en';
            const head = isEn
                ? `Generate exactly ${count} multiple-choice quiz questions (single correct answer) about the topic: "${topic}".`
                : `Wygeneruj dokładnie ${count} pytań quizowych jednokrotnego wyboru na temat: "${topic}".`;
            const personaAndRules = isEn
                ? `You are an expert in creating factual knowledge tests.

Rules:
- Exactly 4 answer options per question (1 correct, 3 incorrect).
- Facts must be undisputed and verified against reliable sources (and the provided context, when given); do not invent facts.
- Each incorrect option must be clearly false but plausible, with similar length and consistent grammatical structure as the others.
- The question must not contain or suggest the correct answer.
- Every question MUST include an explanation: why the correct answer is correct and why each incorrect option is false.`
                : `Jesteś ekspertem w tworzeniu testów wiedzy opartych na faktach.

Zasady:
- Dokładnie 4 opcje odpowiedzi na pytanie (1 poprawna, 3 błędne).
- Fakty muszą być bezsporne i zweryfikowane w rzetelnych źródłach (oraz w podanym kontekście, jeśli występuje); nie zmyślaj faktów.
- Każda błędna opcja musi być jednoznacznie fałszywa, ale wiarygodna, o długości i strukturze gramatycznej zbliżonej do pozostałych.
- Pytanie nie może zawierać ani sugerować poprawnej odpowiedzi.
- Każde pytanie MUSI zawierać wyjaśnienie: dlaczego poprawna odpowiedź jest poprawna i dlaczego każda błędna opcja jest fałszywa.`;
            const recall = recent
                ? (isEn
                    ? `Recently asked questions (do not repeat or closely paraphrase these):\n- ${recent}`
                    : `Ostatnio zadane pytania (nie powtarzaj ich ani nie parafrazuj zbyt blisko):\n- ${recent}`)
                : '';
            const format = isEn
                ? `Format:
- H1 (#): "${topic}" package name
- H2 (##): question category, single word
- H3 (###): the question text
- Options: task list (- [x] correct, - [ ] incorrect)
- Explanation: > Explanation: ...`
                : `Format:
- H1 (#): nazwa pakietu "${topic}"
- H2 (##): kategoria pytania, pojedyncze słowo
- H3 (###): treść pytania
- Opcje: lista zadań (- [x] poprawna, - [ ] błędna)
- Wyjaśnienie: > Wyjaśnienie: ...`;
            const wiki = isEn
                ? `Facts to base questions on (verify against them; do not invent facts beyond this context):\n${context}`
                : `Fakty, na których masz oprzeć pytania (zweryfikuj je względem tego kontekstu; nie zmyślaj faktów spoza niego):\n${context}`;
            const out = isEn
                ? `Return ONLY raw markdown (no code fence, no extra text, no numbering).`
                : `Zwróć TYLKO czysty markdown (bez bloku kodu, bez dodatkowego tekstu, bez numeracji).`;
            return [head, personaAndRules, format, context ? wiki : '', recall, out].filter(Boolean).join('\n\n');
        },

        callGemini(prompt) {
            return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent`, {
                method: 'POST',
                headers: {
                    'x-goog-api-key': this.geminiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7 }
                })
            }).then(async (res) => {
                const data = await res.json().catch(() => null);
                const apiMsg = data?.error?.message;
                if (res.status === 429) throw new Error(t('aiRateLimit') + (apiMsg ? ' ' + apiMsg : ''));
                if (res.status === 403) throw new Error(apiMsg || t('aiForbidden'));
                if (!res.ok) throw new Error(apiMsg || 'HTTP ' + res.status);
                const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
                if (!text) throw new Error(t('aiEmptyResult'));
                return text;
            });
        },

    };
}