# Instrukcja obsługi

## 🎮 Jak się gra

1. Wybierz pakiety pytań klikając na nie (możesz zaznaczyć kilka).
2. Ustaw liczbę pytań w panelu Start (3, 5, 10, 20, 50 lub ∞).
3. Opcjonalnie włącz pomijanie odpowiedzianych pytań (ikona oka obok przycisku Start), aby powtarzać tylko nowe pytania.
4. Kliknij **Start** i odpowiadaj klikając na wybraną opcję.
5. Po zakończeniu zobaczysz wynik procentowy i swój stopień kłizowy.

## 📥 Jak uploadować pytania

1. Przygotuj plik w formacie `.md` (Markdown).
2. W sekcji „Moje pakiety" kliknij „Wgraj plik".
3. Plik pojawi się jako nowy pakiet zaznaczony do gry.
4. Alternatywnie: kliknij „Wklej markdown" i wklej treść pytań bezpośrednio — zostanie przetworzona na pakiet.
5. Format Markdown opisany jest w sekcji poniżej (prompt dla AI).
6. Aby pobrać swój pakiet jako plik `.md`, kliknij ikonę pobierania na jego karcie.

## 💾 Jak zapisać stan

- **Automatycznie:** historia odpowiedzi zapisywana jest w pamięci przeglądarki (`localStorage`).
- **Twoje pakiety:** pakiety wgrane lub wklejone w sekcji „Moje pakiety" zapisywane są automatycznie i wracają po odświeżeniu strony.
- **Eksport:** w widoku Historia kliknij „Pobierz JSON", aby zapisać kompletny zapis (historia + konfiguracja + pakiety).
- **Przywracanie:** w widoku Historia kliknij „Przywróć zapis", aby wczytać zapisany plik na tej (np. czystej) instancji. Przywracana jest historia i konfiguracja; o pakietach decydujesz w oknie potwierdzenia.
- **Uwaga:** wyczyszczenie danych przeglądarki usunie historię. Regularnie eksportuj kopię!

## 🎮 Multiplayer (lokalnie)

1. Uruchom serwer w terminalu: `cd server && npm install && npm start`.
2. Otwórz aplikację w przeglądarce pod `http://localhost:3000`.
3. Kliknij **Multiplayer** w górnym menu, a następnie **Połącz**.
4. **Gospodarz:** nadaj pokojowi nazwę lub wylosuj ją (kostka), kliknij „Utwórz pokój", wgraj pakiet `.md` i przekaż pozostałym kod pokoju — lub poproś, aby zeskanowali **kod QR** wyświetlany w lobby. Kliknij **Start**, gdy dołączą gracze. Odznacz „Gospodarz gra w quizie", aby tylko prowadzić grę.
5. **Gracz:** wpisz kod pokoju (lub zeskanuj QR) i kliknij „Dołącz". Jeśli nie masz nazwy, zostanie przydzielona losowa — możesz ją zmienić.
6. Nazwa pokoju i kod są widoczne na ekranie przez całą grę.
7. Serwer weryfikuje odpowiedzi i liczy punkty — wynik końcowy widzisz na ekranie.

## 🤖 Generowanie pytań AI w aplikacji

1. W ustawieniach (ikona zębatki) w sekcji „Klucz API Gemini" wklej darmowy klucz z [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (bez karty kredytowej) i zapisz.
2. Na ekranie pakietów kliknij kartę **Generuj pytania AI**.
3. Wpisz temat (np. „średniowiecze", „biologia komórki") i kliknij Generuj.
4. Wygenerowane pytania trafiają jako nowy pakiet `AI: <temat>` w sekcji „Moje pakiety" — zaznacz go i graj.
5. Aby usunąć klucz, użyj przycisku „Usuń klucz" w ustawieniach.

## ✨ Prompt do generowania pytań (AI)

Skopiuj poniższy prompt i wklej do zewnętrznego narzędzia AI (ChatGPT / Claude / inne), aby wygenerować pytania:

```
Wygeneruj pytania quizowe jednokrotnego wyboru.

Format:
- H1 (#): Nazwa pakietu
- H2 (##): Kategoria pytań
- H3 (###): Treść pytania
- Opcje odpowiedzi: lista zadań (- [x] poprawna, - [ ] błędna)
- Opcjonalnie: obrazek ![alt](URL) pod H3
- Opcjonalnie: wyjaśnienie > Wyjaśnienie: ...
- Wzory matematyczne: używaj składni $...$ dla wzorów LaTeX, np. $\frac{a}{b}$, $x^2$, $\sqrt{x}$
- Wyjaśnienie (jeśli dodajesz) musi opisywać nie tylko, dlaczego poprawna odpowiedź jest poprawna, ale też po co istnieje każda z odpowiedzi błędnych (dlaczego są niepoprawne

Przykład:
# Geografia

## Europa

### Jak nazywa się stolica Francji?
- [ ] Londyn
- [x] Paryż
- [ ] Berlin
- [ ] Madryt
> Wyjaśnienie: Paryż jest stolicą Francji od 987 roku. Londyn to stolica Wielkiej Brytanii, Berlin — Niemiec, a Madryt — Hiszpanii, więc żadne z nich nie jest stolicą Francji.

### Ile wynosi $\sqrt{144}$?
- [ ] 10
- [ ] 11
- [x] 12
- [ ] 14
> Wyjaśnienie: $\sqrt{144} = 12$, ponieważ $12^2 = 144$.

Najpierw zapytaj użytkownika o to z jakiej kategorii mają być pytania.

Pytania i odpowiedzi weryfikuj przynajmniej w dwóch źródłach. Pułapki, których masz unikać: pytanie zawiera odpowiedź, pytanie sugeruje odpowiedź, prawidłowość odpowiedzi jest dyskusyjna, odpowiedzi błędne są niejednoznaczne lub tylko „mniej poprawne” niż właściwa — każda musi być wyraźnie fałszywa.

W następnym kroku zwróć odpowiedź jako **blok kodu markdown** (no tool use).
```
