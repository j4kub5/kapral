# Emacs

## Architektura i Konfiguracja Emacsa

### W jakich językach programowania napisany jest rdzeń (core) oraz wyższa logika i pakiety Emacsa?
- [ ] W Pythonie i C++
- [x] W C oraz Emacs Lisp (ELisp)
- [ ] W Rust oraz Common Lisp
- [ ] Wyłącznie w C++
> Wyjaśnienie: Niskopoziomowy rdzeń Emacsa (m.in. pętla zdarzeń, alokacja pamięci, wyrenderowanie tekstu) napisany jest w C, natomiast wyższy poziom logiki oraz pakiety stworzono w języku Emacs Lisp.

### Jaki jest standardowy plik inicjalizacyjny w katalogu `~/.emacs.d/`?
- [ ] `config.json`
- [ ] `emacs.rc`
- [x] `init.el`
- [ ] `settings.lisp`
> Wyjaśnienie: Głównym plikiem konfiguracyjnym w katalogu `~/.emacs.d/` (lub `~/.config/emacs/`) jest `init.el`.

### Czym jest *bufor* (buffer) w środowisku Emacs?
- [ ] Fizycznym plikiem zapisanym na dysku twardym
- [x] Obiektem w pamięci RAM przechowującym tekst do edycji (niekoniecznie powiązanym z plikiem)
- [ ] Odrębnym okienkiem systemowym w menedżerze okien
- [ ] Plikiem dziennika zdarzeń systemowych
> Wyjaśnienie: Bufor to struktura danych w pamięci RAM. Może reprezentować otwarty plik, ale może też istnieć niezależnie (np. bufor `*scratch*` lub `*Messages*`).

### Jak w terminologii Emacsa nazywa się okno programu na poziomie systemu operacyjnego?
- [ ] Window
- [ ] Viewport
- [x] Frame
- [ ] Canvas
> Wyjaśnienie: W nazewnictwie Emacsa okno aplikacji z punktu widzenia systemu operacyjnego to *Frame*. Z kolei podziały ekranu wewnątrz klatki to *Windows*.

## Język i Mechanizmy Emacs Lisp

### Ile wynosi wynik ewaluacji wyrażenia ELisp: `(+ (* 2 3) 4)`?
- [ ] 14
- [x] 10
- [ ] 24
- [ ] 9
> Wyjaśnienie: W notacji prefiksowej najpierw obliczane jest wyrażenie wewnętrzne $(* 2 \times 3) = 6$, a następnie wykonywane jest dodawanie $6 + 4 = 10$.

### Które polecenie w ELisp służy do bezpiecznego ustawiania zmiennych konfiguracyjnych z uwzględnieniem customizacji (`:set`)?
- [ ] `setq`
- [x] `setopt`
- [ ] `defvar`
- [ ] `let`
> Wyjaśnienie: Makro `setopt` w przeciwieństwie do tradycyjnego `setq` wywołuje funkcje `:set` przypisane do opcji zdefiniowanych przez `defcustom`.

### Czym różni się tryb główny (*Major mode*) od trybu pomocniczego (*Minor mode*)?
- [ ] Major mode odpowiada tylko za kolory, a Minor mode za logikę
- [x] W danym buforze może być aktywny tylko jeden Major mode, ale wiele Minor mode naraz
- [ ] Minor mode jest pisany w C, a Major mode w Lisp
- [ ] Major mode działa globalnie dla wszystkich buforów jednocześnie
> Wyjaśnienie: Każdy bufor posiada dokładnie jeden tryb główny (np. `org-mode`, `python-mode`), ale może mieć włączonych wiele trybów pomocniczych (np. `flycheck-mode`, `display-line-numbers-mode`).

## Składnia i Struktura Org-Mode

### Które słowo kluczowe oznacza domyślnie nagłówek z zadaniem do wykonania w podstawowej konfiguracji Org-mode?
- [ ] `WAITING`
- [ ] `NEXT`
- [x] `TODO`
- [ ] `OPEN`
> Wyjaśnienie: Domyślne stany sekwencji zadań w Org-mode to `TODO` (do zrobienia) oraz `DONE` (ukończone).

### Jaką funkcję pełni wpis `#+TITLE: Dokument` umieszczony na początku pliku Org-mode?
- [ ] Jest to komentarz ignorowany przez parser
- [x] Definiuje nagłówek/tytuł dokumentu używany m.in. przy eksporcie
- [ ] Zmienia nazwę pliku na dysku
- [ ] Szyfruje nagłówek pliku
> Wyjaśnienie: Dyrektywy rozpoczynające się od `#+` stanowią metadane i zmienne konfiguracyjne dokumentu Org-mode.

### Jak w składni Org-mode zapisuje się aktywny znacznik czasu (*active timestamp*)?
- [ ] `[2026-05-10 Sun]`
- [x] `<2026-05-10 Sun>`
- [ ] `{2026-05-10 Sun}`
- [ ] `(2026-05-10 Sun)`
> Wyjaśnienie: Nawiasy ostrokątne `<...>` określają aktywny znacznik czasu (pojawiający się w widoku Agenda), natomiast nawiasy kwadratowe `[...]` to znacznik nieaktywny.

### Jak w dokumencie Org-mode poprawnie ograniczyć blok kodu źródłowego w języku Python?
- [x] `#+begin_src python` ... `#+end_src`
- [ ] ```python ... ```
- [ ] `#+code: python` ... `#+end_code`
- [ ] `<code lang="python">` ... `</code>`
> Wyjaśnienie: Bloki kodu źródłowego w Org-mode otwiera się dyrektywą `#+begin_src <język>`, a zamyka `#+end_src`.

## Ekosystem i Rozszerzenia Org-Mode

### Jak nazywa się moduł Org-mode umożliwiający uruchamianie bloków kodu (Literate Programming) i wstawianie wyników do dokumentu?
- [ ] Org Capture
- [ ] Org Agenda
- [x] Org Babel
- [ ] Org Crypt
> Wyjaśnienie: Org Babel odpowiada za pracę z kodem źródłowym osadzonym w plikach Org-mode, umożliwiając jego wykonywanie w wielu językach programowania.

### Do czego służy funkcja Org Capture?
- [ ] Do robienia zrzutów ekranu
- [x] Do szybkiego zapisywania notatek i zadań do określonych plików bez przerywania pracy
- [ ] Do przechwytywania pakietów sieciowych
- [ ] Do automatycznego pobierania nagłówków z sieci WWW
> Wyjaśnienie: Org Capture pozwala na zdefiniowanie szablonów szybkiego wprowadzania pomysłów i zadań z dowolnego miejsca w Emacsie do centralnych plików z notatkami.

### Jak nazywa się widok zagregowany w Org-mode, zbierający zadania i terminy ze skazanych plików?
- [ ] Org Table
- [ ] Org Store
- [x] Org Agenda
- [ ] Org Sparsetree
> Wyjaśnienie: Org Agenda przeszukuje pliki zdefiniowane w zmiennej `org-agenda-files` i generuje widoki kalendarzowe oraz zestawienia zadań.

### Co oznacza struktura `:DRAWER:` w kontekście nagłówków Org-mode?
- [ ] Plik graficzny dołączony do notatki
- [x] Zwijany blok przechowujący metadane (np. `:PROPERTIES:` lub wpisy czasu `:LOGBOOK:`)
- [ ] Łącze do zewnętrznego zasobu sieciowego
- [ ] Formatowanie tekstu jako tabeli
> Wyjaśnienie: Szuflady (*drawers*) pozwalają na ukrywanie szczegółowych metadanych pod nagłówkiem bez zaciemniania treści dokumentu.

## Zaawansowane Funkcje Emacsa i Org-Mode

### Który pakiet w ekosystemie Emacsa służy do tworzenia powiązanej sieci notatek w oparciu o metodykę Zettelkasten?
- [ ] Magit
- [ ] Evil-mode
- [x] Denote
- [ ] Helm
> Wyjaśnienie: Denote (jak również Org-roam) to popularne rozszerzenie do zarządzania wiedzą i tworzenia powiązanych ze sobą notatek w formacie Org/Markdown.

### Jak w tabeli Org-mode odwołać się do wartości z pierwszej i drugiej kolumny w formule matematycznej?
- [ ] `C1` oraz `C2`
- [x] `$1` oraz `$2`
- [ ] `#1` oraz `#2`
- [ ] `[1]` oraz `[2]`
> Wyjaśnienie: W arkuszu kalkulacyjnym Org-mode kolumny oznacza się symbolem dolara i numerem (np. `$1`, `$2`), a wiersze przedrostkiem `@` (np. `@2`).

### Jaka jest różnica między słowami kluczowymi `SCHEDULED` a `DEADLINE` w Org-mode?
- [ ] `SCHEDULED` dotyczy zadań zakończonych, a `DEADLINE` anulowanych
- [x] `SCHEDULED` wyznacza datę rozpoczęcia pracy, a `DEADLINE` ostateczny termin wykonania zadania
- [ ] `SCHEDULED` wysyła e-mail, a `DEADLINE` usuwa plik
- [ ] Nie ma między nimi żadnej różnicy
> Wyjaśnienie: `SCHEDULED` informuje, od kiedy zadanie ma pojawiać się w Agendzie jako gotowe do podjęcia, a `DEADLINE` ostrzega o zbliżającym się ostatecznym terminie.

### Jak nazywa się oficjalne repozytorium pakietów Emacsa zarządzane bezpośrednio przez Free Software Foundation (FSF)?
- [ ] MELPA
- [x] GNU ELPA
- [ ] MARMELADE
- [ ] EmacsForge
> Wyjaśnienie: GNU ELPA (*Emacs Lisp Package Archive*) to oficjalne repozytorium wspierane przez FSF, w którym kod pakietów wymaga przekazania praw autorskich na rzecz FSF.

### Do czego w Emacsie służy podsystem TRAMP?
- [ ] Do automatycznego formatowania kodu Lisp
- [x] Do przezroczystej edycji plików na zdalnych serwerach (np. przez SSH lub z prawami sudo)
- [ ] To silnik renderowania grafiki w terminalu
- [ ] Do zarządzania profilami użytkowników Emacsa
> Wyjaśnienie: TRAMP (*Transparent Remote Access, Multiple Protocols*) pozwala otwierać i edytować pliki znajdujące się na zdalnych maszynach tak, jakby były lokalnymi plikami w systemie.
