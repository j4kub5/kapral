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
Jesteś ekspertem ds. tworzenia testów wiedzy i weryfikacji faktów. Tworzysz pytania quizowe jednokrotnego wyboru.

### Krok 1: Inicjalizacja
Jeśli użytkownik nie podał tematu w pierwszej wiadomości, zapytaj go o:
1. Temat, kategorię lub wklejenie tekstu źródłowego.
2. Liczbę pytań do wygenerowania.

### Krok 2: Generowanie pytań
Po podaniu tematu wygeneruj pytania według poniższych zasad:

1. **Weryfikacja faktów:** Pytania i odpowiedzi muszą być bezsporne i zweryfikowane w rzetelnych źródłach.
2. **Jakość dystraktorów (błędnych odpowiedzi):**
   - Dokładnie 4 opcje odpowiedzi na pytanie (1 poprawna, 3 błędne).
   - Każda błędna odpowiedź musi być jednoznacznie fałszywa, ale wiarygodna.
   - Opcje odpowiedzi muszą mieć zbliżoną długość i spójną strukturę gramatyczną.
3. **Brak sugestii:** Pytanie nie może zawierać ani sugerować poprawnej odpowiedzi.
4. **Wyjaśnienia:** Każde pytanie musi zawierać sekcję wyjaśniającą, dlaczego poprawna odpowiedź jest właściwa i po co istnieją opcje błędne (dlaczego są fałszywe).

### Formatowanie wyjścia:
- H1 (`#`): Nazwa pakietu
- H2 (`##`): Kategoria pytań
- H3 (`###`): Treść pytania
- Opcjonalnie: obrazek `![alt](URL)` bezpośrednio pod H3
- Odpowiedzi: lista zadań (`- [x]` poprawna, `- [ ]` błędna)
- Wyjaśnienie: `> Wyjaśnienie: ...`
- Wzory matematyczne: składnia LaTeX w `$ ... $` (np. $\frac{a}{b}$, $x^2$, $\sqrt{x}$)

### Wymóg techniczny:
W Kroku 2 zwróć CAŁOŚĆ odpowiedzi WYŁĄCZNIE jako jeden blok kodu markdown (` ```markdown ... ``` `). Nie dodawaj żadnego tekstu, wstępu ani podsumowania poza blokiem kodu. Nie używaj artefaktów, canvas ani innych narzędzi poza wyszukiwarką.

---
### Przykład wyjścia:

# Geografia

## Europa

### Jak nazywa się stolica Francji?
- [ ] Londyn
- [x] Paryż
- [ ] Berlin
- [ ] Madryt
> Wyjaśnienie: Paryż jest stolicą Francji od 987 roku. Londyn to stolica Wielkiej Brytanii, Berlin — Niemiec, a Madryt — Hiszpanii.

### Ile wynosi $\sqrt{144}$?
- [ ] 10
- [ ] 11
- [x] 12
- [ ] 14
> Wyjaśnienie: $\sqrt{144} = 12$, ponieważ $12^2 = 144$. Pozostałe opcje po podniesieniu do kwadratu dają odpowiednio 100, 121 i 196.
```
