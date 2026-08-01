# User Guide

## 🎮 How to Play

1. Select question packs by clicking on them (you can select multiple).
2. Set the number of questions in the Start panel (3, 5, 10, 20, 50, or ∞).
3. Optionally enable skipping answered questions (eye icon next to the Start button) to practice only new questions.
4. Click **Start** and answer by clicking on your chosen option.
5. After finishing, you'll see your percentage score and your rank.

## 📥 How to Upload Questions

1. Prepare a file in `.md` (Markdown) or `.json` format.
2. In the "My Packs" section, click "Upload file".
3. The file will appear as a new pack selected for play.
4. Alternatively, click "Paste markdown" and paste the question text directly — it will be converted into a pack.
5. The Markdown format is described in the section below (AI prompt).

## 💾 How to Save Progress

- **Automatically:** answer history is saved in browser storage (`localStorage`).
- **Your packs:** packs you upload or paste in "My Packs" are saved automatically and come back after refreshing the page.
- **Export:** in the History view, click "Download JSON" to save a file with your history.
- **Note:** clearing browser data will delete your history. Export a backup regularly!

## ✨ AI Question Generation Prompt

Copy the prompt below and paste it into ChatGPT / Claude / other AI to generate a compatible `.md` file:

````
Generate a Markdown file with quiz questions compatible with the Kapral Papkłiz app.

Format:
- H1 (#): Pack name
- H2 (##): Question category
- H3 (###): Question text
- Answer options: task list (- [x] correct, - [ ] incorrect)
- Optional: image ![alt](URL) under H3
- Optional: explanation > Explanation: ...
- Math formulas: use $...$ syntax for LaTeX, e.g. $\frac{a}{b}$, $x^2$, $\sqrt{x}$

Example:
# Geography

## Europe

### What is the capital of France?
- [ ] London
- [x] Paris
- [ ] Berlin
- [ ] Madrid
> Explanation: Paris has been the capital of France since 987.

### What is $\sqrt{144}$?
- [ ] 10
- [ ] 11
- [x] 12
- [ ] 14
> Explanation: $\sqrt{144} = 12$, because $12^2 = 144$.

Generate [NUMBER] questions about [CATEGORY].

Return the answer as a markdown code block.
````
