# User Guide

## 🎮 How to Play

1. Select question packs by clicking on them (you can select multiple).
2. Set the number of questions in the Start panel (3, 5, 10, 20, 50, or ∞).
3. Optionally enable skipping answered questions (eye icon next to the Start button) to practice only new questions.
4. Click **Start** and answer by clicking on your chosen option.
5. After finishing, you'll see your percentage score and your rank.

## 📥 How to Upload Questions

1. Prepare a file in `.md` (Markdown) format.
2. In the "My Packs" section, click "Upload file".
3. The file will appear as a new pack selected for play.
4. Alternatively, click "Paste markdown" and paste the question text directly — it will be converted into a pack.
5. The Markdown format is described in the section below (AI prompt).
6. To download your pack as a `.md` file, click the download icon on its card.

## 💾 How to Save Progress

- **Automatically:** answer history is saved in browser storage (`localStorage`).
- **Your packs:** packs you upload or paste in "My Packs" are saved automatically and come back after refreshing the page.
- **Export:** in the History view, click "Download JSON" to save a complete backup (history + configuration + packs).
- **Restore:** in the History view, click "Restore save" to load a saved file on this (e.g. fresh) instance. History and configuration are restored; you decide about packs in the confirmation dialog.
- **Note:** clearing browser data will delete your history. Export a backup regularly!

## 🎮 Multiplayer (locally)

1. Start the server in a terminal: `cd server && npm install && npm start`.
2. Open the app in your browser at `http://localhost:3000`.
3. Click **Multiplayer** in the top menu, then **Connect**.
4. **Host:** name the room or roll a random one (dice), click "Create room", upload a `.md` pack, and share the room code — or ask players to scan the **QR code** shown in the lobby. Click **Start** once players join. Uncheck "Host plays in the quiz" to only host the game.
5. **Player:** enter the room code (or scan the QR) and click "Join". If you have no name, a random one is assigned — you can change it.
6. The room name and code stay visible on screen throughout the game.
7. The server validates answers and keeps score — you see the final standings on screen.

## ✨ AI Question Generation Prompt

Copy the prompt below and paste it into ChatGPT / Claude / other AI to generate quiz questions:

````
Generate multiple-choice quiz questions.

Format:
- H1 (#): Package name
- H2 (##): Question category
- H3 (###): Question text
- Answer options: task list (- [x] correct, - [ ] incorrect)
- Optional: image ![alt](URL) under H3
- Optional: explanation > Explanation: ...
- Mathematical formulas: use the $...$ syntax for LaTeX formulas, e.g., $\frac{a}{b}$, $x^2$, $\sqrt{x}$

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

First, ask the user which category the questions should be from, and only then .

Verify questions and answers with at least two sources. Pitfalls to avoid: the question contains the answer, the question suggests the answer, the correctness of the answer is debatable.

In the next step, return the answer as a **markdown code block** (no tool use).
````
