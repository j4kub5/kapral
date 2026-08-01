// Helper: Hash generation (DJB2) for unique question IDs
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

// Helper: Adaptive Markdown Parser using Marked.js (Flexible hierarchy: H1 = Pack, H2 = Category, H3 = Question)
function parseMarkdownWithMarked(mdText) {
    const tokens = marked.lexer(mdText);
    const questions = [];

    const hasH3 = tokens.some(t => t.type === 'heading' && t.depth === 3);
    const hasH2 = tokens.some(t => t.type === 'heading' && t.depth === 2);

    let currentPackName = 'Pakiet Własny';
    let currentCategory = 'Ogólne';
    let currentQ = null;

    tokens.forEach(token => {
        if (token.type === 'heading') {
            // 3-level hierarchy (H1=Pack, H2=Category, H3=Question)
            if (hasH3) {
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
            // 2-level hierarchy (H1=Category, H2=Question)
            else if (hasH2) {
                if (token.depth === 1) {
                    currentCategory = token.text.trim();
                } else if (token.depth === 2) {
                    if (currentQ && currentQ.question && currentQ.options.length > 0) {
                        questions.push(currentQ);
                    }
                    currentQ = createQuestionObj(currentPackName, currentCategory, token.text.trim());
                }
            }
            // 1-level fallback (H1=Question)
            else if (token.depth === 1) {
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
