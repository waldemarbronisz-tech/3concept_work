# 3Concept Work — roadmapa

> Wersja: 0.1 / 2026-10-01 · Status: **propozycja do akceptacji**
> Szczegóły iteracji M0–M3: [PLAN_MVP.md](PLAN_MVP.md) §5. Wygląd: [UI_STYLE.md](UI_STYLE.md).

Zasada: **najpierw jedna rzecz działająca na prawdziwej budowie, potem rozbudowa.**
Nie budujemy kolejnych modułów, dopóki pilotaż nie potwierdzi, że ludzie używają
podstawowego (godziny + pakiety).

## Etap A — do pilotażu

| Krok                       | Zakres                                                                                                                                                          | Stan         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **M0 fundament**           | it. 1 szkielet · it. 2 baza · it. 3 logowanie                                                                                                                   | ✅ na `main` |
|                            | wygląd (tokeny, komponenty, `/dev/ui`), nawigacja wg ról                                                                                                        | ✅ na `main` |
|                            | porządki repo + branding (logo, grafit jako kolor główny)                                                                                                       | w toku       |
|                            | it. 4 RBAC · it. 5 audit log · it. 6 layout po zalogowaniu                                                                                                      | następne     |
| **M1 ludzie i budowy**     | it. 7 pracownicy i konta · it. 8 budowy i zespół                                                                                                                |              |
| **M2 realizacja**          | it. 9 etapy · it. 10 katalog i normy · it. 11 pakiety · it. 12 blokady                                                                                          |              |
| **M3 czas**                | it. 13 wpis czasu · it. 14 zatwierdzanie · it. 15 przestoje i pulpit budowy                                                                                     |              |
|                            | **it. 15a eksport zatwierdzonych godzin do Excela** (dla kadr; w pilotażu system działa równolegle z papierem)                                                  | nowe         |
| **P gotowość do pilotażu** | it. 16 wdrożenie: hosting (D9), `work.3concept.pl`, HTTPS, zarządzana baza z codziennym backupem, **test odtworzenia backupu**, monitoring błędów               | nowe         |
|                            | it. 17 dane pilotażu: budowa, etapy i pakiety z warsztatu WBS, normy startowe, konta pracowników (zakładanie hurtowe), kartki z loginem, instrukcja na 1 stronę | nowe         |
|                            | it. 18 zbieranie uwag: przycisk „Zgłoś uwagę” w aplikacji, prosty rejestr zgłoszeń                                                                              | nowe         |

## Pilotaż (§31)

Jedna budowa, ok. **4 tygodnie**, papier i aplikacja równolegle.

Kryteria sukcesu (propozycja — do potwierdzenia przed startem):

| Kryterium                                                          | Próg                         |
| ------------------------------------------------------------------ | ---------------------------- |
| Godziny wpisane w aplikacji vs lista papierowa                     | ≥ 90 %                       |
| Typowy wpis godzin na telefonie                                    | < 30 s                       |
| Dzień ekipy zatwierdzony przez brygadzistę do rana następnego dnia | ≥ 80 % dni                   |
| Utrata danych                                                      | 0 przypadków                 |
| Błąd blokujący pracę dłużej niż 1 dzień roboczy                    | 0                            |
| Kierownik zna stan budowy bez telefonu do inżyniera                | tak / nie (ocena kierownika) |
| Uczestnicy chcą zostać przy aplikacji                              | większość (krótka ankieta)   |

Po pilotażu: **decyzja** — idziemy dalej / poprawiamy podstawę / zatrzymujemy.
Eksport do Excela zostaje do czasu integracji z systemem kadrowym.

## Etap B — po udanym pilotażu (kolejność proponowana)

| #   | Moduł                                                                                                                                                         | Dlaczego w tym miejscu                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| B1  | **Dokumentacja budowy**: storage plików, rysunki z rewizjami (obowiązuje / archiwalna), podgląd PDF na telefonie, dostęp tylko dla zespołu budowy, log pobrań | duża wartość dla każdego, bez AI; wymusza decyzję o storage potrzebną dalej |
| B2  | **Dziennik realizacji + zdjęcia** (kompresja przy wgraniu, tagi, powiązanie z pakietami)                                                                      | korzysta ze storage z B1                                                    |
| B3  | **Dostawy i WZ** („Przyjmij dostawę” z telefonu)                                                                                                              | ten sam mechanizm dokumentów                                                |
| B4  | **Zamówienia** i powiązanie blokady „brak materiału” z zamówieniem i dostawą                                                                                  | łańcuch §45                                                                 |
| B5  | **Moja kolejka** w pełnej wersji (§49)                                                                                                                        | gdy jest już z czego ją budować                                             |
| B6  | **Sync Agent**: kopia plików i Excel dziennika na dysku firmowym (§47)                                                                                        | po ustaleniu struktury katalogów                                            |
| B7  | Delegacje i zaliczki                                                                                                                                          | po weryfikacji zasad księgowych                                             |
| B8  | Analityka i własne normatywy                                                                                                                                  | gdy jest kilka miesięcy danych                                              |
| B9  | Premie                                                                                                                                                        | dopiero po zatwierdzeniu zasad i danych z norm (§9)                         |
| B10 | Integracje: Subiekt/KSeF, Trello, e-mail zamówień, API                                                                                                        | gdy rdzeń jest stabilny                                                     |

AI (transkrypcja, szkice wpisów, OCR WZ) dokładamy jako ulepszenia B2–B3, nie jako warunek.

## Równolegle — rzeczy poza kodem

| Co                                                                                                                                                    | Kiedy           | Kto                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------------- |
| Decyzje D8 (kod pakietu), D5 (zatwierdzanie czasu), D7 (granulacja)                                                                                   | przed M2 / M3   | zarząd                 |
| D4a: prawdziwe numery budów (kilka przykładów)                                                                                                        | przed it. 17    | zarząd                 |
| D9: hosting                                                                                                                                           | przed it. 16    | zarząd + IT            |
| Wybór budowy pilotażowej i zespołu                                                                                                                    | przed it. 17    | zarząd                 |
| Warsztat WBS i katalog czynności z normami startowymi (kierownik, inżynier, brygadzista, 2–3 pracowników)                                             | przed it. 17    | kierownik              |
| **Minimum RODO przed realnymi danymi pracowników**: podstawa przetwarzania, informacja dla pracowników, umowa powierzenia z hostingiem, kto ma dostęp | przed it. 17    | zarząd (+ prawnik/IOD) |
| Kto utrzymuje system po wdrożeniu (aktualizacje, backupy, zgłoszenia)                                                                                 | przed pilotażem | zarząd                 |
| Logo w wektorze (SVG)                                                                                                                                 | dowolnie        | marketing              |
