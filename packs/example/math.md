# Matematyka

## Analiza zespolona

### Ile wynosi wartość całki oznaczonej $\int_{-\infty}^{\infty} \frac{\cos x}{x^2 + 1} \, dx$?
- [x] $\frac{\pi}{e}$
- [ ] $\pi e$
- [ ] $\frac{2\pi}{e}$
- [ ] $0$
> Wyjaśnienie: Całkę tę oblicza się metodą rezyduów na płaszczyźnie zespolonej. Wykorzystując lemat Jordana i rezyduum funkcji $f(z) = \frac{e^{iz}}{z^2+1}$ w biegunie prostym $z = i$, otrzymujemy $\int_{-\infty}^{\infty} \frac{e^{ix}}{x^2 + 1} dx = 2\pi i \cdot \text{Res}(f, i) = 2\pi i \cdot \frac{e^{-1}}{2i} = \frac{\pi}{e}$.

## Teoria liczb

### Jaka jest wartość symbolu Legendre'a $\left(\frac{3}{31}\right)$?
- [ ] $1$
- [x] $-1$
- [ ] $0$
- [ ] Niezdefiniowana
> Wyjaśnienie: Z prawa wzajemności rezyduów kwadratowych: $\left(\frac{3}{31}\right) \left(\frac{31}{3}\right) = (-1)^{\frac{3-1}{2} \cdot \frac{31-1}{2}} = (-1)^{1 \cdot 15} = -1$. Ponieważ $31 \equiv 1 \pmod 3$, mamy $\left(\frac{31}{3}\right) = \left(\frac{1}{3}\right) = 1$. Stąd $\left(\frac{3}{31}\right) = -1$.

## Algebra liniowa

### Niech $A \in M_n(\mathbb{C})$ będzie macierzą spełniającą równanie $A^3 = A$. Jakie są możliwe wartości własne macierzy $A$?
- [ ] Tylko $0$ i $1$
- [ ] Tylko $1$ i $-1$
- [x] Wyłącznie ze zbioru $\{-1, 0, 1\}$
- [ ] Dowolne liczby zespolone o module $1$
> Wyjaśnienie: Wielomian anihilujący macierzy to $P(\lambda) = \lambda^3 - \lambda = \lambda(\lambda-1)(\lambda+1)$. Wartości własne macierzy muszą być pierwiastkami jej wielomianu anihilującego.

## Topologia

### Która z poniższych klas funkcji w przestrzeni $C([0,1])$ z metryką supremum jest stosunkowo zwarta na mocy twierdzenia Arzelà-Ascoliego?
- [ ] Dowolny zbiór funkcji ciągłych ograniczonych przez $1$
- [x] Zbiór funkcji jednakowo ciągłych i punktowo ograniczonych
- [ ] Kulka jednostkowa w przestrzeni $L^2([0,1])$
- [ ] Zbiór wszystkich funkcji różniczkowalnych o dodatniej pochodnej
> Wyjaśnienie: Twierdzenie Arzelà-Ascoliego stanowi, że podzbiór $K \subset C(X)$ dla przestrzeni zwartej $X$ jest względnie zwarty wtedy i tylko wtedy, gdy jest jednakowo ciągły oraz punktowo ograniczony.

## Analiza funkcjonalna

### Dla jakiego promienia widmowego $r(A)$ operatora liniowego ograniczonego $A$ w przestrzeni Banacha szereg Neumanna $\sum_{n=0}^{\infty} A^n$ jest zbieżny?
- [x] $r(A) < 1$
- [ ] $r(A) = 1$
- [ ] $r(A) \le \|A\|$ dla każdego $A$
- [ ] Szereg jest zbieżny tylko gdy $A = 0$
> Wyjaśnienie: Szereg operatorowy $\sum A^n$ jest zbieżny do $(I-A)^{-1}$ wtedy i tylko wtedy, gdy promień widmowy $r(A) = \lim_{n\to\infty} \|A^n\|^{1/n} < 1$.

## Geometria różniczkowa

### Ile wynosi krzywizna Gaussa $K$ na dwuwymiarowej sferze $S^2$ o promieniu $R$?
- [ ] $K = 0$
- [ ] $K = \frac{1}{R}$
- [x] $K = \frac{1}{R^2}$
- [ ] $K = -\frac{1}{R^2}$
> Wyjaśnienie: Głównymi krzywiznami sfery o promieniu $R$ w każdym punkcie są $\kappa_1 = \kappa_2 = \frac{1}{R}$. Krzywizna Gaussa jest ich iloczynem: $K = \kappa_1 \cdot \kappa_2 = \frac{1}{R^2}$.

## Równania różniczkowe

### Jaka jest postać rozwiązania ogólnego równania Eulera-Cauchy'ego $x^2 y'' - 2x y' + 2y = 0$ dla $x > 0$?
- [x] $y(x) = C_1 x + C_2 x^2$
- [ ] $y(x) = C_1 e^x + C_2 e^{2x}$
- [ ] $y(x) = C_1 \cos(\ln x) + C_2 \sin(\ln x)$
- [ ] $y(x) = C_1 x^{-1} + C_2 x^{-2}$
> Wyjaśnienie: Podstawiając $y = x^r$, otrzymujemy równanie charakterystyczne $r(r-1) - 2r + 2 = 0 \iff r^2 - 3r + 2 = 0$. Pierwiastkami są $r_1 = 1$ oraz $r_2 = 2$.

## Kombinatoryka

### Ile wynosi wartość liczby Stirlinga drugiego rodzaju $S(n, 2)$ dla $n \ge 2$?
- [ ] $2^n$
- [x] $2^{n-1} - 1$
- [ ] $\frac{n!}{2}$
- [ ] $\binom{n}{2}$
> Wyjaśnienie: Liczba $S(n, k)$ oznacza liczbę podziałów zbioru $n$-elementowego na $k$ niepustych podzbiorów. Ze wzoru jawnego: $S(n, 2) = \frac{1}{2!} (2^n - 2 \cdot 1^n) = 2^{n-1} - 1$.

## Teoria grup

### Ile wynosi rząd najmniejszej nieprzemiennej (nieabelianowej) grupy?
- [ ] $4$
- [ ] $5$
- [x] $6$
- [ ] $8$
> Wyjaśnienie: Grupy rzędów 1, 2, 3 i 5 są cykliczne (więc przemienne). Grupy rzędu 4 ($C_4$ oraz grupa Kleina $V_4$) są również przemienne. Najmniejszą grupą nieprzemienną jest grupa symetryczna $S_3$ rzędu $3! = 6$.

## Probabilistyka

### Jeżeli zmienna losowa $X$ ma rozkład wykładniczy z parametrem $\lambda > 0$, to ile wynosi jej wariancja $\text{Var}(X)$?
- [ ] $\frac{1}{\lambda}$
- [x] $\frac{1}{\lambda^2}$
- [ ] $\lambda^2$
- [ ] $\frac{2}{\lambda^2}$
> Wyjaśnienie: Dla rozkładu wykładniczego $E[X] = \frac{1}{\lambda}$ oraz $E[X^2] = \frac{2}{\lambda^2}$. Wariancja to $\text{Var}(X) = E[X^2] - (E[X])^2 = \frac{2}{\lambda^2} - \frac{1}{\lambda^2} = \frac{1}{\lambda^2}$.
