# 3Concept Work

Wewnętrzna platforma operacyjna 3Concept — realizacja budów, czas pracy,
przestoje, dokumenty. Wymagania: [PROJECT.md](PROJECT.md), plan:
[docs/PLAN_MVP.md](docs/PLAN_MVP.md), wygląd: [docs/UI_STYLE.md](docs/UI_STYLE.md).

## Uruchomienie lokalne

Wymagane: Node.js 22+ (CI używa 24) i Docker Desktop.

```bash
cp .env.example .env   # adresy bazy dev i testowej
npm install            # instaluje zależności i generuje klienta Prismy
npm run db:up          # PostgreSQL w Dockerze (bazy c3work i c3work_test)
npm run db:reset       # migracje od zera + seed z danymi fikcyjnymi
npm run dev            # http://localhost:3000
```

Seed zakłada konta testowe (`admin`, `zarzad`, `kierownik`, `inzynier`, `brygadzista`, `jkowalski`) z hasłem tymczasowym
`tymczasowe1` — przy pierwszym logowaniu trzeba je zmienić. W trybie
development strona `/dev/ui` pokazuje komponenty UI.

## Baza danych

| Polecenie            | Co robi                                                |
| -------------------- | ------------------------------------------------------ |
| `npm run db:up`      | start kontenera Postgres (`docker compose up --wait`)  |
| `npm run db:down`    | zatrzymanie kontenera (dane zostają w wolumenie)       |
| `npm run db:migrate` | nowa migracja z `prisma/schema.prisma` (`migrate dev`) |
| `npm run db:deploy`  | zastosowanie istniejących migracji (`migrate deploy`)  |
| `npm run db:seed`    | seed developerski (`prisma/seed.ts`, idempotentny)     |
| `npm run db:reset`   | **kasuje** bazę dev, migruje od zera i seeduje         |
| `npm run db:studio`  | Prisma Studio                                          |

Testy integracyjne (`npm test`) łączą się wyłącznie z bazą z
`DATABASE_URL_TEST`; migracje są na niej stosowane automatycznie przed
testami. Bez tej zmiennej testy bazodanowe są pomijane.

## Kontrola jakości

```bash
npm run check      # lint + typecheck + format + testy
npm run build
npm run format     # automatyczne formatowanie
```
