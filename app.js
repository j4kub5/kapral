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
        lastRank: localStorage.getItem('quiz_lastRank') || 'Szeregowy Głąb',
        history: (() => { try { return JSON.parse(localStorage.getItem('quiz_history') || '{}'); } catch { return {}; } })(),
        toast: { visible: false, message: '', ttl: 0 },
        modal: { visible: false, kind: 'confirm', title: '', message: '', inputValue: '', placeholder: '', confirmLabel: 'OK', cancelLabel: 'Anuluj', resolve: () => {} },
        loading: false,
        palette: localStorage.getItem('quiz_palette') || 'pink',
        helpContent: '',
        showRankList: false,
        editingUsername: false,
        usernameInputValue: '',
        ranks: [
            { name: 'Kapral Papkłiz', min: 100 },
            { name: 'GeneralissiOOOPS', min: 81 },
            { name: 'Major Leniwa Powieka', min: 71 },
            { name: 'Kapitan Luźna Wiedza', min: 61 },
            { name: 'Porucznik Pół-Na-Pół', min: 51 },
            { name: 'Były Szeregowy Głąb', min: 41 },
            { name: 'Chorąży, po prostu Chorąży', min: 31 },
            { name: 'Plutonowy Błąd Pomiarowy', min: 21 },
            { name: 'Sierżant Gdzie', min: 11 },
            { name: 'Szeregowy Głąb', min: 0 },
        ],

        initApp() {
            const savedTheme = localStorage.getItem('quiz_theme');
            if (savedTheme) {
                this.isDark = (savedTheme === 'dark');
            } else {
                this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            this.applyTheme();
            document.documentElement.setAttribute('data-palette', this.palette);
            this.loadBuiltinPacks();
            this.loadHelp();
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

        showToast(message) {
            this.toast.message = message;
            this.toast.visible = true;
            clearTimeout(this.toast.ttl);
            this.toast.ttl = setTimeout(() => { this.toast.visible = false; }, 3000);
        },

        askConfirm(text, title = 'Potwierdzenie') {
            return new Promise((resolve) => {
                this.modal = {
                    visible: true,
                    kind: 'confirm',
                    title,
                    message: text,
                    inputValue: '',
                    placeholder: '',
                    confirmLabel: 'OK',
                    cancelLabel: 'Anuluj',
                    resolve
                };
            });
        },

        askPrompt(text, currentValue = '', title = 'Wprowadź wartość') {
            return new Promise((resolve) => {
                this.modal = {
                    visible: true,
                    kind: 'prompt',
                    title,
                    message: text,
                    inputValue: currentValue,
                    placeholder: '',
                    confirmLabel: 'Zapisz',
                    cancelLabel: 'Anuluj',
                    resolve
                };
            });
        },

        saveUsername() {
            const trimmed = this.usernameInputValue.trim();
            if (trimmed.length > 20) {
                this.showToast('Nazwa użytkownika nie może być dłuższa niż 20 znaków.');
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
            const ok = await this.askConfirm(`Usunąć pakiet "${pack.name}" (${pack.questions.length} pytań)?`, 'Usuń pakiet');
            if (ok) {
                this.packs.splice(idx, 1);
            }
        },

        showDashboard() {
            this.view = 'dashboard';
        },

        startQuizFromPacks() {
            const selected = this.selectedPacks();
            if (selected.length === 0) {
                this.showToast('Wybierz przynajmniej jeden pakiet!');
                return;
            }
            let pool = selected.flatMap(p => p.questions);
            if (this.filterOutAnswered) {
                pool = pool.filter(q => !this.history[q.id]);
            }
            if (pool.length === 0) {
                this.showToast('Brak dostępnych pytań w wybranych pakietach!');
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
                this.showToast('Brak dostępnych pytań w tym pakiecie!');
                return;
            }
            this.currentPointer = 0;
            this.batchScore = 0;
            this.answeredCurrent = false;
            this.selectedOptionIdx = null;
            this.view = 'quiz';
        },

        get currentQuestion() {
            return this.activeQuestions[this.currentPointer] || null;
        },

        get rankName() {
            if (!this.activeQuestions.length) return 'Szeregowy Głąb';
            const pct = Math.round((this.batchScore / this.activeQuestions.length) * 100);
            if (pct === 100) return 'Kapral Papkłiz';
            if (pct >= 81) return 'GeneralissiOOOPS';
            if (pct >= 71) return 'Major Leniwa Powieka';
            if (pct >= 61) return 'Kapitan Luźna Wiedza';
            if (pct >= 51) return 'Porucznik Pół-Na-Pół';
            if (pct >= 41) return 'Były Szeregowy Głąb';
            if (pct >= 31) return 'Chorąży, po prostu Chorąży';
            if (pct >= 21) return 'Plutonowy Błąd Pomiarowy';
            if (pct >= 11) return 'Sierżant Gdzie';
            return 'Szeregowy Głąb';
        },

        packProgress(pack) {
            const answered = pack.questions.filter(q => this.history[q.id]).length;
            return { answered, total: pack.questions.length, newQ: pack.questions.length - answered };
        },

        get dashboardGreeting() {
            const name = this.username || 'Gość';
            return `Cześć, ${name}! Twój stopień kłizowy to ${this.lastRank}`;
        },

        get activeRankIndex() {
            return this.ranks.findIndex(r => this.lastRank === r.name);
        },

        selectOption(optIdx) {
            if (this.answeredCurrent) return;
            this.answeredCurrent = true;
            this.selectedOptionIdx = optIdx;

            const q = this.currentQuestion;
            const isCorrect = (optIdx === q.answer);

            if (isCorrect) this.batchScore++;

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
            event.target.parentElement.innerHTML = '<div class="img-error-placeholder"><i class="fa-solid fa-triangle-exclamation"></i> Błąd Wczytywania Obrazu</div>';
        },

        nextQuestion() {
            if (this.currentPointer < this.activeQuestions.length - 1) {
                this.currentPointer++;
                this.answeredCurrent = false;
                this.selectedOptionIdx = null;
            } else {
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
                    let parsed = [];

                    if (file.name.endsWith('.json')) {
                        parsed = JSON.parse(content);
                        parsed.forEach(q => {
                            if (!q.id) q.id = generateQuestionHash(q.category || 'Ogólne', q.question);
                        });
                    } else {
                        parsed = parseMarkdownWithMarked(content);
                    }

                    if (parsed.length > 0) {
                        const name = parsed[0]?.packName || file.name.replace(/\.(md|json)$/, '');
                        this.packs.push({ name, source: 'user', questions: parsed, selected: true });
                        this.showToast(`Dodano pakiet "${name}" z ${parsed.length} pytaniami!`);
                    } else {
                        this.showToast('Plik nie zawierał prawidłowych pytań.');
                    }
                } catch (err) {
                    this.showToast('Błąd odczytu pliku: ' + err.message);
                }
            };
            reader.readAsText(file);
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
            this.showToast(`Załadowano ${total} pytań z ${loaded.length} pakietów.`);
        },

        async loadHelp() {
            try {
                const res = await fetch('help.md');
                if (res.ok) {
                    this.helpContent = marked.parse(await res.text());
                }
            } catch (e) {
                console.warn('Failed to load help:', e);
            }
        },

        async exportStats() {
            const exportData = {
                username: this.username || 'Anonim',
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
                            description: 'Plik JSON',
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
            const confirmed = await this.askConfirm('Czy na pewno chcesz wyczyścić historię zapamiętanych pytań?', 'Wyczyść historię');
            if (confirmed) {
                this.history = {};
                localStorage.removeItem('quiz_history');
                this.lastRank = 'Szeregowy Głąb';
                localStorage.setItem('quiz_lastRank', this.lastRank);
                this.showToast('Historia została wyczyszczona.');
            }
        }
    };
}
