# 3Concept Work — wygląd i zasady UI

> Wersja: 0.2 / 2026-09-29 · Status: **zaakceptowany**
> Kierunek: **„Tabelka rysunkowa + nastawnia”** (zastępuje wersję 0.1 w stylu Win98).
> Wzorzec wizualny: [`docs/ui/preview.html`](ui/preview.html) — otwórz w przeglądarce.

## 1. Idea

Aplikacja ma wyglądać jak **narzędzie inżynierskie**, a nie jak ogólny SaaS.
Źródła języka wizualnego pochodzą ze świata 3Concept:

| Źródło                    | Co bierzemy                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| Dokumentacja techniczna   | papier z delikatną siatką, cienkie precyzyjne linie, **tabelka rysunkowa** w nagłówku ekranu |
| Nastawnia / HMI (ISA-101) | spokojna, szara baza; **kolor tylko wtedy, gdy coś wymaga reakcji**                          |
| Oznaczniki kablowe        | kody (budowa, pakiet, zamówienie, WZ) jako **oznacznik**: ramka + mono                       |
| Win98                     | przycisk zawsze wygląda jak przycisk (ramka, pogrubiony dół, „siada” po wciśnięciu)          |

## 2. Zasady nadrzędne

1. **Normalnie = spokojnie.** Stany, w których wszystko gra, są szare/grafitowe.
   Pomarańcz (alarm) i bursztyn (ostrzeżenie) pojawiają się tylko przy problemie.
   Granat = akcja i „w toku”.
2. **Najpierw to, co wymaga reakcji.** Na ekranach list i budowy nad treścią jest
   pasek alarmu (blokady, przekroczenia), a lista ma filtr „Wymagają reakcji”.
3. **Tabelka rysunkowa niesie dane**, nie jest ozdobą: budowa, obiekt, arkusz (nazwa
   ekranu), ostatnia aktualizacja i kto jej dokonał.
4. **Żadnych przycisków-duchów.** Każdy element klikalny ma ramkę albo wypełnienie.
5. **Stan nigdy nie jest samym kolorem** — zawsze kolor + kształt lampki + tekst.
6. **Telefon pierwszy.** Cele dotyku ≥ 48 px, główna akcja 56 px na całą szerokość.
   Rozmiar zależy od rodzaju wskaźnika, nie od szerokości ekranu: `@media (pointer: coarse)`
   → 48 px, 40 px tylko przy `pointer: fine` (mysz).

## 3. Tokeny

### Kolory

| Token                              | Wartość                           | Użycie                                          |
| ---------------------------------- | --------------------------------- | ----------------------------------------------- |
| `paper`                            | `#eef1f3`                         | tło aplikacji (z siatką 24 px w kolorze `grid`) |
| `grid`                             | `#dfe4e8`                         | linie siatki tła                                |
| `surface`                          | `#ffffff`                         | arkusze, karty, pola                            |
| `ink`                              | `#18222b`                         | tekst, mocne ramki                              |
| `ink-2`                            | `#56626d`                         | tekst pomocniczy, etykiety, stany neutralne     |
| `line`                             | `#c3cbd2`                         | ramki pól, podziały tabel                       |
| `navy` / `navy-dark` / `navy-soft` | `#15325a` / `#0c2140` / `#e7edf5` | akcja główna, zaznaczenie, „w toku”             |
| `alarm` / `alarm-soft`             | `#d9480f` / `#fff0e8`             | blokada, przekroczenie, błąd                    |
| `warn` / `warn-soft`               | `#b86e00` / `#fff6e0`             | ostrzeżenie: ponad plan, poprawki               |
| `ok`                               | `#2f7d45`                         | tylko lampka „odebrany”                         |

Kolor firmowy 3Concept (jeśli zostanie podany) zastępuje `navy`. Tryb ciemny: brak w MVP.

### Typografia

- Tekst: **IBM Plex Sans** (400/500/600/700), fallback `"Segoe UI", system-ui, sans-serif`.
- Kody, liczby, etykiety sekcji: **IBM Plex Mono** (400/500/600), fallback `ui-monospace, Consolas, monospace`.
- Obie z podzbiorem `latin-ext` (polskie znaki), ładowane przez `next/font/google` (self-hosting, bez zapytań do Google w runtime).
- Rozmiary: bazowy 15 px desktop / 16 px pola formularzy na telefonie (brak zoomu iOS),
  tytuł ekranu 19 px / 600, etykieta sekcji 11 px mono uppercase, `letter-spacing: .1em`.
- Liczby (rbh, kwoty, daty w tabelach): mono + `tabular-nums`, wyrównanie do prawej.

### Geometria

- Promień narożników: **0**. Cienie: **brak**.
- Ramki: 1.5 px `ink` dla arkuszy i przycisków, 1 px `line` dla podziałów.
- Przycisk: ramka 1.5 px + dolna 3 px; `:active` → przesunięcie 1 px, dolna 2 px.
- Odstępy: skala 4 / 8 / 12 / 16 / 20 / 24 px.

## 4. Komponenty (`src/components/ui/`)

| Komponent               | Opis                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                | warianty `primary` (granat), `default` (biały z ramką), stan `pressed` (toggle); 48 px przy `pointer: coarse`, 40 px przy `pointer: fine`; akcja główna 56 px     |
| `TitleBlock`            | tabelka rysunkowa: siatka komórek `{label, value, mono?}`; ramka 1.5 px                                                                                           |
| `Tag`                   | oznacznik kodu: mono 600, ramka 1.5 px, „oczko” z lewej                                                                                                           |
| `Status`                | lampka + tekst; warianty `neutral`, `run`, `done`, `warn`, `alarm` (warn/alarm z tłem)                                                                            |
| `AlarmBar`              | pasek nad treścią: status + opis + akcja                                                                                                                          |
| `RbhBar`                | pasek wykonania rbh: skala 0–125 %, kreska planu na 100 %, nadwyżka w `alarm`; pod spodem % i różnica; przy planie 0 pusty z opisem „bez planu rbh”, bez nadwyżki |
| `OptionCard`            | radio jako karta 56 px (wybór pakietu, rodzaju czasu)                                                                                                             |
| `Stepper`               | − wartość + (godziny co 0,5 h) + szybkie wartości                                                                                                                 |
| `TextField`             | 48 px, ramka `line`, fokus granatowy                                                                                                                              |
| `DataTable`             | nagłówki mono uppercase, wiersz z problemem ma znacznik 4 px z lewej w kolorze stanu; na telefonie → lista                                                        |
| `AppBar` (telefon)      | wstecz + tytuł ekranu + `TitleBlock` pod spodem                                                                                                                   |
| `BottomNav` (telefon)   | 4 pozycje z ikoną i podpisem; aktywna: granat + belka 3 px u góry; pozycje wg roli z `src/app/navigation.ts` (§5)                                                 |
| `SheetHeader` (desktop) | znak firmy + `TitleBlock`                                                                                                                                         |

Mapowanie stanów pakietu (`packageStatusView` w `src/components/ui/package-status.ts`):

| Stan                                                      | Wariant `Status`              |
| --------------------------------------------------------- | ----------------------------- |
| planowany, gotowy, do odbioru, zamknięty                  | `neutral`                     |
| wstrzymany (`BLOCKED` z przyczyną o `severity = neutral`) | `neutral`, tekst „Wstrzymany” |
| w toku                                                    | `run`                         |
| odebrany                                                  | `done`                        |
| wymaga poprawek                                           | `warn`                        |
| zablokowany (`BLOCKED`, przyczyna o `severity = alarm`)   | `alarm`                       |

Warunki nakładane na stan:

- **Ponad plan rbh** podnosi do `warn` („Ponad plan · …”) tylko stany aktywne: w toku,
  do odbioru, wymaga poprawek. Odebrany i zamknięty zostają przy wariancie bazowym —
  nadwyżka jest nadal widoczna w kolumnie rbh. Blokady nie przykrywa.
- **Plan = 0** — neutralnie, `RbhBar` pokazuje „bez planu rbh”. Wyjątek: w toku →
  `warn` „Brak planu rbh · w toku”.
- „Wstrzymany” to nie osobny status (decyzja D6 w `docs/PLAN_MVP.md`): jeden `BLOCKED`,
  a o wyglądzie decyduje pole `severity` kategorii przyczyny.

## 5. Układ

**Telefon:** `AppBar` z `TitleBlock` → treść w jednej kolumnie (sekcje z etykietą mono)
→ przyklejony pasek głównej akcji z krótką informacją zwrotną pod przyciskiem
→ `BottomNav` z pozycjami zależnymi od roli (U-04, konfiguracja w `src/app/navigation.ts`):

| Rola               | Pozycje                          |
| ------------------ | -------------------------------- |
| Pracownik          | Kolejka · Czas · Pakiety · Menu  |
| Brygadzista        | Kolejka · Ekipa · Pakiety · Menu |
| Inżynier           | Kolejka · Budowa · Czas · Menu   |
| Kierownik / Zarząd | Kolejka · Budowy · Czas · Menu   |

Profil wybiera najwyższa rola systemowa, w kolejności
`MANAGEMENT`, `CONTRACT_MANAGER` (obie → kierownik/zarząd), `SITE_ENGINEER`, `FOREMAN`, `WORKER`.
`ADMIN` nie zmienia paska, tylko dodaje „Administracja” w Menu (sam `ADMIN` → kierownik/zarząd).
Funkcja na budowie (przypisanie do zespołu) nie wpływa na pasek. Pozycja bez gotowego ekranu
prowadzi do zaślepki „Sekcja w przygotowaniu (Mx)”, nigdy do 404. Konto bez ról nie ma paska
(profil `none`) — widzi tylko ekran „Konto nie ma przypisanej roli. Skontaktuj się z administratorem.”

**Desktop:** tło `paper` z siatką → arkusz (`surface`, ramka `ink`) → `SheetHeader`
→ `AlarmBar` (jeśli są problemy) → pasek narzędzi (filtry + akcja główna)
→ `DataTable` → stopka z podsumowaniem (mono).

## 6. Ikony

Liniowe, 24 px, obrys 1.8 px, `currentColor`. Źródło: własne lub otwarty zestaw
z licencją komercyjną (np. Lucide, ISC). Na telefonie zawsze z podpisem.

## 7. Dostępność

- Fokus: obrys 2 px `navy` z odstępem 2 px, na każdym elemencie interaktywnym.
- Kontrast min. WCAG AA (tekst `ink-2` na `surface` ≈ 6:1).
- `prefers-reduced-motion`: wyłącza przesunięcie przycisku.

## 8. Otwarte

| ID   | Pytanie                                                     |
| ---- | ----------------------------------------------------------- |
| U-01 | Kolor firmowy i logo 3Concept (zastąpią `navy` i znak „3C”) |

Rozstrzygnięte: **U-04** — pozycje `BottomNav` dla ról (§5).
