import { marked } from 'marked';

globalThis.marked = marked;
await import('../parser.js');

export const parseMarkdown = globalThis.parseMarkdownWithMarked;
export const shuffleQuestionOptions = globalThis.shuffleQuestionOptions;
export const shuffleArray = globalThis.shuffleArray;
