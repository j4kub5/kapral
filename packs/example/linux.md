# Linux dla początkujących

## Jądro Linux

### Który mechanizm pozwala dynamicznie śledzić funkcje jądra bez rekompilacji?

* [ ] ptrace
* [x] ftrace
* [ ] auditd
* [ ] syslog

> Wyjaśnienie: ftrace jest wbudowanym frameworkiem do śledzenia działania jądra.

### Który interfejs umożliwia bezpieczne uruchamianie kodu w jądrze bez pisania modułów?

* [ ] kdump
* [ ] initramfs
* [x] eBPF
* [ ] cgroups

> Wyjaśnienie: eBPF pozwala wykonywać zweryfikowane programy wewnątrz jądra.

### Do czego służy mechanizm RCU (Read-Copy-Update)?

* [ ] Zarządzania pamięcią swap
* [ ] Synchronizacji czasu
* [x] Synchronizacji dostępu do współdzielonych danych
* [ ] Obsługi IRQ

> Wyjaśnienie: RCU minimalizuje blokowanie podczas odczytów.

### Który plik zawiera aktualnie uruchomione parametry jądra?

* [ ] /boot/config
* [x] /proc/config.gz
* [ ] /etc/sysctl.conf
* [ ] /lib/modules

> Wyjaśnienie: Jeśli opcja CONFIG_IKCONFIG_PROC jest włączona, konfiguracja dostępna jest w /proc/config.gz.

### Który mechanizm odpowiada za dynamiczne ładowanie modułów jądra?

* [ ] systemd
* [ ] init
* [ ] ldconfig
* [x] kmod

> Wyjaśnienie: Narzędzia modprobe i insmod są częścią pakietu kmod.

## System plików

### Który system plików natywnie obsługuje snapshoty?

* [ ] ext4
* [x] Btrfs
* [ ] XFS
* [ ] FAT32

### Który system plików nie pozwala zmniejszać istniejącego systemu plików?

* [ ] ext4
* [ ] Btrfs
* [x] XFS
* [ ] ext3

### Co oznacza opcja noatime przy montowaniu?

* [ ] Wyłącza prawa dostępu
* [x] Nie aktualizuje czasu ostatniego odczytu plików
* [ ] Wyłącza journaling
* [ ] Montuje tylko do odczytu

### Które narzędzie służy do sprawdzania integralności systemu plików ext4?

* [ ] xfs_repair
* [x] e2fsck
* [ ] btrfs scrub
* [ ] fsrepair

### Który system plików jest Copy-on-Write?

* [ ] ext4
* [ ] XFS
* [x] Btrfs
* [ ] exFAT

## Procesy

### Który sygnał nie może zostać przechwycony przez proces?

* [ ] SIGTERM
* [ ] SIGINT
* [x] SIGKILL
* [ ] SIGUSR1

### Co oznacza stan D procesu w ps?

* [ ] Zombie
* [ ] Uśpiony
* [x] Nieprzerywalne oczekiwanie na I/O
* [ ] Debugowany

### Które polecenie pokazuje drzewo procesów?

* [ ] top
* [ ] htop
* [ ] ps aux
* [x] pstree

### Jakie polecenie zmienia priorytet już uruchomionego procesu?

* [ ] nice
* [x] renice
* [ ] ionice
* [ ] taskset

### Który scheduler jest domyślny dla zwykłych procesów?

* [ ] SCHED_FIFO
* [ ] SCHED_RR
* [x] CFS
* [ ] EDF

## Sieci

### Które polecenie zastępuje ifconfig?

* [ ] route
* [ ] netcfg
* [x] ip
* [ ] nm

### Które narzędzie przechwytuje pakiety?

* [ ] ss
* [ ] ip
* [ ] nc
* [x] tcpdump

### Który katalog zawiera informacje o stosie sieciowym?

* [ ] /etc/net
* [ ] /run/net
* [x] /proc/sys/net
* [ ] /lib/net

### Który protokół wykorzystuje polecenie ping?

* [ ] UDP
* [ ] TCP
* [x] ICMP
* [ ] ARP

### Które polecenie pokazuje gniazda sieciowe?

* [ ] netcat
* [ ] ip addr
* [x] ss
* [ ] traceroute

## Systemd

### Jakie polecenie pokazuje zależności jednostki?

* [ ] systemctl status
* [x] systemctl list-dependencies
* [ ] journalctl
* [ ] loginctl

### Który katalog zawiera jednostki administratora?

* [ ] /usr/lib/systemd/system
* [ ] /run/systemd/system
* [x] /etc/systemd/system
* [ ] /boot/systemd

### Które polecenie pokazuje logi konkretnej usługi?

* [ ] systemctl logs
* [ ] dmesg
* [x] journalctl -u
* [ ] logread

### Co oznacza typ usługi oneshot?

* [ ] Działa stale
* [ ] Uruchamia wiele procesów
* [x] Wykonuje zadanie i kończy pracę
* [ ] Uruchamia się tylko przy starcie

### Która jednostka odpowiada poziomowi runlevel 3?

* [ ] graphical.target
* [x] multi-user.target
* [ ] rescue.target
* [ ] basic.target

## Bezpieczeństwo

### Który framework implementuje Mandatory Access Control w wielu dystrybucjach?

* [ ] PAM
* [ ] nftables
* [x] SELinux
* [ ] auditctl

### Co robi polecenie setcap?

* [ ] Nadaje prawa chmod
* [ ] Tworzy użytkownika
* [x] Nadaje capabilities plikowi
* [ ] Ustawia ACL

### Który moduł PAM blokuje konto po wielu nieudanych logowaniach?

* [ ] pam_rootok
* [x] pam_faillock
* [ ] pam_env
* [ ] pam_exec

### Które polecenie wyświetla kontekst SELinux?

* [ ] lsattr
* [ ] stat
* [x] ls -Z
* [ ] sestatus -v

### Który mechanizm ogranicza zasoby procesu?

* [ ] iptables
* [x] cgroups
* [ ] AppArmor
* [ ] nft

## Kontenery

### Która technologia odpowiada za izolację PID, sieci i mountów?

* [ ] cgroups
* [x] namespaces
* [ ] seccomp
* [ ] PAM

### Co odpowiada za ograniczanie CPU i RAM kontenera?

* [ ] namespaces
* [ ] overlayfs
* [x] cgroups
* [ ] iptables

### Który sterownik Docker wykorzystuje warstwowy system plików?

* [ ] tmpfs
* [ ] aufs2
* [x] overlay2
* [ ] ramfs

### Który runtime jest zgodny ze specyfikacją OCI?

* [ ] kubelet
* [x] runc
* [ ] podman
* [ ] dockerd

### Co oznacza rootless containers?

* [ ] Kontenery bez systemu plików
* [ ] Kontenery tylko do odczytu
* [x] Kontenery uruchamiane bez uprawnień roota
* [ ] Kontenery bez sieci

## Pamięć

### Które polecenie pokazuje użycie pamięci w czasie rzeczywistym?

* [ ] vmstat -d
* [ ] free -c
* [x] vmstat
* [ ] slabtop -o

### Co oznacza OOM Killer?

* [ ] Optymalizator pamięci
* [ ] Bufor dyskowy
* [x] Mechanizm zabijający procesy przy braku pamięci
* [ ] Moduł swap

### Który katalog zawiera informacje o pamięci?

* [ ] /sys/memory
* [ ] /etc/memory
* [x] /proc/meminfo
* [ ] /run/memory

### Co pokazuje polecenie slabtop?

* [ ] Zużycie CPU
* [ ] Bufory sieciowe
* [x] Wykorzystanie alokatora SLAB
* [ ] Obciążenie dysku

### Do czego służy swappiness?

* [ ] Steruje cache DNS
* [ ] Ustawia rozmiar swap
* [x] Określa skłonność do używania swapu
* [ ] Zarządza page cache

## Diagnostyka

### Które polecenie śledzi wywołania systemowe procesu?

* [ ] ltrace
* [x] strace
* [ ] perf
* [ ] tracepath

### Które narzędzie analizuje wydajność CPU na poziomie jądra?

* [ ] vmstat
* [ ] iostat
* [x] perf
* [ ] sar

### Co pokazuje iostat?

* [ ] Tylko pamięć RAM
* [x] Statystyki I/O dysków
* [ ] Ruch sieciowy
* [ ] Temperatury CPU

### Które polecenie pokazuje komunikaty jądra?

* [ ] journalctl
* [ ] tail /var/log/messages
* [x] dmesg
* [ ] sysctl

### Który katalog zawiera informacje o urządzeniach eksportowane przez jądro?

* [ ] /dev/info
* [ ] /etc/sys
* [x] /sys
* [ ] /run/dev

## Różne

### Który harmonogram zadań obsługuje zależności i kalendarze zamiast klasycznego cron?

* [ ] anacron
* [ ] at
* [x] systemd timers
* [ ] fcron

### Który format wykonywalnych plików stosowany jest w Linuksie?

* [ ] PE
* [ ] Mach-O
* [x] ELF
* [ ] COFF

### Jakie polecenie pokazuje zależności bibliotek współdzielonych programu?

* [ ] objdump
* [ ] nm
* [x] ldd
* [ ] strings

### Który mechanizm umożliwia uruchamianie binarek dla innych architektur CPU?

* [ ] chroot
* [x] binfmt_misc
* [ ] qdisc
* [ ] ld-linux

### Które polecenie wyświetla capabilities pliku wykonywalnego?

* [ ] getfacl
* [ ] lsattr
* [x] getcap
* [ ] capshow
