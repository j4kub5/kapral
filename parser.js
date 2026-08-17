// Helper: Hash generation (DJB2) for unique question IDs
const marked = globalThis.marked;

function generateQuestionHash(category, questionText) {
    const raw = (category + '::' + questionText).toLowerCase().trim().replace(/\s+/g, ' ');
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) + hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return 'q_' + Math.abs(hash).toString(36);
}

// Helper: Create a question object with defaults
function createQuestionObj(packName, category, rawText) {
    return {
        id: generateQuestionHash(category, rawText),
        packName,
        category: category || 'Ogólne',
        question: marked.parseInline(rawText),
        imageUrl: null,
        options: [],
        answer: -1,
        explanation: ''
    };
}

// Helper: Fisher-Yates shuffle — randomize option display order (neutralizes
// the common AI bias of putting the correct answer first). Returns a copy so
// the original pack (and its .md/.json export) stays untouched.
function shuffleQuestionOptions(q) {
    const idx = Array.from({ length: q.options.length }, (_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    const oldAnswer = q.answer;
    const answer = oldAnswer >= 0 ? idx.indexOf(oldAnswer) : -1;
    return { ...q, options: idx.map(i => q.options[i]), answer };
}

// Helper: Adaptive Markdown Parser using Marked.js (Flexible hierarchy: H1 = Pack, H2 = Category, H3 = Question)
function parseMarkdownWithMarked(mdText) {
    const tokens = marked.lexer(mdText);
    const questions = [];

    let currentPackName = 'Pakiet Własny';
    let currentCategory = 'Ogólne';
    let currentQ = null;

    tokens.forEach(token => {
        if (token.type === 'heading') {
            // 3-level hierarchy (H1=Pack, H2=Category, H3=Question)
            if (token.depth === 1) {
                currentPackName = token.text.trim();
            } else if (token.depth === 2) {
                currentCategory = token.text.trim();
            } else if (token.depth === 3) {
                if (currentQ && currentQ.question && currentQ.options.length > 0) {
                    questions.push(currentQ);
                }
                currentQ = createQuestionObj(currentPackName, currentCategory, token.text.trim());
            }
        }
        // Paragraph with image ![alt](url)
        else if (token.type === 'paragraph' && currentQ) {
            const imgMatch = token.text.match(/!\[.*?\]\((.*?)\)/);
            if (imgMatch) {
                currentQ.imageUrl = imgMatch[1];
            }
        }
        // List items (- [x] / - [ ])
        else if (token.type === 'list' && currentQ) {
            token.items.forEach((item) => {
                let text = item.text.trim();

                // Protection against concatenated blockquote (no newline before >)
                const quoteIdx = text.indexOf('>');
                if (quoteIdx !== -1) {
                    const cleanOption = text.substring(0, quoteIdx).trim();
                    const extractedExp = text.substring(quoteIdx + 1)
                        .replace(/^(Wyjaśnienie|Explanation):\s*/i, '')
                        .trim();

                    text = cleanOption;
                    if (!currentQ.explanation && extractedExp) {
                        currentQ.explanation = marked.parseInline(extractedExp);
                    }
                }

                if (item.checked) {
                    currentQ.answer = currentQ.options.length;
                }
                currentQ.options.push(marked.parseInline(text));
            });
        }
        // Blockquote (> Explanation)
        else if (token.type === 'blockquote' && currentQ) {
            const cleanExp = token.text.replace(/^(Wyjaśnienie|Explanation):\s*/i, '').trim();
            currentQ.explanation = marked.parseInline(cleanExp);
        }
    });

    if (currentQ && currentQ.question && currentQ.options.length > 0) {
        questions.push(currentQ);
    }

    return questions;
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function sanitizeQuestion(q) {
    const purify = (s) => (typeof DOMPurify !== 'undefined' && typeof s === 'string') ? DOMPurify.sanitize(s) : s;
    return {
        ...q,
        question: purify(q.question),
        options: Array.isArray(q.options) ? q.options.map(purify) : q.options,
        explanation: q.explanation ? purify(q.explanation) : undefined,
    };
}

function questionsToMarkdown(questions, name) {
    const byCategory = {};
    (questions || []).forEach(q => {
        if (!byCategory[q.category]) byCategory[q.category] = [];
        byCategory[q.category].push(q);
    });

    const lines = [`# ${name}`];
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

    return lines.join('\n');
}

globalThis.parseMarkdownWithMarked = parseMarkdownWithMarked;
globalThis.shuffleQuestionOptions = shuffleQuestionOptions;
globalThis.shuffleArray = shuffleArray;
globalThis.sanitizeQuestion = sanitizeQuestion;
globalThis.questionsToMarkdown = questionsToMarkdown;
