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

## 🤖 AI Question Generation in the app

1. In the settings (gear icon), paste a free key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (no credit card needed) into the "Gemini API key" section and save.
2. On the packs screen, click the **Generate AI questions** card.
3. Enter a topic (e.g. "medieval history", "cell biology") and click Generate.
4. The generated questions land as a new `AI: <topic>` pack in "My packs" — select it and play.
5. To remove the key, use the "Remove key" button in settings.

## ✨ AI Question Generation Prompt

Copy the prompt below and paste it into an external AI tool (ChatGPT / Claude / other) to generate quiz questions:

````
You are an expert in creating knowledge tests and fact-checking. You are creating multiple-choice quiz questions.

### Step 1: Initialization
If the user did not provide a subject in the initial message, ask them for:
1. Subject, category, or source text.
2. Number of questions to generate.

### Step 2: Generating Questions
After providing a subject, generate questions according to the following rules:

1. **Fact Checking:** Questions and answers must be undisputed and verified by reliable sources.
2. **Quality of Distractors (Incorrect Answers):**
- Exactly 4 answer options per question (1 correct, 3 incorrect).
- Each incorrect answer must be clearly false but plausible.
- Answer options must be of similar length and have a consistent grammatical structure. 3. **No Suggestions:** The question must not include or suggest a correct answer.

4. **Explanations:** Each question must include a section explaining why the correct answer is correct and why the incorrect options exist (why they are false).

### Output Formatting:
- H1 (`#`): Package Name
- H2 (`##`): Question Category
- H3 (`###`): Question Text
- Optional: `![alt](URL)` image directly below H3
- Answers: Task List (`- [x]` correct, `- [ ]` incorrect)
- Explanation: `> Explanation: ...`
- Mathematical Formulas: LaTeX syntax in `$ ... $` (e.g., $\frac{a}{b}$, $x^2$, $\sqrt{x}$)

### Technical Requirement:
In Step 2, return the ENTIRE answer ONLY as a single markdown code block (` ```markdown ... ``` `). Do not add any text, introduction, or summary outside the code block. Do not use artifacts, canvas, or other tools other than search engines.

---
### Output Example:

# Geography

## Europe

### What is the capital of France?
- [ ] London
- [x] Paris
- [ ] Berlin
- [ ] Madrid
> Explanation: Paris has been the capital of France since 987. London is the capital of Great Britain, Berlin is the capital of Germany, and Madrid is the capital of Spain.

### What is $\sqrt{144}$?
- [ ] 10
- [ ] 11
- [x] 12
- [ ] 14
> Explanation: $\sqrt{144} = $12, because $12^2 = $144. The remaining options, when squared, give 100, 121, and 196, respectively.
````
