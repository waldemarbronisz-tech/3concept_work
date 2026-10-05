# 3Concept Work — propozycja MVP (odpowiedź na PROJECT.md §35)

> Status: **zaakceptowany, w realizacji** · 2026-09-29\
> Zakres: Milestone 0–3. Delegacje, premie i AI celowo pominięte.

**Faza beta:** na razie żadnych realnych budów ani pracowników. Dane są
fikcyjne (seed developerski) albo dodawane ręcznie w aplikacji. Numer
budowy jest w becie dowolnym unikalnym tekstem; walidację formatu
(D4a) dodamy przed wprowadzeniem realnych budów.

---

## 1. Architektura MVP

**Modularny monolit w jednej aplikacji Next.js.** Jeden deploy, jedna
baza, ale kod podzielony na moduły domenowe z twardymi granicami.
Mikroserwisy nie mają sensu przy tej skali zespołu i danych; granice
modułów pozwolą je wydzielić później, jeśli kiedykolwiek będzie trzeba
(np. Sync Agent z §47 i tak będzie osobną usługą).

| Warstwa                    | Odpowiedzialność                                            | Może importować                    |
| -------------------------- | ----------------------------------------------------------- | ---------------------------------- |
| `app/` (UI, trasy Next.js) | ekrany, formularze, wywołanie akcji                         | `modules/*/actions`, `components`  |
| `modules/*/actions.ts`     | Server Actions / route handlers: sesja → walidacja → serwis | serwis, schematy                   |
| `modules/*/service.ts`     | przypadki użycia: **autoryzacja**, transakcja, audit log    | domena, repozytorium, `core`       |
| `modules/*/domain.ts`      | czysta logika: maszyny statusów, klasy czasu, rbh           | nic poza TS (bez Prisma, bez Next) |
| `modules/*/repository.ts`  | dostęp do danych (Prisma)                                   | `core/db`                          |

Zasady:

- **Autoryzacja w serwisie, nie w UI.** Każda funkcja serwisu zaczyna
  się od `authorize(actor, permission, scope)`. UI tylko ukrywa to,
  czego serwis i tak nie wpuści.
- **Audit log w tej samej transakcji co zmiana** — jawne wywołanie
  `audit.record(...)` w serwisie, nie „magiczny" middleware Prisma
  (middleware nie zna aktora ani powodu zmiany).
- **Domena bez zależności** — testowalna jednostkowo w milisekundach;
  tu siedzi to, co ma być poprawne (statusy, klasyfikacja czasu,
  plan vs wykonanie).
- **Walidacja Zod** — jeden schemat używany w formularzu i w akcji.

### Stack (propozycja)

| Obszar    | Wybór                                                                                                                            | Uzasadnienie                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Framework | Next.js (App Router) + React + TypeScript strict                                                                                 | zgodnie z §21                                                                        |
| Baza      | PostgreSQL + Prisma, `prisma migrate`                                                                                            | zgodnie z §21                                                                        |
| Auth      | **Better Auth** z pluginem `username` — login + hasło, bez e-maila (D2); sesje w bazie, plugin 2FA na przyszłość, adapter Prisma | spełnia §21 bez pisania własnej kryptografii; Auth.js słabo wspiera logowanie hasłem |
| Walidacja | Zod                                                                                                                              | wspólna dla klienta i serwera                                                        |
| UI        | Tailwind CSS + komponenty w stylu shadcn/ui (kod kopiowany, nie zależność)                                                       | szybki, responsywny, duże cele dotykowe                                              |
| Testy     | Vitest (domena + serwisy na testowej bazie), Playwright później                                                                  |                                                                                      |
| CI        | GitHub Actions: lint, typecheck, test, build                                                                                     |                                                                                      |
| Pliki     | S3-kompatybilny storage — **dopiero od M4/M5**                                                                                   | w M0–3 nie ma uploadu                                                                |
| PWA       | manifest + ikony w M0, service worker/offline później                                                                            | nie komplikuje MVP                                                                   |
| Język UI  | tylko polski, teksty w jednym miejscu                                                                                            | brak funkcji „na zapas"                                                              |

Obowiązującym źródłem wyglądu i komponentów UI jest [docs/UI_STYLE.md](UI_STYLE.md) — ma pierwszeństwo przed wzmianką o shadcn/ui w tabeli powyżej.

### Konwencje danych (z §29, doprecyzowane)

- `id` — CUID2 (`String @id @default(cuid())`).
- Znaczniki czasu — `timestamptz` w UTC; **data robocza** (`workDate`)
  jako `@db.Date` liczona w strefie `Europe/Warsaw`.
- Czas pracy — **minuty jako `Int`** (bez błędów zaokrągleń); rbh w UI.
- Normatywy i budżety rbh — `Decimal(10,2)`; pieniądze (od M6) —
  `Decimal(14,2)` lub grosze `Int`.
- Soft-delete (`deletedAt`) tylko dla danych referencyjnych
  (pracownicy, budowy, pakiety, katalog). Wpisy czasu po zatwierdzeniu
  **nie są usuwane**, tylko korygowane z historią.
- Statusy sprzężone z kodem → `enum`. Słowniki, które admin ma zmieniać
  (kategorie przestojów, szablony etapów) → tabele.

---

## 2. Struktura repozytorium

```text
3concept_work/
├── PROJECT.md                  # wymagania (źródło prawdy biznesowej)
├── CLAUDE.md                   # instrukcje dla Claude Code
├── docs/
│   ├── PLAN_MVP.md             # ten dokument
│   └── ROADMAP.md              # roadmapa; decyzje (D1–D10) są w PLAN_MVP.md §4
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                 # seed developerski (fikcyjne dane)
├── src/
│   ├── app/
│   │   ├── (auth)/login/ …
│   │   └── (app)/              # layout z nawigacją zależną od roli
│   │       ├── budowy/[siteNumber]/pakiety/ …
│   │       ├── czas/ …
│   │       └── admin/ …
│   ├── components/ui/          # przyciski, pola, listy — mobile first
│   ├── core/
│   │   ├── db.ts               # klient Prisma
│   │   ├── auth/               # konfiguracja Better Auth, getActor()
│   │   ├── rbac/               # permissions.ts (macierz), authorize.ts
│   │   ├── audit/              # audit.record(tx, …)
│   │   └── time.ts             # strefa Europe/Warsaw, workDate
│   └── modules/
│       ├── employees/
│       ├── sites/              # budowy (= kontrakty), zespoły budów
│       ├── stages/
│       ├── catalog/            # katalog prac + wersje norm
│       ├── work-packages/      # pakiety, uczestnicy, checklisty, blokady
│       ├── time/               # wpisy czasu, zatwierdzanie
│       └── downtime/
│           ├── domain.ts
│           ├── domain.test.ts
│           ├── service.ts
│           ├── service.test.ts
│           ├── repository.ts
│           ├── schemas.ts
│           ├── actions.ts
│           └── components/
├── .github/workflows/ci.yml
├── .env.example
└── package.json
```

Reguła importów (egzekwowana ESLintem, `no-restricted-imports`):
moduł nie importuje wnętrza innego modułu — tylko jego `service.ts`.
`domain.ts` nie importuje niczego z `@prisma/client`, `next` ani `core/db`.

---

## 3. Wstępny model danych — Milestone 0–3

Poniżej encje i kluczowe pola, nie finalny `schema.prisma`. Pola
`createdAt`, `updatedAt`, `createdById`, `updatedById` pominięte —
dostaje je każda encja biznesowa.

### M0 — fundament

**User** — konto logowania (zarządzane przez Better Auth: `User`,
`Session`, `Account`).

- `username` (unikalny, np. `jkowalski`), `name`, `isActive`,
  `mustChangePassword`, `employeeId` (1:1)
- bez e-maila (D2): konto zakłada admin z hasłem tymczasowym,
  pracownik zmienia je przy pierwszym logowaniu; „zapomniałem hasła" =
  reset przez admina/kierownika (zapis w audit logu), bez wysyłki maili

**RoleAssignment** — RBAC z zakresem (decyzja D10)

- `userId`, `role` (`MANAGEMENT | ADMIN | CONTRACT_MANAGER | SITE_ENGINEER | FOREMAN | WORKER`)
- `siteId?` — pusty zakres = globalnie (tylko `MANAGEMENT` i `ADMIN`);
  `CONTRACT_MANAGER`, `SITE_ENGINEER`, `FOREMAN` zawsze z budową;
  `WORKER` bez budowy — jego zakres wyznacza aktywne `SiteAssignment`
- `validFrom`, `validTo?` — historia, kto był odpowiedzialny (§36.1)
- **użytkownik może mieć wiele ról** (np. `MANAGEMENT` + `ADMIN`, albo
  `FOREMAN` na jednej budowie i `WORKER`); uprawnienia się sumują

Role (PROJECT.md §3, z rozdzieleniem „Administrator / Zarząd” — D10):

| Rola               | Kto                 | Zakres                                                                                                             |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `MANAGEMENT`       | zarząd              | globalny odczyt wszystkich kontraktów/budów (w tym koszty), akceptacje na poziomie firmy                           |
| `ADMIN`            | administrator       | tylko konfiguracja systemu: konta, role, słowniki, katalog prac i normy; **bez automatycznego dostępu do kosztów** |
| `CONTRACT_MANAGER` | kierownik kontraktu | przypisane budowy: budżet i realizacja, pakiety, zespół, koszty, raporty                                           |
| `SITE_ENGINEER`    | inżynier budowy     | przypisane budowy: operacyjnie — pakiety, dziennik, rbh, przestoje, dokumenty, odbiory                             |
| `FOREMAN`          | brygadzista         | przypisane budowy: pakiety i zespół (podgląd), raport wykonania, godziny i przestoje brygady                       |
| `WORKER`           | pracownik           | budowy, do których jest przypisany: pakiety bez rbh i kosztów, własne wpisy czasu                                  |

Macierz uprawnień na poziomie obszarów (szczegółowe `Permission` w
iteracji 4). ✔ = pełny dostęp w zakresie roli, **odczyt** = bez zmian,
**przypisane** = budowy z `RoleAssignment.siteId`, **swoje budowy** =
budowy z aktywnym `SiteAssignment`, — = brak. Przypisy pod tabelą.

| Obszar                                          | MANAGEMENT         | ADMIN                          | CONTRACT_MANAGER                                                   | SITE_ENGINEER                                                      | FOREMAN                                                                  | WORKER                         |
| ----------------------------------------------- | ------------------ | ------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------ |
| Konta i role                                    | —                  | ✔                              | —                                                                  | —                                                                  | —                                                                        | —                              |
| Reset haseł                                     | —                  | ✔                              | zawężony ¹                                                         | —                                                                  | —                                                                        | —                              |
| Słowniki, szablony etapów, katalog prac i normy | odczyt             | ✔                              | odczyt                                                             | odczyt                                                             | —                                                                        | —                              |
| Budowy / kontrakty                              | odczyt (wszystkie) | tylko lista (do przypisań ról) | przypisane                                                         | przypisane, odczyt                                                 | przypisane, odczyt                                                       | swoje budowy, odczyt ³         |
| Pakiety, etapy, blokady                         | odczyt             | —                              | przypisane                                                         | przypisane                                                         | przypisane: raport wykonania                                             | swoje budowy, odczyt bez rbh ³ |
| Zespół budowy                                   | odczyt             | —                              | przypisane                                                         | przypisane                                                         | przypisane, odczyt                                                       | —                              |
| Wpisy czasu i przestoje                         | odczyt             | —                              | przypisane: odczyt, zatwierdzanie, korekta z powodem; własne wpisy | przypisane: odczyt, zatwierdzanie, korekta z powodem; własne wpisy | przypisane: odczyt brygady, **zatwierdzanie dnia ekipy**; własne wpisy ⁴ | własne wpisy czasu ³           |
| Koszty i budżet                                 | odczyt             | **—**                          | przypisane                                                         | —                                                                  | —                                                                        | **—**                          |
| Akceptacje na poziomie firmy (§49)              | ✔                  | —                              | —                                                                  | —                                                                  | —                                                                        | —                              |
| Audit log ²                                     | pełny odczyt       | tylko `SYSTEM`                 | historia rekordu                                                   | historia rekordu                                                   | —                                                                        | —                              |

¹ **Reset haseł przez `CONTRACT_MANAGER`** — tylko użytkownicy przypisani
do jego budów (zespół budowy albo rola na tej budowie), którzy mają
**wyłącznie** role spośród `WORKER`, `FOREMAN`, `SITE_ENGINEER`. Konta z
rolą `MANAGEMENT`, `ADMIN` lub `CONTRACT_MANAGER` resetuje tylko `ADMIN`.
Implementacja w iteracji 3/4 z testami odmowy (kierownik nie resetuje
hasła innego kierownika, admina, zarządu ani pracownika spoza swoich budów).

² **Audit log** — każde zdarzenie ma kategorię `SYSTEM` (konta, role,
słowniki, konfiguracja), `OPERATIONAL` (realizacja, czas pracy, przestoje)
albo `FINANCIAL` (koszty, budżety), żeby dało się filtrować dostęp:

- `MANAGEMENT` — pełny odczyt, globalnie;
- `ADMIN` — tylko `SYSTEM`; bez zdarzeń z danymi czasu pracy i kosztów;
- `CONTRACT_MANAGER`, `SITE_ENGINEER` — tylko historia pojedynczego
  rekordu w swoim zakresie (zakładka „Historia” na ekranie rekordu), bez
  globalnego widoku; `SITE_ENGINEER` bez zdarzeń `FINANCIAL` (nie widzi kosztów).

³ **`WORKER`** — zakres przez przypisanie do budowy (`SiteAssignment`).
Czyta pakiety swoich budów: kod, nazwa, stan i własne godziny — **bez
budżetów rbh i kosztów** (UI nie pokazuje mu `RbhBar` ani planu rbh).
Zapisuje tylko własne wpisy czasu.

⁴ **Czas pracy (D3)** — każdy, kto ma konto, wpisuje **tylko własne** godziny
(`time.write` w zakresie `own`); brygadzista zatwierdza dzień ekipy na swojej
budowie (`time.approve`, zakres budowy), inżynier i kierownik zatwierdzają i
korygują po zatwierdzeniu z powodem (`time.manage`). **Nikt nie zatwierdza własnych
wpisów** — godziny brygadzisty zatwierdza inżynier lub kierownik tej budowy (it. 14).
Wpisywania godzin za innego pracownika celowo nie ma — patrz D5.

Zatwierdzanie godzin zależy od D5; akceptacje firmowe dostaną konkretne
progi razem z modułami (zamówienia, delegacje) — tu nie są ustalane.

**Użytkownik bez ról** nie ma nawigacji ani dostępu do danych. Po
zalogowaniu widzi tylko ekran „Konto nie ma przypisanej roli. Skontaktuj
się z administratorem.” (`navigationFor([])` → profil `none`).

**Nawigacja nie wynika z `SiteAssignment`.** Profil dolnego paska
(docs/UI_STYLE.md §5) wybiera najwyższa rola systemowa:
`MANAGEMENT > CONTRACT_MANAGER > SITE_ENGINEER > FOREMAN > WORKER`;
`ADMIN` nie zmienia paska, tylko dodaje „Administracja” w Menu (sam
`ADMIN` → profil kierownik/zarząd). Implementacja: `src/app/navigation.ts`.

Uprawnienia (`Permission`) w M0 jako **macierz w kodzie**
(`core/rbac/permissions.ts`), nie w bazie. Tabela uprawnień
granularnych dopiero, gdy pojawi się realna potrzeba (§3 „w przyszłości").

**AuditLog** — tylko INSERT

- `at`, `actorUserId`, `action` (np. `time_entry.approve`),
  `entityType`, `entityId`, `siteId?`, `before` (JSONB), `after` (JSONB), `reason?`
- `category` (`SYSTEM | OPERATIONAL | FINANCIAL`) — ustalana w `audit.record()`
  z rodzaju akcji, podstawa filtra dostępu (przypis ² macierzy)
- indeks: (`entityType`, `entityId`), (`siteId`, `at`), (`category`, `at`)
- docelowo rola bazodanowa aplikacji bez UPDATE/DELETE na tej tabeli

**AppSetting** — `key`, `value` (JSONB) — parametry administracyjne (§2 pkt 11)

### M1 — ludzie i budowy

**Employee** — dane służbowe osoby

- `firstName`, `lastName`, `position`, `employmentStatus`, `phone?`
- każdy pracownik ma konto (D3), ale `Employee` pozostaje osobną encją:
  konto to logowanie (można je zablokować), a pracownik to dane
  służbowe i historia pracy, które zostają po odejściu z firmy

**Site** (budowa = kontrakt, D4)

- `siteNumber` — **istniejący numer budowy 3Concept, unikalny, klucz
  biznesowy w URL-ach** (§41)
- `name`, `client` (tekst w MVP), `location`, `status`
- `startDate`, `endDate?`, `laborBudgetHours?` (`Decimal`), `notes?`
- Jeden kontrakt to jedna budowa, więc §4 upraszcza się do
  FIRMA → BUDOWA → ETAP → PAKIET, a z listy §28 znika osobny
  `Contract`. Gdyby kiedyś kontrakt objął kilka budów, dołożenie
  nadrzędnego `Contract` to jedna migracja.

**SiteAssignment** — kto pracuje na budowie

- `siteId`, `employeeId`, `validFrom`, `validTo?`

(`RoleAssignment` mówi, co ktoś **może** w systemie; `SiteAssignment`,
kto fizycznie jest w zespole budowy.)

### M2 — realizacja

**StageTemplate** — słownik konfigurowalnych etapów (§5.2): `name`, `order`, `isActive`

**Stage** — etap na budowie: `siteId`, `name`, `order`, `templateId?`

**WorkCatalogItem** — `code` (unikalny), `category`, `name`, `description`, `unit`, `isActive`

**WorkNormVersion** — `catalogItemId`, `hoursPerUnit` (`Decimal`),
`source` (tekst), `validFrom`, `validTo?`. Nigdy nie nadpisywana —
zmiana normy = nowa wersja (§6.2).

**WorkPackage**

- `siteId`, `stageId?`, `code` (unikalny w budowie), `name`, `description`
- `area?` (pole/obszar, np. „Q3"), `catalogItemId?`,
  `normVersionId?` — **zamrożona** wersja normy użyta przy planowaniu
- `unit`, `quantity`, `plannedHours` (`Decimal`) — liczone z normy
  lub wpisane ręcznie
- `status`, `priority`, `responsibleEmployeeId?`
- `plannedStart?`, `plannedEnd?`, `actualStart?`, `actualEnd?`
- `definitionOfDone?` (tekst)

**WorkPackageStatusChange** — `packageId`, `from`, `to`, `at`, `byUserId`, `reason?`
(osobna tabela, bo historia statusów będzie odpytywana w analityce;
audit log jest do śledzenia, nie do raportów)

**WorkPackageParticipant** — `packageId`, `employeeId`, `validFrom`, `validTo?`
— zmiana składu brygady nie kasuje historii (§9)

**ChecklistItem** — `packageId`, `text`, `order`, `doneAt?`, `doneById?`
(bez osobnej encji `Checklist` — jeden pakiet = jedna lista)

**PackageBlock** — blokada (§39)

- `packageId`, `reasonCategoryId` → `DowntimeCategory`, `comment?`
- `reportedAt`, `reportedById`, `expectedImpact?`, `resolverEmployeeId?`
- `resolvedAt?`, `resolvedById?`

Statusy pakietu (enum):
`PLANNED → READY → IN_PROGRESS ⇄ BLOCKED → TO_ACCEPT → ACCEPTED → CLOSED`,
plus `REWORK` (wymaga poprawek) wracający do `IN_PROGRESS`.
Dozwolone przejścia zdefiniowane w `work-packages/domain.ts` i
pokryte testami. Decyzja D6: nie ma osobnego statusu „wstrzymany” —
to `BLOCKED` z przyczyną, której kategoria ma `severity = NEUTRAL`
(UI pokazuje wtedy neutralne „Wstrzymany” zamiast alarmu).

### M3 — rbh i przestoje

**TimeEntry** — jeden wpis = jedna osoba, jeden dzień, jeden kontekst

- `employeeId`, `workDate` (`Date`), `minutes` (`Int`)
- `siteId` (wymagane), `packageId?`
- `timeClass`: `PRODUCTIVE | AUXILIARY | DOWNTIME | SUBSTITUTE` (§38)
- `plannedPackageId?` — dla `SUBSTITUTE`: pakiet, który był planowany i
  zablokowany (§38.4); `blockId?` → `PackageBlock`
- `downtimeId?` — dla `DOWNTIME`
- `note?`
- `status`: `DRAFT | SUBMITTED | APPROVED | REJECTED`
- `enteredById` (kto wpisał — zwykle sam pracownik, D3; brygadzista
  tylko przy korekcie), `approvedById?`, `approvedAt?`, `rejectionReason?`

Reguły domenowe (testowane): `PRODUCTIVE` wymaga `packageId`;
`SUBSTITUTE` wymaga `plannedPackageId`; `DOWNTIME` wymaga `downtimeId`;
suma minut osoby w dniu ≤ limit z `AppSetting`; wpis `APPROVED` można
zmienić tylko korektą z powodem → audit log.

**DowntimeCategory** — słownik (§8): `name`, `isActive`, `order`,
`severity` (`ALARM | NEUTRAL`, domyślnie `ALARM`; `NEUTRAL` = „wstrzymany”, D6)

**Downtime** — zdarzenie przestoju

- `siteId`, `packageId?`, `categoryId`, `description`
- `startedAt`, `endedAt?`, `reportedById`, `status` (`OPEN | RESOLVED`),
  `resolution?`

Czas ludzi w przestoju **nie jest wpisywany drugi raz** w `Downtime` —
to wpisy `TimeEntry` z `timeClass = DOWNTIME` wskazujące na przestój.
Jedna informacja, dwa zastosowania (§1).

**Plan vs wykonanie** — w M3 bez osobnych tabel: zapytania agregujące
`TimeEntry` (APPROVED, `PRODUCTIVE`) per pakiet / etap / budowa
vs `plannedHours`. Widoki materializowane dopiero, gdy będzie wolno.

### Świadomie poza M0–3

Photo, Attachment, Document, DeliveryNote, Supplier, Order, Expense,
BusinessTrip, Advance, Bonus*, SiteDiaryEntry, Report, Notification —
zgodnie z roadmapą (§30, §35 pkt 6).

---

## 4. Decyzje potrzebne przed implementacją

Blokujące — potrzebne **przed** wskazanym milestone'em.

**Podjęte 2026-09-29:**

| #   | Decyzja                       | Ustalenie                                                                                                                                                                                                                                                |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Baza lokalna do developmentu  | **Docker Desktop** + `docker-compose.yml` (Postgres, później storage plików)                                                                                                                                                                             |
| D2  | Logowanie                     | **Login + hasło, bez e-maila**; konta i reset haseł przez admina/kierownika                                                                                                                                                                              |
| D3  | Konta pracowników             | **Każdy pracownik ma konto** i sam wpisuje swoje godziny; brygadzista zatwierdza                                                                                                                                                                         |
| D4  | Kontrakt ↔ budowa             | **1 kontrakt = 1 budowa**; jedna encja `Site` z numerem budowy                                                                                                                                                                                           |
| D6  | „Wstrzymany” vs „zablokowany” | **Jeden status `BLOCKED`** + kategoria przyczyny z polem `severity` (`ALARM \| NEUTRAL`); `NEUTRAL` = „wstrzymany” (bez osobnego `ON_HOLD`)                                                                                                              |
| D10 | Role zarządu i admina         | **`MANAGEMENT` (zarząd) i `ADMIN` rozdzielone**: zarząd — globalny odczyt i akceptacje firmowe; admin — tylko konfiguracja, bez automatycznego dostępu do kosztów. Użytkownik może mieć wiele ról, uprawnienia się sumują (model: `RoleAssignment` w M0) |

**Otwarte:**

| #   | Decyzja                                                                                                                                   | Przed                                           | Moja rekomendacja                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D4a | **Format numeru budowy** — przykładowe numery (np. „075"? z rokiem?)                                                                      | przed realnymi budowami (w becie dowolny tekst) | przyjąć istniejący format bez zmian, walidacja wg przykładów                                                                                                                                                                                                                                                                                                                                                    |
| D5  | **Workflow zatwierdzania czasu** — kto zatwierdza (brygadzista? inżynier?), czy pracownik może edytować po wysłaniu, termin zatwierdzenia | M3                                              | pracownik wpisuje → brygadzista zatwierdza dzień ekipy → inżynier widzi i może skorygować z powodem. **Wpis godzin za innego pracownika (np. bez telefonu) — niezaimplementowany; czy w ogóle potrzebny, rozstrzyga D5.** Ustalone (2026-10-05): **nikt nie zatwierdza własnych wpisów**, także mając `time.approve`; godziny brygadzisty zatwierdza inżynier lub kierownik tej budowy (implementacja w it. 14) |
| D7  | **Granulacja czasu** — 15 min, 30 min, 1 h? Nadgodziny w MVP?                                                                             | M3                                              | 30 min; nadgodziny poza MVP (to temat płacowy — §32 pkt 6)                                                                                                                                                                                                                                                                                                                                                      |
| D8  | **Format kodu pakietu** i kto zakłada pakiety                                                                                             | M2                                              | `<nr budowy>-<etap>-<nr>`, np. `075-OW-012`; zakłada inżynier/kierownik                                                                                                                                                                                                                                                                                                                                         |
| D9  | **Hosting** (produkcja)                                                                                                                   | przed pilotażem, nie blokuje M0                 | VPS w UE (np. Hetzner/OVH) + Docker Compose — RODO i łatwy dostęp dla Sync Agenta                                                                                                                                                                                                                                                                                                                               |

Nieblokujące dla M0–3 (z §34/§51): storage plików, Trello, HRF,
Subiekt/KSeF, struktura dysku, Excel dziennika, premie, delegacje, RODO
(ale analiza RODO **przed produkcją**).

---

## 5. Plan iteracji

Każda iteracja kończy się: lint + typecheck + testy + build zielone,
commit na osobnej gałęzi, krótkie podsumowanie (zmienione pliki,
migracje, nowe zmienne środowiskowe).

| #   | Iteracja                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Milestone | Wynik do sprawdzenia                       | Stan                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------ | --------------------------------------------------------- |
| 1   | Szkielet: Next.js, TS strict, ESLint (+ reguły importów), Prettier, Vitest, CI w GitHub Actions, `.env.example`                                                                                                                                                                                                                                                                                                                                                                  | M0        | pusta strona, zielone CI                   | ✅ #2                                                     |
| 2   | PostgreSQL w Dockerze (`docker-compose.yml`), Prisma 7 (`prisma.config.ts`, adapter `pg`, klient generowany do `src/generated/prisma`), pierwsza migracja (`AppSetting`), `seed.ts`, testowa baza `c3work_test` (migrowana przed testami, Postgres jako serwis w CI)                                                                                                                                                                                                             | M0        | `npm run db:reset` działa                  | ✅ #5                                                     |
| 3   | Auth: Better Auth + plugin `username` (e-mail syntetyczny `<login>@konto.3concept.local`), logowanie i wylogowanie, sesja 14 dni w bazie, wymuszona zmiana hasła tymczasowego (`/zmien-haslo`), blokada konta (`isActive`), `core/auth/accounts.ts`: założenie konta i reset hasła (funkcje serwerowe; ekran admina z `authorize()` w iteracji 7)                                                                                                                                | M0        | logowanie kontem z seeda                   | ✅ #6                                                     |
| 4   | RBAC: enum `Role` i `RoleAssignment` (zakres `siteId`, `validFrom/validTo`; relacja do `Site` w it. 8), `core/rbac`: macierz `PERMISSIONS` (obszar.czynność × zakres global/site/own), `authorize()`/`can()`, `canResetPassword()` (przypis ¹), aktor z aktywnymi rolami (`getActor`), `SYSTEM_ACTOR` dla seeda; testy odmów (brygadzista nie widzi cudzej budowy, admin bez kosztów, reset haseł). Zakres `WORKER` przez `SiteAssignment` dojdzie w it. 8 (do tego czasu `own`) | M0        | testy: brygadzista nie widzi cudzej budowy | ✅ #10, #11                                               |
| 5   | Audit log: tabela `audit_log` (tylko INSERT), `core/audit`: `audit.record(tx, actor, …)` w tej samej transakcji co zmiana, kategoria wynika z akcji (`AUDIT_ACTIONS`), `listAuditLog()` (zarząd wszystko, admin tylko `SYSTEM`) i `recordHistory()` (kierownik/inżynier na swojej budowie, inżynier bez `FINANCIAL`); pierwsze wpisy: założenie konta, reset hasła, blokada/odblokowanie, nadanie/odebranie roli (`grantRole`/`revokeRole`); ekran `/admin/audyt`                | M0        | każda zmiana z iteracji 6+ zostawia ślad   | ✅ #12                                                    |
| 6   | Layout mobile-first: nawigacja zależna od roli (`src/app/navigation.ts`), manifest PWA, pusty pulpit per rola; konto bez ról → ekran „Konto nie ma przypisanej roli…”; **każda pozycja nawigacji bez gotowego ekranu prowadzi do zaślepki „Sekcja w przygotowaniu (Mx)”, nigdy do 404**                                                                                                                                                                                          | M0        | działa na telefonie                        | częściowo #4, #13 — brak: layout `(app)`, pulpit per rola |
| 7   | Pracownicy i konta: CRUD pracowników razem z kontem (login + hasło tymczasowe), przypisanie ról                                                                                                                                                                                                                                                                                                                                                                                  | M1        | admin zakłada brygadzistę                  |                                                           |
| 8   | Budowy: CRUD, unikalny numer budowy (w becie dowolny tekst), dane kontraktu, zespół budowy z historią                                                                                                                                                                                                                                                                                                                                                                            | M1        | fikcyjna budowa z zespołem                 |                                                           |
| 9   | Etapy: szablony (admin) + etapy na budowie                                                                                                                                                                                                                                                                                                                                                                                                                                       | M2        | budowa z etapami ze szablonu               |                                                           |
| 10  | Katalog prac + wersjonowane normy                                                                                                                                                                                                                                                                                                                                                                                                                                                | M2        | zmiana normy nie rusza starych pakietów    |                                                           |
| 11  | Pakiety: CRUD, maszyna statusów (domena + testy), uczestnicy z historią, checklista, DoD                                                                                                                                                                                                                                                                                                                                                                                         | M2        | pakiet przechodzi przez statusy            |                                                           |
| 12  | Blokady pakietów: zgłoszenie z przyczyną, zdjęcie blokady, przełożenie ludzi na inny pakiet                                                                                                                                                                                                                                                                                                                                                                                      | M2        | blokada widoczna na liście budowy          |                                                           |
| 13  | Wpis czasu: formularz terenowy pracownika (data, pakiet, godziny, klasa czasu) + widok „dzień ekipy" brygadzisty                                                                                                                                                                                                                                                                                                                                                                 | M3        | wpis z telefonu w < 30 s                   |                                                           |
| 14  | Zatwierdzanie czasu: zatwierdź/odrzuć dzień ekipy, korekta po zatwierdzeniu z powodem → audit; **rozdział obowiązków: nikt nie zatwierdza własnych wpisów czasu, także mając `time.approve` — godziny brygadzisty zatwierdza inżynier lub kierownik tej budowy** (test odmowy)                                                                                                                                                                                                   | M3        | korekta widoczna w historii                |                                                           |
| 15  | Przestoje + plan vs wykonanie: rejestr przestojów, kategorie, rbh planowane vs rzeczywiste per pakiet/budowa, podstawowy pulpit                                                                                                                                                                                                                                                                                                                                                  | M3        | pulpit fikcyjnej budowy z odchyleniami     |                                                           |

Po iteracji 15: przegląd z Tobą przed M4 (dziennik, zdjęcia → wtedy
decyzja o storage).
