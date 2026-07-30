# Instrukcja obsługi

## 🎮 Jak się gra

1. Wybierz pakiety pytań klikając na nie (możesz zaznaczyć kilka).
2. Ustaw liczbę pytań w panelu Start (3, 5, 10, 20, 50 lub ∞).
3. Opcjonalnie włącz pomijanie odpowiedzianych pytań (ikona oka obok przycisku Start), aby powtarzać tylko nowe pytania.
4. Kliknij **Start** i odpowiadaj klikając na wybraną opcję.
5. Po zakończeniu zobaczysz wynik procentowy i swój stopień kłizowy.

## 📥 Jak uploadować pytania

1. Przygotuj plik w formacie `.md` (Markdown) lub `.json`.
2. W sekcji „Moje pakiety" kliknij „Wgraj plik".
3. Plik pojawi się jako nowy pakiet zaznaczony do gry.
4. Format Markdown opisany jest w sekcji poniżej (prompt dla AI).

## 🧮 Wzory matematyczne

Pytania mogą zawierać wzory LaTeX w delimitatorach `$...$`:

- Inline: `$a^2 + b^2 = c^2$`
- Ułamki: `$\frac{1}{\lambda^2}$`
- Indeksy: `$x_1, x^2$`
- Pierwiastki: `$\sqrt{x}$`

Prompt dla AI generujący pytania z wzorami:
```
Użyj składni $...$ dla wzorów matematycznych, np. $\frac{a}{b}$.
```

## 💾 Jak zapisać stan

- **Automatycznie:** historia odpowiedzi zapisywana jest w pamięci przeglądarki (`localStorage`).
- **Eksport:** w widoku Historia kliknij „Pobierz JSON", aby zapisać plik z historią.
- **Uwaga:** wyczyszczenie danych przeglądarki usunie historię. Regularnie eksportuj kopię!

## ✨ Prompt do generowania pytań (AI)

Skopiuj poniższy prompt i wklej do ChatGPT / Claude / innego AI, aby wygenerować kompatybilny plik `.md`:

```Wygeneruj plik Markdown z pytaniami quizowymi kompatybilny z aplikacją Kapral Papkłiz.

Format:
- H1 (#): Nazwa pakietu
- H2 (##): Kategoria pytań
- H3 (###): Treść pytania
- Opcje odpowiedzi: lista zadań (- [x] poprawna, - [ ] błędna)
- Opcjonalnie: obrazek ![alt](URL) pod H3
- Opcjonalnie: wyjaśnienie > Wyjaśnienie: ...

Przykład:
# Geografia

## Europa

### Jak nazywa się stolica Francji?
- [ ] Londyn
- [x] Paryż
- [ ] Berlin
- [ ] Madryt
> Wyjaśnienie: Paryż jest stolicą Francji od 987 roku.

Wygeneruj [LICZBA] pytań z kategorii [KATEGORIA].
```
