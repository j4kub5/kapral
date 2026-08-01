// translations.js — i18n dictionary for PL/EN
const APP_VERSION = '0.2.2';
let currentLang = localStorage.getItem('quiz_lang') || 'pl';

const TRANSLATIONS = {
    pl: {
        // Header
        subtitle: 'Zrób 10 quiz-pompek!',
        themeToggleDark: 'Przełącz na jasny',
        themeToggleLight: 'Przełącz na ciemny',
        palettePink: 'Różowy',
        paletteCyan: 'Cyan',
        paletteSand: 'Piasek',
        paletteSlate: 'Łupkowy',
        guest: 'Gość',
        usernamePlaceholder: 'Nazwa użytkownika',
        helpTitle: 'Instrukcja obsługi',
        // Start panel
        packsLabel: 'pakietów,',
        questionsLabel: 'pytań',
        selectAll: 'Zaznacz wszystkie',
        deselectAll: 'Odznacz wszystkie',
        questionsCount: 'Pytań:',
        skipAnswered: 'Pomiń odpowiedziane',
        start: 'Start',
        // Dashboard
        dashboardHint: 'Kliknij na pakiet, aby go zaznaczyć. Możesz wybrać kilka pakietów i ćwiczyć z nich jednocześnie.',
        searchPlaceholder: 'Szukaj pakietów...',
        reload: 'Przeładuj',
        loading: 'Ładowanie pakietów pytań...',
        builtin: 'Wbudowane',
        builtinBadge: 'Wbudowany',
        myPacks: 'Moje pakiety',
        userBadge: 'Własny',
        removePack: 'Usuń pakiet',
        uploadLabel: 'Wgraj plik (.md / .json)',
        pasteMarkdown: 'Wklej markdown',
        pasteMarkdownTitle: 'Wklej pytania (markdown)',
        pasteMarkdownPlaceholder: 'Wklej tutaj treść pytań w formacie markdown...',
        newCount: 'nowych',
        // Quiz
        generalCategory: 'Ogólne',
        questionOf: 'Pytanie {n} z {total}',
        explanation: 'Wyjaśnienie:',
        abort: 'Przerwij',
        next: 'Następne',
        // Results
        seriesFinished: 'Seria zakończona!',
        resultText: 'Oto Twój wynik w tym podejściu:',
        correctAnswers: 'poprawnych odpowiedzi',
        yourRank: 'Twój stopień kłizowy',
        backToMenu: 'Wróć do menu',
        tryAgain: 'Spróbuj ponownie',
        // History
        historyTitle: 'Historia i Statystyki',
        close: 'Zamknij',
        player: 'Gracz:',
        solvedQuestions: 'Rozwiązane pytania:',
        downloadJSON: 'Pobierz JSON',
        clearHistory: 'Wyczyść historię',
        lastAnswer: 'Ostatnia odpowiedź: ',
        correct: 'Poprawna',
        wrong: 'Błędna',
        noHistory: 'Brak zapisanej historii odpowiedzi.',
        // Modal
        confirmTitle: 'Potwierdzenie',
        promptTitle: 'Wprowadź wartość',
        save: 'Zapisz',
        cancel: 'Anuluj',
        // Toasts
        usernameTooLong: 'Nazwa użytkownika nie może być dłuższa niż 20 znaków.',
        removePackConfirm: 'Usunąć pakiet "{name}" ({count} pytań)?',
        removePackTitle: 'Usuń pakiet',
        selectAtLeastOne: 'Wybierz przynajmniej jeden pakiet!',
        noAvailableQuestions: 'Brak dostępnych pytań w wybranych pakietach!',
        noQuestionsInPack: 'Brak dostępnych pytań w tym pakiecie!',
        packAdded: 'Dodano pakiet "{name}" z {count} pytaniami!',
        invalidFile: 'Plik nie zawierał prawidłowych pytań.',
        fileReadError: 'Błąd odczytu pliku: ',
        packsLoaded: 'Załadowano {total} pytań z {count} pakietów.',
        loadedStats: 'Załadowano {total} pytań z {count} pakietów.',
        resetHistoryConfirm: 'Czy na pewno chcesz wyczyścić historię zapamiętanych pytań?',
        resetHistoryTitle: 'Wyczyść historię',
        historyCleared: 'Historia została wyczyszczona.',
        // Export
        anonymous: 'Anonim',
        fileJSON: 'Plik JSON',
        // Image error
        imageLoadError: 'Błąd Wczytywania Obrazu',
        // Ranks
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
        defaultRank: 'Szeregowy Głąb',
        greeting: 'Cześć, {name}! Twój stopień kłizowy to {rank}',
        // Timer
        timer: 'Timer',
        timerOn: 'Włącz timer',
        timerOff: 'Wyłącz timer',
        timePerQuestion: 'Czas na pytanie',
        timeUp: 'Czas minął!',
        seconds: 's',
        timedOutCount: 'Pytania z timeoutem',
        avgTime: 'Średni czas odpowiedzi',
        penalty: 'Kara za timeout',
        penaltyLabel: '-1 pkt za timeout',
    },
    en: {
        // Header
        subtitle: 'Do 10 quiz push-ups!',
        themeToggleDark: 'Switch to light',
        themeToggleLight: 'Switch to dark',
        palettePink: 'Pink',
        paletteCyan: 'Cyan',
        paletteSand: 'Sand',
        paletteSlate: 'Slate',
        guest: 'Guest',
        usernamePlaceholder: 'Username',
        helpTitle: 'User manual',
        // Start panel
        packsLabel: 'packs,',
        questionsLabel: 'questions',
        selectAll: 'Select all',
        deselectAll: 'Deselect all',
        questionsCount: 'Questions:',
        skipAnswered: 'Skip answered',
        start: 'Start',
        // Dashboard
        dashboardHint: 'Click a pack to select it. You can choose multiple packs and practice from them at once.',
        searchPlaceholder: 'Search packs...',
        reload: 'Reload',
        loading: 'Loading quiz packs...',
        builtin: 'Built-in',
        builtinBadge: 'Built-in',
        myPacks: 'My packs',
        userBadge: 'Custom',
        removePack: 'Remove pack',
        uploadLabel: 'Upload file (.md / .json)',
        pasteMarkdown: 'Paste markdown',
        pasteMarkdownTitle: 'Paste questions (markdown)',
        pasteMarkdownPlaceholder: 'Paste the question markdown here...',
        newCount: 'new',
        // Quiz
        generalCategory: 'General',
        questionOf: 'Question {n} of {total}',
        explanation: 'Explanation:',
        abort: 'Quit',
        next: 'Next',
        // Results
        seriesFinished: 'Series finished!',
        resultText: 'Here is your result:',
        correctAnswers: 'correct answers',
        yourRank: 'Your kłiz rank',
        backToMenu: 'Back to menu',
        tryAgain: 'Try again',
        // History
        historyTitle: 'History & Stats',
        close: 'Close',
        player: 'Player:',
        solvedQuestions: 'Solved questions:',
        downloadJSON: 'Download JSON',
        clearHistory: 'Clear history',
        lastAnswer: 'Last answer: ',
        correct: 'Correct',
        wrong: 'Wrong',
        noHistory: 'No saved answer history.',
        // Modal
        confirmTitle: 'Confirmation',
        promptTitle: 'Enter value',
        save: 'Save',
        cancel: 'Cancel',
        // Toasts
        usernameTooLong: 'Username cannot be longer than 20 characters.',
        removePackConfirm: 'Remove pack "{name}" ({count} questions)?',
        removePackTitle: 'Remove pack',
        selectAtLeastOne: 'Select at least one pack!',
        noAvailableQuestions: 'No available questions in selected packs!',
        noQuestionsInPack: 'No available questions in this pack!',
        packAdded: 'Added pack "{name}" with {count} questions!',
        invalidFile: 'The file did not contain valid questions.',
        fileReadError: 'File read error: ',
        packsLoaded: 'Loaded {total} questions from {count} packs.',
        loadedStats: 'Loaded {total} questions from {count} packs.',
        resetHistoryConfirm: 'Are you sure you want to clear the saved answer history?',
        resetHistoryTitle: 'Clear history',
        historyCleared: 'History has been cleared.',
        // Export
        anonymous: 'Anonymous',
        fileJSON: 'JSON file',
        // Image error
        imageLoadError: 'Image Load Error',
        // Ranks
        ranks: [
            { name: 'Corporal Papkłiz', min: 100 },
            { name: 'GeneralissiOOOPS', min: 81 },
            { name: 'Major Lazy Eyelid', min: 71 },
            { name: 'Captain Loose Knowledge', min: 61 },
            { name: 'Lieutenant Half-and-Half', min: 51 },
            { name: 'Former Private Dummkopf', min: 41 },
            { name: 'Ensign, Just Ensign', min: 31 },
            { name: 'Sergeant Measurement Error', min: 21 },
            { name: 'Sergeant What', min: 11 },
            { name: 'Private Dummkopf', min: 0 },
        ],
        defaultRank: 'Private Dummkopf',
        greeting: 'Hello, {name}! Your kłiz rank is {rank}',
        // Timer
        timer: 'Timer',
        timerOn: 'Enable timer',
        timerOff: 'Disable timer',
        timePerQuestion: 'Time per question',
        timeUp: 'Time\'s up!',
        seconds: 's',
        timedOutCount: 'Timed-out questions',
        avgTime: 'Average answer time',
        penalty: 'Timeout penalty',
        penaltyLabel: '-1 pt for timeout',
    }
};

function t(key, vars = {}) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.pl;
    let str = dict[key] || TRANSLATIONS.pl[key] || key;
    Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
    return str;
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('quiz_lang', lang);
    document.documentElement.setAttribute('lang', lang);
}

function toggleLang() {
    setLang(currentLang === 'pl' ? 'en' : 'pl');
    location.reload();
}

function getRanks() {
    return TRANSLATIONS[currentLang]?.ranks || TRANSLATIONS.pl.ranks;
}

function getDefaultRank() {
    return TRANSLATIONS[currentLang]?.defaultRank || TRANSLATIONS.pl.defaultRank;
}
