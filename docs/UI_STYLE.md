# 3Concept Work — wygląd i zasady UI

> Wersja: 0.1 / 2026-09-29 · Status: **propozycja do akceptacji**
> Obowiązuje dla wszystkich ekranów od iteracji 6 (layout).

## 1. Kierunek: „Windows 98, ale do pracy w terenie”

Bierzemy z Windows 98 **język wizualny**, nie kostium. Ten styl wygrywa tym, że
na pierwszy rzut oka widać, co jest przyciskiem, co polem do wpisania, a co tylko
tekstem. To dokładnie to, czego potrzebuje brygadzista na budowie z telefonem w
jednej ręce (PROJECT.md §24).

Czego **nie** robimy:
- nie emulujemy systemu: brak pulpitu z ikonami, przeciągania i minimalizowania okien,
  menu Start, dźwięków, klepsydry,
- nie kopiujemy 1:1 rozmiarów z 1998 roku (tekst 11 px, przyciski 23 px są za małe
  na telefon),
- nie używamy oryginalnych ikon, logo ani nazw Microsoftu.

## 2. Zasada afordancji (najważniejsza)

| Wygląd | Znaczenie |
|---|---|
| **Wypukłe** (jasna krawędź góra-lewo, ciemna dół-prawo) | da się kliknąć: przycisk, zakładka, element nawigacji |
| **Wklęsłe** (odwrotnie) | tu wpisujesz albo tu są dane: pole tekstowe, lista, tabela, pasek postępu |
| **Płaskie** na szarym tle | etykieta, opis, nagłówek — nic się nie stanie po kliknięciu |
| **Granatowy pasek tytułu** | nazwa ekranu / okna, zawsze u góry |

Każdy nowy komponent musi dać się przypisać do jednej z tych kategorii.

## 3. Kolory (tokeny)

| Token | Wartość | Użycie |
|---|---|---|
| `--w-surface` | `#c0c0c0` | tło okien, paneli, przycisków |
| `--w-light` | `#dfdfdf` | wewnętrzna jasna krawędź |
| `--w-highlight` | `#ffffff` | zewnętrzna jasna krawędź, tło pól i list |
| `--w-shadow` | `#808080` | wewnętrzna ciemna krawędź |
| `--w-dark` | `#0a0a0a` | zewnętrzna ciemna krawędź, tekst |
| `--w-title` → `--w-title-end` | `#000080` → `#1084d0` | pasek tytułu aktywnego okna (gradient poziomy) |
| `--w-select` | `#000080` + tekst biały | zaznaczony wiersz, aktywna pozycja |
| `--w-desktop` | `#008080` | tło za oknem na desktopie i na ekranie logowania |

Kolory stanów (zawsze **razem z tekstem i znakiem**, nigdy sam kolor):

| Stan pakietu | Kolor znacznika | Znak |
|---|---|---|
| planowany | szary `#808080` | ○ |
| gotowy do rozpoczęcia | granat `#000080` | ▷ |
| w toku | niebieski `#0050c8` | ▶ |
| **zablokowany** | czerwony `#c00000`, biały tekst | ■ |
| wstrzymany | ciemnożółty `#806000` | ‖ |
| do odbioru | fiolet `#6a1b9a` | ? |
| odebrany | zielony `#006400` | ✓ |
| wymaga poprawek | pomarańcz `#b34700` | ! |
| zamknięty | czarny | ✓✓ |

Tryb ciemny: **brak w MVP** (świadoma decyzja). Szare tło z czarnym tekstem ma
bardzo wysoki kontrast i dobrze czyta się w słońcu. Do rozważenia później tryb
„wysoki kontrast”.

## 4. Typografia

- Tekst: `Tahoma, Verdana, "Segoe UI", system-ui, sans-serif` — ten sam charakter
  co Win98, pełne polskie znaki, bez pobierania fontów.
- Rozmiar bazowy: **16 px na telefonie, 14 px na desktopie**. Nigdy poniżej 13 px.
- Pogrubienie tylko: pasek tytułu, nagłówki grup, domyślny przycisk.
- Liczby w tabelach i rbh: `font-variant-numeric: tabular-nums`, wyrównanie do prawej.
- Font pikselowy: **nie** dla treści. Ewentualnie tylko logo / ekran logowania (decyzja U-03).

## 5. Rozmiary i geometria

| Element | Telefon | Desktop |
|---|---|---|
| minimalny cel dotyku / kliknięcia | **48 px** | 32 px |
| główna akcja ekranu (Zapisz, Zatwierdź) | 56 px, pełna szerokość | 32 px |
| krawędź 3D | 2 px (1 + 1) | 2 px |
| odstęp między polami formularza | 16 px | 12 px |

- Zero zaokrągleń (`border-radius: 0` wszędzie).
- Zero rozmytych cieni. Głębię dają wyłącznie krawędzie 3D.
- Animacje: brak, poza paskiem postępu i ewentualnym miganiem kursora. `prefers-reduced-motion` respektowane.

## 6. Układ ekranów

**Telefon (priorytet):**
- ekran = jedno okno na całą szerokość, bez marginesu „pulpitu”,
- pasek tytułu: przycisk ◄ wstecz, nazwa ekranu, nazwa budowy pod spodem,
- **pasek zadań na dole** jako główna nawigacja, 4 pozycje:
  **Kolejka · Czas · Budowy · Menu**; zawartość zależy od roli,
- główna akcja ekranu przyklejona nad paskiem zadań,
- formularze w jednej kolumnie, grupy jako „groupbox” (ramka z podpisem).

**Desktop:**
- turkusowe tło, na nim jedno główne okno (bez przesuwania),
- u góry okna pasek menu (Plik / Widok / Budowa / Pomoc) tylko tam, gdzie ma sens,
- po lewej drzewo w stylu Eksploratora: budowy → etapy → pakiety,
- po prawej widok szczegółów / tabela (ListView „Szczegóły”),
- **pasek stanu** na dole okna: liczba rekordów, ostatnia aktualizacja, kto,
- pasek zadań na dole ekranu jak na telefonie (spójność nawigacji).

## 7. Komponenty (do zbudowania w `src/components/ui/`)

| Komponent | Uwagi |
|---|---|
| `Window` | ramka 3D + `TitleBar` + treść + opcjonalny `StatusBar` |
| `TitleBar` | gradient, tytuł, opcjonalnie przycisk wstecz / zamknij (× = wróć, nie zamyka aplikacji) |
| `Button` | wypukły; wciśnięty = wklęsły; **domyślny** ma dodatkową czarną ramkę |
| `TextField`, `Select`, `Textarea` | wklęsłe, białe tło |
| `Checkbox`, `Radio` | wizualnie Win98, ale pole trafienia 48 px (cała linia z etykietą) |
| `GroupBox` | `<fieldset>` z podpisem w ramce |
| `Tabs` | zakładki jak w oknie właściwości |
| `ListView` | desktop: tabela z sortowaniem po nagłówku; telefon: lista wierszy, każdy wiersz = cel dotyku |
| `ProgressBar` | segmentowy; rbh wykonane / planowane; powyżej 100 % segmenty na czerwono + liczba |
| `StatusChip` | kolor + znak + tekst stanu (tabela w §3) |
| `Dialog` | modal z paskiem tytułu i ikoną (i / ! / ?) — tylko do potwierdzeń decyzji nieodwracalnych |
| `StatusBar` | dolny pasek okna z polami wklęsłymi |
| `Taskbar` | dolna nawigacja |

Na komunikat po zapisie nie dajemy okienka dialogowego („Zapisano. OK”) — to
dodatkowe kliknięcie. Wystarcza tekst w pasku stanu.

## 8. Ikony

- Styl pikselowy 16×16 / 32×32, ograniczona paleta.
- Źródło: własne albo otwarty zestaw z licencją pozwalającą na użycie komercyjne
  (np. Pixelarticons, MIT). **Nie** używamy ikon wyciętych z Windows.
- Ikona zawsze z podpisem na telefonie. Same ikony tylko tam, gdzie jest tooltip i desktop.

## 9. Dostępność

- Fokus: czarna kropkowana ramka jak w Win98, ale 2 px i z odstępem — ma być widać.
- Kolor nigdy nie jest jedynym nośnikiem informacji (statusy mają znak i tekst).
- Tekst „wyszarzony z wytłoczeniem” (disabled) tylko dla naprawdę nieaktywnych akcji,
  nigdy dla danych, które trzeba przeczytać.
- Kontrast min. WCAG AA; szare tło + czarny tekst ≈ 12:1.

## 10. Implementacja

- Tokeny z §3 i §5 w `src/app/globals.css` w bloku `@theme` (Tailwind v4) —
  zastępują obecne `--background` / `--foreground` i blok dark mode.
- Komponenty własne. Nie dodajemy `98.css` ani podobnej paczki jako zależności
  (rozmiary desktopowe z 1998, trudne do nadpisania), ale można się nią inspirować (MIT).
- Komponenty shadcn/ui z planu — tylko jako logika (dostępność, klawiatura),
  wygląd zawsze według tego dokumentu.
- Każdy komponent ma stronę podglądu w trybie dev (`/dev/ui`), żeby sprawdzać
  go na telefonie.

## 11. Otwarte

| ID | Pytanie |
|---|---|
| U-01 | Czy logo / kolor firmowy 3Concept ma gdzieś wejść (np. zamiast granatu w pasku tytułu)? |
| U-02 | Tło desktopu: klasyczny turkus czy neutralny szary? |
| U-03 | Font pikselowy na ekranie logowania / w logo — tak czy nie? |
| U-04 | Nazwy na pasku zadań dla każdej roli (np. pracownik nie potrzebuje „Budowy”) |
