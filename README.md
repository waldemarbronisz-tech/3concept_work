# 3Concept Work

Wewnętrzna platforma operacyjna 3Concept — realizacja budów, czas pracy,
przestoje, dokumenty. Wymagania: [PROJECT.md](PROJECT.md), plan:
[docs/PLAN_MVP.md](docs/PLAN_MVP.md).

## Uruchomienie lokalne

Wymagany Node.js 22+ (CI używa 24).

```bash
npm install
npm run dev        # http://localhost:3000
```

## Kontrola jakości

```bash
npm run check      # lint + typecheck + format + testy
npm run build
npm run format     # automatyczne formatowanie
```
