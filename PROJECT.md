# 3Concept Work --- PROJECT.md

> Dokument główny projektu dla Claude Code\
> Wersja: 0.1 / 2026-09-28\
> Status: koncepcja i wymagania startowe\
> Cel: budowa poważnej, modułowej platformy firmowej 3Concept do
> zarządzania realizacją, pracownikami, czasem, dokumentami,
> delegacjami, kosztami i wiedzą z budów.

------------------------------------------------------------------------

## 1. Wizja produktu

**3Concept Work** ma być wewnętrzną, responsywną aplikacją webową
(docelowo PWA), dostępną z telefonu, tabletu i komputera przez
przeglądarkę, np. pod adresem `work.3concept.pl`.

Platforma ma wspierać realia firmy projektowo-wykonawczej z branży
elektroenergetycznej i budowlanej, w szczególności: - budowę i
modernizację rozdzielni oraz stacji elektroenergetycznych, - obwody
pierwotne i wtórne, - trasy i układanie kabli, - instalacje elektryczne
i pomocnicze, - pomiary, próby i rozruchy, - prace budowlane, sanitarne,
żelbetowe i wykończeniowe, - logistykę, zakupy, dokumentację oraz
delegacje.

System nie może być tylko „apką do godzin". Ma stopniowo stać się
**operacyjnym centrum firmy**, łączącym realizację, dane pracownicze,
dokumenty i koszty.

### Zasada nadrzędna

**Informację wprowadzamy możliwie tylko raz, a system wykorzystuje ją w
wielu miejscach.**

Przykład: informacja o pracy pracownika przy pakiecie roboczym może
jednocześnie zasilać: - czas pracy, - koszt kontraktu, - analizę plan vs
wykonanie, - naliczenie premii, - statystyki wydajności, - historię
pakietu.

------------------------------------------------------------------------

## 2. Główne zasady projektowe

1.  **Mobile first**, ale pełna obsługa desktopowa.
2.  Brak obowiązku instalowania aplikacji na prywatnym telefonie.
3.  Możliwość działania jako PWA.
4.  Minimalna liczba kliknięć dla pracownika terenowego.
5.  Role i uprawnienia od początku projektu.
6.  Modułowa architektura --- system ma być rozwijany etapami.
7.  Pełna historia istotnych zmian i akceptacji.
8.  Dane operacyjne w relacyjnej bazie danych.
9.  Dokumenty i zdjęcia przechowywane jako pliki z metadanymi.
10. Trello jest integracją, nie podstawową bazą danych systemu.
11. Nie kodować reguł biznesowych, które mogą się zmieniać, na sztywno,
    jeżeli mogą być parametrami administracyjnymi.
12. Automatyzacja ma ograniczać administrację, a nie tworzyć nowe
    obowiązki.
13. AI może tworzyć szkice, klasyfikować i proponować działania, ale
    krytyczne dane biznesowe wymagają zatwierdzenia człowieka.
14. Każdy ważny rekord powinien mieć autora, datę utworzenia, historię
    zmian i --- tam gdzie właściwe --- osobę zatwierdzającą.
15. System musi być projektowany pod późniejsze raportowanie i
    analitykę.

------------------------------------------------------------------------

## 3. Role użytkowników

Role startowe:

### 3.1 Administrator / Zarząd

Dostęp globalny: - wszystkie kontrakty i budowy, - pracownicy, -
koszty, - statystyki, - konfiguracja, - normatywy, - reguły premiowe, -
dokumenty, - delegacje, - uprawnienia użytkowników.

### 3.2 Kierownik kontraktu

Dostęp do przypisanych kontraktów: - budżet i realizacja, - pakiety
robocze, - zespół, - koszty, - delegacje, - dokumenty, - raporty, -
zatwierdzanie wybranych procesów.

### 3.3 Inżynier budowy

Dostęp operacyjny do przypisanych budów: - pakiety, -
przydzielanie/przegląd prac, - dziennik realizacji, - zdjęcia, -
roboczogodziny, - przestoje, - WZ i dokumenty, - raportowanie, - odbiory
zakresów zgodnie z uprawnieniami.

### 3.4 Brygadzista

-   podgląd przypisanych pakietów,
-   podgląd zespołu,
-   raportowanie wykonania,
-   zgłaszanie godzin,
-   przestoje,
-   zdjęcia i komentarze,
-   weryfikacja danych brygady zgodnie z workflow.

### 3.5 Pracownik

-   własne zadania,
-   własne godziny,
-   udział w pakietach,
-   własne delegacje,
-   zaliczki i rozliczenia,
-   własne dokumenty/uprawnienia w zakresie udostępnionym,
-   zgłoszenia i załączniki,
-   podgląd własnej premii, jeżeli funkcja zostanie aktywowana.

### RBAC

Zaimplementować Role-Based Access Control. Nie opierać bezpieczeństwa
wyłącznie na ukrywaniu elementów UI. Backend/API musi sprawdzać
uprawnienia.

W przyszłości możliwe uprawnienia granularne niezależne od roli.

------------------------------------------------------------------------

## 4. Struktura biznesowa danych

Proponowana hierarchia:

``` text
FIRMA
└── KONTRAKT
    └── BUDOWA / OBIEKT
        └── ETAP
            └── PAKIET ROBOCZY
                ├── uczestnicy
                ├── roboczogodziny
                ├── dokumenty
                ├── zdjęcia
                ├── przestoje
                ├── odbiory
                └── historia
```

Nie zakładać, że każda realizacja będzie identyczna. Hierarchia powinna
pozwalać na różne typy projektów.

------------------------------------------------------------------------

# 5. MODUŁ: REALIZACJA

## 5.1 Kontrakty i budowy

Dane przykładowe: - numer kontraktu, - nazwa, - klient, - lokalizacja, -
kierownik kontraktu, - inżynierowie, - data rozpoczęcia, - termin
zakończenia, - status, - budżet robocizny, - planowane rbh, - koszty, -
notatki, - dokumenty.

## 5.2 Etapy

Przykładowe etapy dla rozdzielni/stacji: - przygotowanie robót, -
logistyka i organizacja, - konstrukcje, - trasy kablowe, - obwody
pierwotne, - obwody wtórne, - układanie kabli, - obróbka i podłączanie
kabli, - instalacje pomocnicze, - pomiary, - próby, - rozruch, -
dokumentacja, - poprawki i odbiory.

Etapy mają być konfigurowalne.

## 5.3 Pakiety robocze

Pakiet to podstawowa jednostka zarządzania wykonaniem.

Każdy pakiet powinien mieć: - kod, - nazwę, - opis, - kontrakt/budowę, -
etap, - lokalizację/obszar/pole, - jednostkę rozliczeniową, - ilość, -
planowane rbh, - rzeczywiste rbh, - datę planowaną, - datę
rozpoczęcia, - datę zakończenia, - status, - priorytet, -
odpowiedzialnego, - uczestników, - checklistę, - kryterium „Definition
of Done", - załączniki, - zdjęcia, - uwagi, - przestoje, - odbiór
jakościowy, - historię zmian.

### Statusy startowe

-   planowany,
-   gotowy do rozpoczęcia,
-   w toku,
-   wstrzymany,
-   do odbioru,
-   odebrany,
-   wymaga poprawek,
-   zamknięty.

------------------------------------------------------------------------

# 6. MODUŁ: KATALOG PRAC I NORMATYWY

Jest to kluczowy element systemu.

Celem jest stworzenie własnej bazy wiedzy 3Concept o rzeczywistej
pracochłonności robót.

## 6.1 Katalog

Przykładowa struktura:

``` text
Obwody wtórne
├── montaż szafy
├── przygotowanie przewodów
├── podłączenia
├── oznaczenia
├── sprawdzenie ciągłości
└── próby

Trasy kablowe
├── konstrukcje wsporcze
├── koryta
├── drabiny
├── mocowania
└── uziemienie

Kable
├── transport
├── rozwinięcie
├── ułożenie
├── mocowanie
├── obróbka
├── podłączenie
└── oznaczenie
```

Każda pozycja katalogowa: - kod, - kategoria, - nazwa, - opis, -
jednostka (szt., m, kabel, pole, szafa itd.), - normatyw
rbh/jednostkę, - źródło normy, - data obowiązywania, - liczba realizacji
użytych do wyliczenia, - średnia rzeczywista, - mediana, - możliwość
wersjonowania.

## 6.2 Źródła norm

Na początku: - doświadczenie kierowników, - konsultacje z
brygadzistami, - konsultacje z doświadczonymi pracownikami, - dane
historyczne, jeśli dostępne.

Docelowo normy powinny być aktualizowane na podstawie danych z
rzeczywistych realizacji.

Nie zmieniać norm historycznych dla już zamkniętych pakietów ---
zachować wersję normy użytej przy planowaniu.

------------------------------------------------------------------------

# 7. MODUŁ: CZAS PRACY I ROBOTY

Pracownik/brygadzista powinien móc szybko przypisać czas do: - budowy, -
pakietu, - rodzaju pracy.

Minimalny formularz terenowy: - data, - pakiet, - liczba godzin, -
opcjonalna uwaga, - ewentualny przestój.

Możliwe późniejsze rozszerzenie: - START/STOP, - automatyczny timer, -
zatwierdzanie przez brygadzistę/inżyniera.

Nie projektować systemu w sposób wymagający stałego śledzenia
lokalizacji pracownika.

------------------------------------------------------------------------

# 8. MODUŁ: PRZESTOJE I PROBLEMY

Przestoje muszą być odseparowane od oceny wydajności wykonawczej.

Kategorie startowe: - brak materiału, - brak dokumentacji, - brak frontu
robót, - oczekiwanie na inną branżę, - oczekiwanie na decyzję, - awaria
sprzętu, - pogoda, - problem projektowy, - klient/inwestor, - BHP, -
inne.

Dane: - budowa, - pakiet, - czas, - osoby, - przyczyna, - opis, -
zdjęcie/dokument, - osoba zgłaszająca, - status rozwiązania.

Cel analityczny: rozróżnić niską produktywność od problemów
organizacyjnych niezależnych od pracownika.

------------------------------------------------------------------------

# 9. MODUŁ: SYSTEM PREMIOWY

**Nie implementować ostatecznego algorytmu bez zatwierdzenia
biznesowego.**

Koncepcja: - pakiet ma budżet rbh, - rejestrowane są rzeczywiste rbh, -
po prawidłowym wykonaniu i odbiorze może powstać oszczędność, - część
wartości oszczędności może tworzyć pulę premiową, - udział pracownika
może zależeć od jego faktycznego udziału w pakiecie, - zmiana składu
brygady nie może powodować utraty informacji o wkładzie pracownika.

Warunki blokujące lub modyfikujące premię mogą obejmować: - poprawki, -
jakość, - BHP, - niekompletne wykonanie, - przekazanie problemu
następnej ekipie.

Wszystkie parametry: - udział firmy, - udział pracowników, -
współczynniki, - zasady zaokrągleń, - progi,

mają być konfigurowalne i wersjonowane.

Pracownik może widzieć: - udział w pakiecie, - szacowaną premię, -
zatwierdzoną premię.

Wyraźnie odróżnić **prognozę** od **zatwierdzonej kwoty**.

------------------------------------------------------------------------

# 10. MODUŁ: DZIENNIK REALIZACJI / DZIENNIK BUDOWY

UWAGA: roboczy dziennik realizacji w systemie nie powinien być
automatycznie utożsamiany z formalnym dziennikiem budowy wymaganym
przepisami. Funkcje formalne wymagają osobnej analizy prawnej przed
wdrożeniem.

## Cel

Inżynier ma dokumentować dzień/etap w minimalnym czasie.

## Workflow

``` text
+ DODAJ WPIS
    ↓
zdjęcia
    ↓
nagranie głosowe lub tekst
    ↓
transkrypcja
    ↓
AI przygotowuje szkic
    ↓
proponowane tagi/powiązania
    ↓
inżynier sprawdza
    ↓
ZATWIERDŹ
```

### Dane wpisu

-   data i czas,
-   budowa,
-   autor,
-   opis,
-   transkrypcja źródłowa,
-   wersja uporządkowana,
-   zdjęcia,
-   etap,
-   pakiety,
-   wykonane prace,
-   prace w toku,
-   problemy,
-   przestoje,
-   dostawy,
-   uwagi,
-   plan na kolejny dzień (opcjonalnie).

### AI

AI może: - transkrybować mowę, - poprawić język, - tworzyć uporządkowany
wpis, - proponować kategorię, - proponować powiązanie z pakietem, -
wykrywać potencjalny przestój, - wykrywać wzmiankę o dostawie/WZ, -
przygotowywać raport.

AI **nie zatwierdza samodzielnie wpisu**.

## Zdjęcia

Każde zdjęcie powinno mieć metadane: - budowa, - data, - autor, -
etap, - pakiet, - kategoria/tagi, - powiązany wpis dziennika.

System powinien pozwalać później wyszukiwać np.: - zdjęcia pola Q3, -
zdjęcia tras kablowych, - zdjęcia z danego tygodnia, - zdjęcia przed/po.

------------------------------------------------------------------------

# 11. MODUŁ: RAPORTOWANIE

Na podstawie danych system ma móc generować szkice raportów: -
dziennych, - tygodniowych, - miesięcznych, - raportów dla kierownika, -
raportów zarządczych.

Raport tygodniowy może zawierać: - wykonane zakresy, - prace w toku, -
problemy, - przestoje, - plan na kolejny tydzień, - planowane vs
rzeczywiste rbh, - postęp pakietów, - wybrane zdjęcia.

Raport jest szkicem do zatwierdzenia przez człowieka.

------------------------------------------------------------------------

# 12. MODUŁ: DELEGACJE

Funkcje: - utworzenie polecenia wyjazdu, - powiązanie z pracownikiem, -
powiązanie z budową/kontraktem, - data wyjazdu/powrotu, - cel, -
miejscowość, - środek transportu, - nocleg, - zaliczka, - wydatki, -
rozliczenie, - workflow akceptacji, - generowanie PDF, - archiwum.

Reguły diet, kilometrówek i innych rozliczeń muszą być konfigurowalne i
wersjonowane. Nie zaszywać aktualnych stawek prawnych na stałe w kodzie.

Przed wdrożeniem produkcyjnym modułu rozliczeń zweryfikować wymagania
księgowe/podatkowe.

------------------------------------------------------------------------

# 13. MODUŁ: ZALICZKI

Workflow:

``` text
WNIOSEK
→ AKCEPTACJA
→ WYPŁATA
→ ROZLICZANIE
→ ZAMKNIĘCIE
```

Dane: - pracownik, - budowa, - cel, - kwota, - data, - osoba
zatwierdzająca, - status, - dokumenty kosztowe, - kwota rozliczona, -
kwota do zwrotu / dopłaty.

------------------------------------------------------------------------

# 14. MODUŁ: OBIEG DOKUMENTÓW

Kategorie startowe: - WZ, - faktura, - paragon, - protokół, - dokument
dostawy, - dokumentacja techniczna, - dokumentacja jakościowa, -
zdjęcie, - inne.

Każdy dokument powinien mieć możliwość powiązania z: - kontraktem, -
budową, - pakietem, - pracownikiem, - dostawcą, - datą, - kategorią.

## WZ

Przykładowy workflow:

``` text
DOSTAWA
→ zdjęcie/skan WZ
→ wybór budowy
→ dostawca
→ opcjonalnie pakiet
→ zapis
→ weryfikacja
→ archiwum
```

Docelowo OCR/AI może proponować: - numer WZ, - datę, - dostawcę, -
pozycje, - ilości.

Użytkownik zatwierdza odczyt.

------------------------------------------------------------------------

# 15. MODUŁ: WYDATKI

Możliwość: - dodania zdjęcia paragonu/faktury, - przypisania budowy, -
kategorii kosztu, - kwoty, - opisu, - pracownika, -
zaliczki/delegacji, - statusu rozliczenia.

Docelowo OCR i automatyczna klasyfikacja.

------------------------------------------------------------------------

# 16. MODUŁ: PRACOWNICY I KOMPETENCJE

Profil pracownika może zawierać: - podstawowe dane służbowe, -
stanowisko, - rolę w systemie, - status zatrudnienia, - przypisania do
budów, - kwalifikacje, - uprawnienia SEP, - badania, - szkolenia BHP, -
inne certyfikaty, - terminy ważności, - dokumenty.

Docelowo alerty o zbliżającym się końcu ważności.

Dostęp do danych osobowych musi być ograniczony zgodnie z rolą.

------------------------------------------------------------------------

# 17. MODUŁ: KOSZTY KONTRAKTU

System powinien stopniowo agregować: - robociznę, - delegacje, -
premie, - noclegi, - transport, - wydatki, - materiały (w miarę
integracji), - inne koszty.

Widoki: - kontrakt, - budowa, - etap, - pakiet.

Plan vs wykonanie.

Nie zakładać od początku pełnej księgowości --- platforma jest systemem
operacyjnym i zarządczym. Integrację księgową traktować jako osobny
etap.

------------------------------------------------------------------------

# 18. MODUŁ: ANALITYKA I DASHBOARDY

## Zarząd

-   aktywne kontrakty,
-   planowane vs rzeczywiste rbh,
-   koszt robocizny,
-   odchylenie od budżetu,
-   przestoje,
-   postęp,
-   koszty delegacji,
-   premie,
-   rentowność zakresów, jeśli dane finansowe pozwalają.

## Kierownik

-   status pakietów,
-   budżet rbh,
-   wykorzystane rbh,
-   problemy,
-   przestoje,
-   ludzie,
-   delegacje,
-   dokumenty wymagające akcji.

## Inżynier

-   zadania na dziś,
-   pakiety wymagające aktualizacji,
-   wpis dziennika,
-   problemy,
-   brakujące dane,
-   dokumenty do weryfikacji.

## Pracownik

-   moje zadania,
-   moje godziny,
-   moje delegacje,
-   moje zaliczki,
-   udział w pakietach,
-   premie, jeśli aktywne.

### Ważna zasada

W pierwszej fazie analityka ma przede wszystkim identyfikować problemy
procesowe. Nie tworzyć automatycznych rankingów pracowników na podstawie
surowej liczby rbh.

------------------------------------------------------------------------

# 19. MODUŁ: POWIADOMIENIA

Docelowo: - nowe przypisanie, - zmiana zadania, - pakiet gotowy do
odbioru, - odrzucone godziny, - delegacja do zatwierdzenia, -
nierozliczona zaliczka, - dokument wymagający akcji, - kończące się
uprawnienia, - ważny problem na budowie.

Kanały mogą obejmować: - powiadomienia wewnątrz aplikacji, - e-mail, -
opcjonalnie inne integracje w przyszłości.

------------------------------------------------------------------------

# 20. TRELLO

Trello pozostaje na początku narzędziem używanym w firmie.

Integracja może obejmować: - import/synchronizację wybranych kart, -
powiązanie kart z pakietami, - linkowanie do Trello, - automatyczne
tworzenie wybranych kart.

**Nie projektować rdzenia 3Concept Work jako nakładki wymagającej Trello
do działania.**

System ma mieć własną bazę i w przyszłości może przejąć część funkcji
Trello.

------------------------------------------------------------------------

# 21. PROPONOWANY STACK TECHNICZNY

Punkt startowy do weryfikacji przed implementacją:

### Frontend / aplikacja

-   Next.js
-   React
-   TypeScript
-   responsywny interfejs
-   PWA w późniejszym etapie lub od początku, jeśli nie komplikuje MVP

### Backend

Może być realizowany w ramach Next.js dla MVP, ale zachować separację
warstw: - UI, - logika aplikacyjna, - domena, - dostęp do danych.

### Baza

-   PostgreSQL
-   Prisma ORM

### Pliki

Nie przechowywać dużych zdjęć/dokumentów bezpośrednio w bazie. Użyć
object storage zgodnego z S3 lub równoważnego rozwiązania. W bazie
przechowywać metadane i referencje.

### Uwierzytelnianie

Wybrać stabilne rozwiązanie obsługujące: - sesje, - reset hasła, -
RBAC, - możliwość 2FA w przyszłości.

### AI

Warstwa usługowa niezależna od konkretnego dostawcy, jeżeli jest to
praktyczne: - transkrypcja, - generowanie szkicu wpisu, - klasyfikacja
dokumentów, - OCR, - raportowanie.

Nie mieszać kodu AI z logiką księgową lub autoryzacyjną.

------------------------------------------------------------------------

# 22. BEZPIECZEŃSTWO

System będzie przechowywał dane pracowników i dane biznesowe.

Od początku: - HTTPS, - bezpieczne hashowanie haseł / sprawdzony
provider auth, - autoryzacja backendowa, - RBAC, - walidacja danych
wejściowych, - ochrona uploadu plików, - ograniczenia rozmiarów i
typów, - backup bazy, - backup plików, - audit log, - logowanie
błędów, - brak sekretów w repozytorium, - `.env` i `.env.example`, -
migracje bazy, - zasada najmniejszych uprawnień.

Przed produkcją: - analiza RODO, - retencja danych, - polityka
dostępu, - procedura usuwania/archiwizacji, - test bezpieczeństwa, -
polityka backup/restore.

------------------------------------------------------------------------

# 23. AUDIT LOG

Rejestrować co najmniej: - zmiany godzin po zatwierdzeniu, -
akceptacje, - zmiany statusów finansowych, - delegacje, - zaliczki, -
zmiany premii, - zmiany uprawnień, - usuwanie dokumentów, - kluczowe
zmiany pakietów.

Audit log nie powinien być edytowalny przez zwykłych użytkowników.

------------------------------------------------------------------------

# 24. UX TERENOWY

Projektując ekran dla pracownika/inżyniera: - duże elementy dotykowe, -
minimum tekstu do wpisywania, - szybkie dodawanie zdjęć, -
zapamiętywanie ostatniej budowy tam, gdzie bezpieczne, - proste
wyszukiwanie, - jasne statusy, - brak zbędnych ekranów pośrednich, -
formularze możliwe do wykonania jedną ręką na telefonie.

Rozważyć w przyszłości częściowy tryb offline / kolejkę synchronizacji,
ponieważ na budowach może być słaby zasięg.

------------------------------------------------------------------------

# 25. GENEROWANIE DOKUMENTÓW

Docelowo PDF: - delegacja, - rozliczenie delegacji, - raport dzienny, -
raport tygodniowy, - zestawienie rbh, - zestawienie kosztów, - inne
szablony.

Szablony powinny być wersjonowane.

------------------------------------------------------------------------

# 26. WYSZUKIWANIE

Docelowa globalna wyszukiwarka: - budowy, - pracownicy, - pakiety, -
dokumenty, - numery WZ, - dostawcy, - wpisy dziennika, - tagi zdjęć.

------------------------------------------------------------------------

# 27. INTEGRACJE --- ROADMAP

Potencjalne: - Trello, - e-mail, - Google Drive / firmowy storage, -
system księgowy/kadrowy, - kalendarz, - OCR, - AI/transkrypcja, -
eksport Excel/CSV, - webhook/API dla n8n lub innych automatyzacji.

Projektować API tak, aby późniejsze integracje nie wymagały przebudowy
rdzenia.

------------------------------------------------------------------------

# 28. MODEL DANYCH --- WSTĘPNE ENCJE

Nie jest to finalny schema Prisma. To lista domenowa do zaprojektowania:

-   User
-   Role
-   Permission
-   Employee
-   EmployeeQualification
-   QualificationDocument
-   Contract
-   ConstructionSite
-   Stage
-   WorkCatalogItem
-   WorkNormVersion
-   WorkPackage
-   WorkPackageParticipant
-   TimeEntry
-   Downtime
-   Checklist
-   ChecklistItem
-   Acceptance
-   SiteDiaryEntry
-   Photo
-   Attachment
-   Document
-   DocumentType
-   DeliveryNote
-   Expense
-   BusinessTrip
-   BusinessTripExpense
-   Advance
-   BonusRuleVersion
-   BonusCalculation
-   Report
-   Notification
-   AuditLog
-   Supplier
-   AppSetting

Przed utworzeniem schematu przeanalizować relacje, indeksy, soft-delete
i wymagania historyczne.

------------------------------------------------------------------------

# 29. KONWENCJE DANYCH

Każda istotna encja powinna rozważyć pola: - `id` --- UUID/CUID, -
`createdAt`, - `updatedAt`, - `createdBy`, - `updatedBy`, - `status`, -
`deletedAt` dla soft-delete tam, gdzie właściwe.

Nie używać nazw użytkowników jako kluczy.

Pieniądze: - nie używać float, - decimal lub wartości w najmniejszej
jednostce pieniężnej.

Czas: - przechowywać konsekwentnie, - UI lokalizować do strefy
użytkownika/firmy, - szczególnie uważać na delegacje i raporty dzienne.

------------------------------------------------------------------------

# 30. MVP --- KOLEJNOŚĆ WDROŻENIA

## Milestone 0 --- fundament

-   repozytorium,
-   konfiguracja projektu,
-   baza,
-   migracje,
-   auth,
-   role,
-   layout,
-   audit foundation,
-   seed developerski,
-   podstawowe testy.

## Milestone 1 --- użytkownicy i budowy

-   logowanie,
-   użytkownicy/pracownicy,
-   role,
-   kontrakty,
-   budowy,
-   przypisania.

## Milestone 2 --- realizacja

-   etapy,
-   katalog prac,
-   pakiety,
-   uczestnicy,
-   statusy,
-   checklisty.

## Milestone 3 --- rbh i przestoje

-   wpisy czasu,
-   zatwierdzanie,
-   budżet vs wykonanie,
-   przestoje,
-   podstawowy dashboard.

## Milestone 4 --- dziennik realizacji

-   wpis,
-   zdjęcia,
-   nagranie/tekst,
-   transkrypcja,
-   szkic AI,
-   zatwierdzanie,
-   powiązania z pakietami.

## Milestone 5 --- dokumenty

-   upload,
-   WZ,
-   dokumenty,
-   wyszukiwanie,
-   metadane,
-   workflow weryfikacji.

## Milestone 6 --- delegacje i zaliczki

-   delegacje,
-   zaliczki,
-   wydatki,
-   akceptacje,
-   PDF.

## Milestone 7 --- premie

Dopiero po: - zatwierdzeniu zasad biznesowych, - zebraniu danych, -
pilotażu normatywów.

## Milestone 8 --- analityka

-   raporty,
-   dashboardy,
-   trendy,
-   własne normatywy 3Concept.

## Milestone 9 --- integracje i automatyzacja

-   Trello,
-   Drive/storage,
-   API/webhooks,
-   n8n,
-   inne systemy.

------------------------------------------------------------------------

# 31. PILOTAŻ ORGANIZACYJNY

Przed uruchomieniem pełnego systemu:

1.  Wybrać jedną reprezentatywną realizację.
2.  Zebrać kierownika, inżyniera, brygadzistę i 2--3 doświadczonych
    pracowników.
3.  Rozpisać WBS robót.
4.  Utworzyć katalog czynności.
5.  Określić jednostki.
6.  Przyjąć wstępne normy rbh.
7.  Określić Definition of Done.
8.  Przez kilka tygodni zbierać rzeczywiste dane.
9.  Analizować odchylenia.
10. Dopiero później wykorzystywać dane do mechanizmu premiowego.

------------------------------------------------------------------------

# 32. ZASADY DLA CLAUDE CODE

## Przed kodowaniem

Claude Code powinien: 1. przeczytać cały `PROJECT.md`, 2. sprawdzić
istniejący kod i strukturę repo, 3. nie zmieniać architektury bez
uzasadnienia, 4. dla większej funkcji najpierw przedstawić krótki plan,
5. zadawać pytanie, jeżeli brakuje kluczowej decyzji biznesowej, 6. nie
wymyślać brakujących zasad płacowych, prawnych lub księgowych.

## Podczas kodowania

-   TypeScript strict.
-   Unikać `any`.
-   Małe, czytelne komponenty.
-   Logika biznesowa poza komponentami UI.
-   Walidacja zarówno po stronie klienta, jak i serwera tam, gdzie
    potrzebna.
-   Sprawdzanie autoryzacji na backendzie.
-   Migracje dla zmian schematu.
-   Testy dla krytycznej logiki biznesowej.
-   Czytelne nazwy.
-   Komentarze tylko tam, gdzie kod nie wyjaśnia intencji.
-   Nie dodawać zależności bez potrzeby.
-   Nie implementować funkcji „na zapas", jeśli nie wynika z roadmapy.

## Po zmianie

Claude powinien: - uruchomić lint, - typecheck, - testy, - build, jeśli
adekwatne, - zgłosić błędy, - podsumować zmienione pliki, - wskazać
migracje i nowe zmienne środowiskowe.

## Zakazy

Nie wolno: - przechowywać sekretów w kodzie, - omijać autoryzacji
„tymczasowo" w kodzie produkcyjnym, - automatycznie zatwierdzać
dokumentów AI, - usuwać historii finansowej bez śladu, - modyfikować
zatwierdzonych danych bez audit logu, - tworzyć rankingów pracowników
bez osobnej decyzji biznesowej, - implementować prawnych stawek
delegacji jako niezmiennych wartości.

------------------------------------------------------------------------

# 33. DEFINICJA SUKCESU

3Concept Work odnosi sukces, jeśli:

-   pracownik po krótkim szkoleniu potrafi obsłużyć swoje zadania bez
    pomocy biura,
-   raportowanie terenowe zajmuje minuty, nie dziesiątki minut,
-   kierownik widzi rzeczywisty postęp i rbh,
-   zarząd zna rzeczywiste koszty wykonania,
-   dane nie są przepisywane pomiędzy kilkoma systemami,
-   dokumenty można łatwo odnaleźć,
-   powstaje historyczna baza norm 3Concept,
-   można wskazać przyczyny przestojów,
-   system wspiera premiowanie wyniku bez premiowania nabijania godzin,
-   aplikacja może rozwijać się bez przepisywania jej od zera.

------------------------------------------------------------------------

# 34. OTWARTE DECYZJE

Do wspólnego ustalenia przed odpowiednimi etapami:

-   finalny hosting,
-   provider auth,
-   storage dokumentów,
-   dokładny model organizacji kontrakt → budowa → obiekt,
-   finalne role i granularne uprawnienia,
-   workflow zatwierdzania czasu,
-   zasady premii,
-   zasady delegacji,
-   integracja z obecnym programem kadrowym/księgowym,
-   zakres synchronizacji Trello,
-   format numeracji dokumentów,
-   retencja dokumentów,
-   podpisy/akceptacje elektroniczne,
-   wymagania RODO,
-   wymagania formalne wobec dokumentacji budowy,
-   tryb offline,
-   zakres danych widocznych dla pracownika.

------------------------------------------------------------------------

# 35. PIERWSZE ZADANIE DLA CLAUDE CODE

**Nie implementuj jeszcze całej platformy.**

Po przeczytaniu tego dokumentu:

1.  Zaproponuj architekturę MVP zgodną z wymaganiami.
2.  Zaproponuj strukturę katalogów repozytorium.
3.  Zaproponuj wstępny model danych dla Milestone 0--3.
4.  Wskaż decyzje, które muszą zostać podjęte przed rozpoczęciem
    implementacji.
5.  Zaproponuj plan prac na pierwsze 10--15 małych iteracji.
6.  Nie implementuj modułów delegacji, premii ani AI na tym etapie.
7.  Po akceptacji planu rozpoczniemy Milestone 0.

------------------------------------------------------------------------

## Zasada końcowa

**3Concept Work ma upraszczać pracę ludzi w terenie i dawać kierownictwu
wiarygodne dane. Jeżeli funkcja zwiększa biurokrację bez wyraźnej
wartości biznesowej, należy zakwestionować jej sens przed
implementacją.**

------------------------------------------------------------------------

# 36. MAPA STANU OBECNEGO 3CONCEPT --- USTALENIA 2026-09-29

Poniższa sekcja opisuje **rzeczywisty stan procesów w firmie**, ustalony
w rozmowie z użytkownikiem. Nie traktować obecnego sposobu działania
jako docelowego workflow. Ma on być podstawą do zaprojektowania procesów
TO-BE w 3Concept Work.

## 36.1 Pozyskanie, wycena i uruchomienie budowy

Aktualny proces:

1.  Pojawia się nowy temat / potencjalna budowa.
2.  Wycena jest przygotowywana głównie przez dyrektora ds.
    marketingowych wraz z pomocnikiem.
3.  Osoby przygotowujące wycenę posiadają szczegółową wiedzę o budżecie
    realizacji.
4.  Zakupy głównych, wysokowartościowych materiałów są wykonywane zwykle
    przez:
    -   dyrektora ds. marketingowych,
    -   osobę przez niego wyznaczoną,
    -   ewentualnie kierownika kontraktu.
5.  Jest to mała grupa około 3--4 osób.
6.  Po wygraniu kontraktu zakres odpowiedzialności jest omawiany na
    spotkaniach strategicznych.
7.  Spotkania strategiczne odbywają się zwykle dwa razy w miesiącu lub
    częściej.
8.  Uczestniczą w nich m.in. członkowie zarządu, dyrekcja i główny
    dyrektor wykonawczy.
9.  Zadania i odpowiedzialność za realizacje są rozdzielane podczas tych
    spotkań.
10. Zakres prac wynika przede wszystkim z dokumentacji technicznej.
11. Budżety i plan finansowo-rzeczowy są kontrolowane poprzez **HRF ---
    harmonogram rzeczowo-finansowy**.

### Wniosek projektowy

3Concept Work powinien docelowo umożliwiać: - utworzenie
kontraktu/budowy na podstawie zatwierdzonej realizacji, - przypisanie
kierownika kontraktu i zespołu, - zapis podstawowego budżetu i
kluczowych terminów, - powiązanie z HRF lub import danych z HRF, -
zachowanie historii osób odpowiedzialnych.

Nie należy wymuszać ręcznego przepisywania danych z HRF, jeśli możliwy
będzie import/integracja.

------------------------------------------------------------------------

## 36.2 Przekazywanie zadań na budowie

Aktualnie zadania dla inżynierów, brygadzistów i pracowników są
przekazywane głównie poprzez: - rozmowy, - telefony, - poranne
ustalenia.

Nie funkcjonuje jednolity cyfrowy system przypisywania bieżących prac.

### Docelowa zasada

Nie eliminować krótkich odpraw i porannych ustaleń. 3Concept Work ma
pozostawić po nich prosty cyfrowy ślad:

``` text
BUDOWA
→ PAKIET / ZADANIE
→ ODPOWIEDZIALNY
→ UCZESTNICY
→ PLAN NA DZIEŃ / OKRES
```

Rejestracja ma być szybka i nie może zamieniać odprawy w pracę
administracyjną.

------------------------------------------------------------------------

# 37. EWIDENCJA CZASU --- STAN OBECNY I DOCELOWY

## 37.1 Stan obecny

Aktualnie: - brygadzista prowadzi własną listę godzin, - każdy pracownik
prowadzi również własną listę godzin, - dane są wpisywane w tabelki /
papierowe zestawienia, - zestawienia są przekazywane do firmy, - nie
funkcjonuje formalne zatwierdzanie czasu, - kontrola jest jedynie
zgrubna, - papierowe zestawienia trafiają do jednego członka zarządu, -
członek zarządu ręcznie przenosi / opracowuje dane we własnym Excelu.

Powoduje to: - duplikowanie danych, - brak jednoznacznej
odpowiedzialności, - brak powiązania godzin z konkretnym zakresem
prac, - trudność w kontroli produktywności, - ręczną pracę
administracyjną, - ryzyko rozbieżności między listą brygadzisty a listą
pracownika.

## 37.2 Proces docelowy

Preferowany kierunek:

``` text
PRACOWNIK
→ wpis czasu
→ wskazanie pakietu / rodzaju czasu

BRYGADZISTA
→ widok całej ekipy
→ szybka weryfikacja dnia
→ zatwierdzenie / korekta z historią

SYSTEM
→ sumowanie
→ koszt budowy
→ plan vs wykonanie
→ dane do wynagrodzeń
→ dane do analityki
```

Krytyczna zasada: **godziny powinny być przypisane do kontekstu ich
powstania**, a nie wyłącznie do pracownika i daty.

------------------------------------------------------------------------

# 38. KLASYFIKACJA CZASU PRACY

System musi rozróżniać co najmniej następujące klasy czasu:

## 38.1 Praca produktywna / normowana

Praca wykonywana na konkretnym pakiecie, dla której możliwe jest
określenie budżetu lub normatywu rbh.

Przykłady: - montaż konstrukcji, - montaż tras, - układanie kabli, -
obróbka kabli, - podłączenia, - montaż aparatury.

## 38.2 Praca pomocnicza

Praca konieczna dla realizacji, która nie zawsze powinna być oceniana
identycznie jak produkcja.

Przykłady: - przygotowanie stanowiska, - organizacja narzędzi, -
sprzątanie, - prace porządkowe, - pomoc logistyczna, - zabezpieczenie
frontu robót.

Część prac pomocniczych może w przyszłości otrzymać własne normatywy.

## 38.3 Przestój / czas niezawiniony przez wykonawcę

Przykłady: - brak materiału, - brak dokumentacji, - brak frontu, -
oczekiwanie na decyzję, - oczekiwanie na inną branżę, - awaria, -
problem projektowy, - problem po stronie inwestora.

Taki czas musi być raportowany osobno i nie może automatycznie obniżać
oceny wydajności pracownika.

## 38.4 Praca zastępcza / wymuszona

Przykład: zaplanowany montaż nie może się rozpocząć z powodu braku
materiału, więc zespół zostaje skierowany do sprzątania lub innej pracy.

System powinien zapisać: - pierwotnie planowany pakiet, - przyczynę jego
blokady, - decyzję o przeniesieniu ludzi, - pakiet/pracę zastępczą, -
czas poświęcony na pracę zastępczą.

Dzięki temu nie należy interpretować zmiany planu jako niskiej
produktywności pracownika.

------------------------------------------------------------------------

# 39. BLOKADY PAKIETÓW I ZMIANA PLANU

Pakiet powinien posiadać możliwość ustawienia statusu **ZABLOKOWANY**.

Przy blokadzie wymagane: - przyczyna, - data i czas, - osoba
zgłaszająca, - opcjonalny komentarz, - opcjonalne zdjęcie/dokument, -
przewidywany wpływ, - możliwość wskazania osoby odpowiedzialnej za
usunięcie blokady.

System powinien umożliwiać szybkie: - przełożenie pracowników na inny
pakiet, - zapisanie tej decyzji, - zachowanie pierwotnego planu, -
analizę straconego czasu.

Po zakończeniu pakietu można zadawać krótkie pytania: - Czy wystąpiły
problemy? - Czy były poprawki? - Czy wystąpiły przestoje? - Czy założony
normatyw był realistyczny?

------------------------------------------------------------------------

# 40. ZAKUPY DROBNE --- STAN OBECNY

Drobniejsze materiały są obecnie kupowane głównie przez inżynierów.

Typowe scenariusze: 1. inżynier sam zamawia materiał w hurtowni, 2.
inżynier jedzie do hurtowni, 3. zakup opłacany jest służbową kartą
przypisaną do pracownika.

Aktualnie informacja: - kto kupił, - dla której budowy, - czego dotyczył
zakup,

nie zawsze trafia w uporządkowanej formie do osoby rozliczającej
dokumenty.

W efekcie pracownik zajmujący się fakturami musi czasem telefonicznie
ustalać w firmie, kto wykonał zakup i czego dotyczył.

### Cel 3Concept Work

Informacja merytoryczna o zakupie ma powstawać **w momencie zakupu lub
zamówienia**, a nie podczas późniejszego „śledztwa" przy fakturze.

------------------------------------------------------------------------

# 41. NUMER BUDOWY I KATEGORIE KOSZTÓW

3Concept posiada funkcjonujący system numerów budów.

**Numer budowy jest kluczowym identyfikatorem biznesowym i powinien
zostać zachowany w 3Concept Work.**

Nie tworzyć konkurencyjnej numeracji bez wyraźnej potrzeby.

Znane obecnie kategorie kosztowe obejmują: - materiały / materiały
zmienne, - narzędzia, - flotę, - koszty osobowe.

Dokładny słownik kategorii należy później pobrać/zweryfikować z obecnego
systemu.

Aktualne rozliczenie kosztów funkcjonuje prawdopodobnie w programie
**Subiekt** --- wymaga to potwierdzenia przed projektowaniem integracji.

### Zasada architektoniczna

3Concept Work: - nie zastępuje księgowości, - gromadzi kontekst
operacyjny kosztu, - przypisuje koszt do numeru budowy / pakietu / osoby
/ zamówienia, - może przekazywać lub importować dane z systemu
księgowego.

------------------------------------------------------------------------

# 42. FAKTURY, KSeF I DOKUMENTY FIZYCZNE

Faktury zakupowe w Polsce trafiają obecnie do obiegu księgowego m.in.
poprzez **KSeF --- Krajowy System e-Faktur**.

Księgowość pobiera dokumenty z właściwego systemu księgowego / KSeF.

Jednocześnie nadal występują dokumenty fizyczne, np. paragony z NIP,
które muszą być przekazywane do firmy.

### Rola 3Concept Work

Work nie powinien kopiować funkcji księgowości.

Powinien przechowywać **opis merytoryczny i operacyjny**: - kto dokonał
zakupu, - numer budowy, - kategoria kosztu, - czego zakup dotyczył, -
ewentualny pakiet, - zamówienie, - dostawa/WZ, - status weryfikacji.

W przyszłości możliwe powiązanie dokumentu operacyjnego z
identyfikatorem faktury z systemu księgowego/KSeF.

------------------------------------------------------------------------

# 43. ZAMÓWIENIA --- NOWY MODUŁ

Do zakresu 3Concept Work dodać pełny moduł **Zamówienia / Zakupy**.

Docelowy proces:

``` text
ZAPOTRZEBOWANIE
→ WERYFIKACJA
→ AKCEPTACJA (jeżeli wymagana)
→ ZAMÓWIENIE
→ WIADOMOŚĆ DO DOSTAWCY
→ POTWIERDZENIE DOSTAWCY
→ OCZEKIWANIE NA DOSTAWĘ
→ DOSTAWA
→ WZ
→ FAKTURA / DOKUMENT KOSZTOWY
→ ROZLICZENIE
→ ZAMKNIĘCIE
```

Zamówienie powinno mieć: - numer, - numer budowy, - osobę zamawiającą, -
dostawcę, - pozycje, - ilości, - ceny, jeśli znane, - oczekiwany
termin, - status, - powiązane wiadomości, - dokumenty, - WZ, -
faktury, - powiązane pakiety.

### Skrzynka zakupowa

Rozważyć integrację z dedykowaną skrzynką, np. `zamowienia@3concept...`.

System docelowo powinien móc: - odczytywać wiadomości dotyczące
zamówień, - przypisywać je do istniejącego zamówienia, - wyświetlać
potwierdzenia dostawcy, - przechowywać załączniki, - wykrywać numer
zamówienia/budowy, - sygnalizować zmianę terminu dostawy.

Integrację e-mail projektować jako moduł, a nie jako warunek działania
rdzenia.

------------------------------------------------------------------------

# 44. PRZYJĘCIE DOSTAWY I WZ --- STAN OBECNY

Obecnie brak formalnego procesu przyjęcia dostawy.

Problemy: - WZ może pozostać na budowie, - dokument może trafić do
segregatora, - dokument może zostać zagubiony lub wyrzucony, - brak
jednolitego potwierdzenia, co faktycznie przyjechało, - brak systemowej
informacji kiedy i gdzie nastąpiła dostawa, - brak potwierdzenia
kompletności.

## Proces docelowy: „Przyjmij dostawę"

Operacja ma być możliwa z telefonu i trwać możliwie krótko.

Minimalny formularz: - budowa, - zamówienie (jeżeli istnieje), -
dostawca, - zdjęcie/skan WZ, - data/czas, - status: kompletna /
częściowa / niezgodna, - opcjonalne zdjęcia materiału, - krótka uwaga.

System powinien: - utworzyć cyfrową kopię WZ, - przypiąć ją do budowy, -
przypiąć do zamówienia, - zapisać autora odbioru, - porównać dostawę z
zamówieniem, gdy dane są dostępne, - oznaczyć brakujące pozycje, -
pozostawić ślad audytowy.

### Zasada

**WZ jest zdarzeniem logistycznym, a nie tylko dokumentem do archiwum.**

------------------------------------------------------------------------

# 45. ŁAŃCUCH ZAKUPOWO-LOGISTYCZNY

Docelowo system powinien zapewniać widoczność całego łańcucha:

``` text
POTRZEBA NA BUDOWIE
      ↓
ZAPOTRZEBOWANIE
      ↓
ZAMÓWIENIE
      ↓
POTWIERDZENIE DOSTAWCY
      ↓
TERMIN DOSTAWY
      ↓
DOSTAWA
      ↓
WZ / ODBIÓR
      ↓
FAKTURA / PARAGON
      ↓
OPIS MERYTORYCZNY
      ↓
KOSZT BUDOWY
```

Powiązanie z realizacją:

``` text
BRAK MATERIAŁU
→ BLOKADA PAKIETU
→ POWIĄZANE ZAPOTRZEBOWANIE/ZAMÓWIENIE
→ TERMIN DOSTAWY
→ PRZYJĘCIE DOSTAWY
→ MOŻLIWOŚĆ ODBLOKOWANIA PAKIETU
```

Jest to jeden z kluczowych przyszłych mechanizmów platformy.

------------------------------------------------------------------------

# 46. POSTĘP BUDOWY --- STAN OBECNY

Aktualnie zarząd/kierownik pozyskuje informacje o postępie głównie
poprzez rozmowy telefoniczne z inżynierem.

Wiedza o stanie realizacji jest więc w dużej części: - w głowie
inżyniera, - przekazywana ustnie, - trudna do agregowania
historycznie, - nie zawsze dostępna bez kontaktu z konkretną osobą.

### Cel docelowy

3Concept Work powinien umożliwiać uzyskanie stanu budowy bez
konieczności wykonywania telefonu, przy zachowaniu telefonu/rozmowy jako
normalnego kanału operacyjnego.

Przykładowy dashboard:

``` text
BUDOWA 075

Obwody pierwotne       80%
Obwody wtórne          40%
Trasy kablowe          65%
Kable                   BLOKADA

Problem:
Brak materiału X

Zamówienie:
PO-075-014

Planowana dostawa:
...

Ostatnia aktualizacja:
Inżynier budowy
```

Dokładny sposób określania procentu postępu wymaga osobnego
zaprojektowania. Nie generować arbitralnych procentów przez AI.

------------------------------------------------------------------------

# 47. DZIENNIK WEWNĘTRZNY I LOKALNY DYSK 3CONCEPT

Firma posiada własny dysk/zasób plikowy, na którym mają być utrzymywane
katalogi budów.

3Concept Work powinien umożliwiać automatyczne odkładanie plików do
ustalonej struktury katalogów.

Przykładowa koncepcja:

``` text
BUDOWY/
└── 075_NAZWA_BUDOWY/
    ├── 01_DZIENNIK/
    │   ├── Dziennik.xlsx
    │   └── Zdjecia/
    ├── 02_ZAMOWIENIA/
    ├── 03_DOSTAWY_WZ/
    ├── 04_FAKTURY_DOKUMENTY_KOSZTOWE/
    ├── 05_RAPORTY/
    ├── 06_DOKUMENTACJA_TECHNICZNA/
    └── 99_ARCHIWUM/
```

To jest struktura robocza. Finalną strukturę katalogów należy
zatwierdzić przed implementacją.

## Excel dziennika

Użytkownik chce zachować automatycznie aktualizowany plik Excel
dziennika według zdefiniowanego wzoru.

Założenie: - dane źródłowe znajdują się w bazie 3Concept Work, - po
zatwierdzeniu wpisu dziennika system aktualizuje/generuje plik Excel, -
plik jest odkładany na firmowym dysku, - aplikacja webowa prezentuje
dane dziennika bezpośrednio z bazy, - możliwe jest pobranie/otwarcie
aktualnego Excela.

Nie traktować Excela jako jedynego źródła prawdy.

## Synchronizacja z lokalnym zasobem

Nie wystawiać firmowego udziału plikowego bezpośrednio do internetu.

Rozważyć lokalną usługę, roboczo **3Concept Sync Agent**, działającą w
sieci firmowej/na serwerze, która: - odbiera autoryzowane zadania
synchronizacji, - zapisuje zdjęcia i dokumenty, - generuje/aktualizuje
Excel, - raportuje powodzenie/błędy, - nie wymaga publicznego
udostępnienia SMB/NAS.

Szczegóły techniczne wymagają późniejszej analizy infrastruktury firmy.

------------------------------------------------------------------------

# 48. OBIEG DOKUMENTÓW --- ZASADA WSPÓLNA

Dziennik, WZ, faktury/paragony, zamówienia i pozostałe dokumenty powinny
korzystać ze wspólnego mechanizmu dokumentowego.

Każdy dokument: - ma typ, - autora, - datę, - budowę, - opcjonalnie
pakiet, - opcjonalnie zamówienie, - status, - plik źródłowy, -
metadane, - historię zmian/akceptacji.

Przykładowe statusy: - nowy, - do weryfikacji, - zweryfikowany, - wymaga
uzupełnienia, - przekazany dalej, - zamknięty.

Statusy mogą różnić się zależnie od typu dokumentu.

### Jedna informacja --- wiele zastosowań

Przykład WZ:

``` text
zdjęcie WZ
   ↓
archiwum dokumentów
   ↓
potwierdzenie dostawy
   ↓
powiązanie z zamówieniem
   ↓
powiązanie z budową
   ↓
informacja logistyczna
   ↓
podstawa do porównania z fakturą
```

Nie wymagać wielokrotnego wprowadzania tego samego dokumentu.

------------------------------------------------------------------------

# 49. CENTRUM SPRAW / „MOJA KOLEJKA"

Do roadmapy dodać wspólny ekran z zadaniami wymagającymi działania
użytkownika.

Przykłady:

### Zarząd / kierownik

-   zamówienia do akceptacji,
-   przekroczenia budżetu,
-   ważne blokady,
-   delegacje do zatwierdzenia.

### Inżynier

-   wpis dziennika do uzupełnienia,
-   dostawa do potwierdzenia,
-   dokument do opisania,
-   pakiet zablokowany,
-   WZ do weryfikacji.

### Brygadzista

-   godziny zespołu do zatwierdzenia,
-   pakiet do aktualizacji,
-   brak materiału.

### Pracownik

-   godziny do uzupełnienia,
-   delegacja,
-   nierozliczona zaliczka,
-   przypisane zadanie.

Celem jest ograniczenie komunikacji typu „pamiętaj, żeby...".

------------------------------------------------------------------------

# 50. ZAKTUALIZOWANA ZASADA ARCHITEKTONICZNA

3Concept Work należy projektować jako **platformę procesową**, a nie
zbiór niezależnych formularzy.

Centralne obiekty:

``` text
PRACOWNIK ─────────────┐
                      │
KONTRAKT → BUDOWA → PAKIET
              │       │
              │       ├── CZAS
              │       ├── PRZESTÓJ
              │       ├── DZIENNIK
              │       └── ZDJĘCIA
              │
              ├── ZAPOTRZEBOWANIE
              │       ↓
              ├── ZAMÓWIENIE
              │       ↓
              ├── DOSTAWA
              │       ↓
              ├── WZ
              │       ↓
              └── KOSZT / DOKUMENT
```

Najważniejsze pytanie przy projektowaniu każdej nowej funkcji:

> Czy system już posiada tę informację w innym miejscu?

Jeżeli tak, należy ją powiązać lub automatycznie wykorzystać zamiast
wymagać ponownego wpisania.

------------------------------------------------------------------------

# 51. NOWE OTWARTE TEMATY DO DALSZEGO MAPOWANIA

Do kolejnych rozmów pozostają m.in.:

1.  Jak często i w jakiej formie ma być aktualizowany stan budowy.
2.  Jak wygląda obecnie proces delegacji od wyjazdu do rozliczenia.
3.  Jak wyglądają zaliczki i ich rozliczenie.
4.  Jak wygląda obecny obieg narzędzi i sprzętu.
5.  Jak zarządzana jest flota.
6.  Jak wygląda magazyn i wydawanie materiałów.
7.  Jak przebiega proces reklamacji/poprawek.
8.  Jak wygląda odbiór wykonanych prac.
9.  Jak powstają raporty dla inwestora.
10. Jak wygląda obieg dokumentacji technicznej i rewizji.
11. Jakie dane dokładnie znajdują się w HRF.
12. Jaki dokładnie system księgowy jest używany i jakie ma możliwości
    integracyjne.
13. Jaka skrzynka e-mail będzie wykorzystywana dla zamówień.
14. Jak ma wyglądać finalna struktura katalogów na dysku firmowym.
15. Jaki jest wzorcowy Excel dziennika i jakie pola mają być w nim
    automatycznie aktualizowane.
