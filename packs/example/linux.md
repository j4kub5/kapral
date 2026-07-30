# Linux

## Podstawy i Komendy

### Które polecenie służy do wyświetlenia ścieżki bieżącego katalogu roboczego?
- [ ] `cd`
- [x] `pwd`
- [ ] `dir`
- [ ] `whoami`
> Wyjaśnienie: Akronim `pwd` oznacza *Print Working Directory*.

### Jaka flaga polecenia `ls` wyświetla pliki ukryte (zaczynające się od kropki)?
- [ ] `-l`
- [ ] `-h`
- [x] `-a`
- [ ] `-r`
> Wyjaśnienie: Flaga `-a` (*all*) nakazuje uwzględnienie wpisów rozpoczynających się od kropki.

### Jakie działanie wywoła wykonanie polecenia `cd ~` w terminalu?
- [ ] Przejście do katalogu głównego systemu (`/`)
- [x] Przejście do katalogu domowego bieżącego użytkownika
- [ ] Przejście do poprzednio odwiedzonego katalogu
- [ ] Wyświetlenie pomocy dotyczącej komendy `cd`
> Wyjaśnienie: Tylda `~` w powłoce reprezentuje ścieżkę do katalogu domowego (np. `/home/user`).

### Które polecenie wypisuje zawartość pliku tekstowego bezpośrednio na standardowe wyjście?
- [x] `cat`
- [ ] `touch`
- [ ] `echo`
- [ ] `nano`
> Wyjaśnienie: `cat` (*concatenate*) służy do łączenia i wyświetlania zawartości plików.

### Jaki skrót klawiszowy wysyła sygnał `SIGINT` i zatrzymuje bieżący proces w terminalu?
- [ ] `Ctrl + Z`
- [ ] `Ctrl + D`
- [x] `Ctrl + C`
- [ ] `Ctrl + X`
> Wyjaśnienie: `Ctrl + C` generuje sygnał przerwania `SIGINT`, powodując natychmiastowe zakończenie większości procesów interaktywnych.

## Uprawnienia i System Plików

### Co oznacza wartość uprawnień $755$ w trybie numerycznym polecenia `chmod`?
- [x] Właściciel: `rwx`, Grupa: `r-x`, Inni: `r-x`
- [ ] Właściciel: `rwx`, Grupa: `rw-`, Inni: `r--`
- [ ] Właściciel: `rw-`, Grupa: `r-x`, Inni: `r-x`
- [ ] Właściciel: `rwx`, Grupa: `rwx`, Inni: `r-x`
> Wyjaśnienie: 7 w systemie ósemkowym to $4+2+1$ (`rwx`), a 5 to $4+0+1$ (`r-x`).

### W którym katalogu zgodnie ze standardem FHS znajdują się globalne pliki konfiguracyjne systemu?
- [ ] `/var`
- [ ] `/usr`
- [x] `/etc`
- [ ] `/opt`
> Wyjaśnienie: Katalog `/etc` przechowuje pliki konfiguracyjne systemu i zainstalowanych programów.

### Które polecenie służy do zmiany właściciela lub grupy pliku?
- [ ] `chmod`
- [x] `chown`
- [ ] `umask`
- [ ] `chgrp`
> Wyjaśnienie: `chown` (*change owner*) zmienia właściciela oraz opcjonalnie grupę pliku lub katalogu.

### Czym charakteryzuje się łącze twarde (*hard link*) w systemie plików Linux?
- [ ] Jest plikiem zawierającym jedynie ścieżkę do innego pliku
- [x] Wskazuje bezpośrednio na ten sam węzeł (*inode*) na dysku co plik źródłowy
- [ ] Przestaje działać natychmiast po usunięciu pierwotnego pliku
- [ ] Może wskazywać na pliki umieszczone na innych partycjach
> Wyjaśnienie: Łącze twarde tworzy dodatkowy wpis w katalogu odwołujący się do tego samego numeru inode.

### Który wirtualny plik urządzeń w `/dev` odrzuca wszystkie zapisane do niego dane?
- [ ] `/dev/zero`
- [x] `/dev/null`
- [ ] `/dev/random`
- [ ] `/dev/tty`
> Wyjaśnienie: `/dev/null` działa jak „czarna dziura” – ignoruje wszelkie skierowane do niego dane wyjściowe.

## Administracja i Systemd

### Które polecenie służy do sprawdzenia statusu usługi (np. `nginx`) zarządzanej przez `systemd`?
- [ ] `service nginx info`
- [x] `systemctl status nginx`
- [ ] `init status nginx`
- [ ] `journalctl status nginx`
> Wyjaśnienie: `systemctl` jest podstawowym narzędziem do sterowania usługami w systemach z `systemd`.

### Jaki sygnał wysyła domyślnie polecenie `kill <PID>` bez podania dodatkowych opcji?
- [ ] `SIGKILL` (9)
- [x] `SIGTERM` (15)
- [ ] `SIGHUP` (1)
- [ ] `SIGSTOP` (19)
> Wyjaśnienie: Domyślnym sygnałem jest `SIGTERM` (15), pozwalający procesowi na bezpieczne wyczyszczenie zasobów przed zamknięciem.

### W którym pliku zdefiniowane są punkty automatycznego montowania systemów plików podczas startu systemu?
- [ ] `/etc/mtab`
- [x] `/etc/fstab`
- [ ] `/etc/exports`
- [ ] `/boot/grub.cfg`
> Wyjaśnienie: Plik `/etc/fstab` (*file systems table*) zawiera listę partycji i dysków montowanych przy rozruchu.

### Jak w powłoce Bash uruchomić polecenie w tle, aby nie blokowało wiersza poleceń?
- [ ] Umieszczając na początku `bg`
- [ ] Umieszczając na końcu `&&`
- [x] Umieszczając na końcu symbol `&`
- [ ] Naciśnięciem `Ctrl + C`
> Wyjaśnienie: Symbol `&` umieszczony na końcu instrukcji uruchamia dany proces w tle (*background*).

### Które narzędzie służy do dynamicznego monitorowania zużycia procesora i pamięci RAM przez procesy w czasie rzeczywistym?
- [ ] `ps aux`
- [ ] `free`
- [x] `top`
- [ ] `vmstat`
> Wyjaśnienie: Polecenie `top` wyświetla ciągle odświeżaną listę najbardziej obciążających system procesów.

## Sieci i Zaawansowane

### Który plik służy do lokalnego odwzorowywania nazw domenowych na adresy IP bez zapytania serwera DNS?
- [x] `/etc/hosts`
- [ ] `/etc/resolv.conf`
- [ ] `/etc/hostname`
- [ ] `/etc/nsswitch.conf`
> Wyjaśnienie: Plik `/etc/hosts` zawiera statyczną tabelę mapowania nazw domenowych na adresy IP.

### Co powoduje użycie operatora potoku (`|`) pomiędzy dwoma poleceniami (`cmd1 | cmd2`)?
- [ ] Wykonuje `cmd2` tylko wtedy, gdy `cmd1` zakończy się sukcesem
- [x] Przekierowuje standardowe wyjście `cmd1` na standardowe wejście `cmd2`
- [ ] Uruchamia oba polecenia jednocześnie w tle
- [ ] Zapisuje wynik `cmd1` do pliku o nazwie `cmd2`
> Wyjaśnienie: Potok (*pipe*) przekazuje strumień danych wyjściowych pierwszego programu jako wejście drugiego.

### Jakie polecenie nadaje plikowi `skrypt.sh` uprawnienia do wykonywania dla wszystkich użytkowników?
- [ ] `chmod +r skrypt.sh`
- [x] `chmod +x skrypt.sh`
- [ ] `chmod 644 skrypt.sh`
- [ ] `chown +x skrypt.sh`
> Wyjaśnienie: Flaga `+x` dodaje prawo wykonywania (*executable*).

### Czym jest przestrzeń jądra (*Kernel Space*) w architekturze systemu Linux?
- [ ] Obszarem dysku przeznaczonym na partycję wymiany (*swap*)
- [ ] Przestrzenią roboczą zarezerwowaną dla aplikacji użytkownika
- [x] Chronionym obszarem pamięci RAM przeznaczonym dla jądra i sterowników
- [ ] Szyfrowanym katalogiem domowym konta `root`
> Wyjaśnienie: *Kernel space* to uprzywilejowany obszar pamięci posiadający pełny dostęp do sprzętu komputera.

### Która kombinacja flag polecenia `tar` pozwala na utworzenie nowego skompresowanego archiwum algorytmem `gzip`?
- [ ] `-xvf`
- [ ] `-tvf`
- [x] `-czvf`
- [ ] `-rzvf`
> Wyjaśnienie: `-c` (*create*), `-z` (*gzip*), `-v` (*verbose*), `-f` (*file*).
