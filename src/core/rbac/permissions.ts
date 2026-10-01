import type { Role } from "./roles";

/**
 * Macierz uprawnień z docs/PLAN_MVP.md §3 („Macierz uprawnień na poziomie obszarów”).
 * Uprawnienie = obszar.czynność. Zakres mówi, gdzie rola je ma:
 * - `global` — wszędzie,
 * - `site`   — tylko na budowach z `RoleAssignment.siteId`,
 * - `own`    — tylko na własnych danych (userId aktora).
 */
export type Permission =
  // konta i role
  | "accounts.manage"
  | "accounts.resetPassword" // CONTRACT_MANAGER: zawężone, patrz canResetPassword()
  // słowniki, szablony etapów, katalog prac i normy
  | "dictionaries.read"
  | "dictionaries.manage"
  // budowy / kontrakty
  | "sites.list" // tylko numer i nazwa (admin: do przypisań ról)
  | "sites.read"
  | "sites.manage"
  // pakiety, etapy, blokady
  | "packages.read"
  | "packages.readBasic" // bez budżetów rbh i kosztów (pracownik)
  | "packages.report" // raport wykonania (brygadzista)
  | "packages.manage"
  // zespół budowy
  | "team.read"
  | "team.manage"
  // wpisy czasu i przestoje (D3: każdy wpisuje własne godziny; wpis za kogoś — patrz D5)
  | "time.read"
  | "time.write" // własne wpisy
  | "time.approve" // zatwierdzanie dnia ekipy na budowie
  | "time.manage" // korekta po zatwierdzeniu, z powodem
  // koszty i budżet
  | "costs.read"
  | "costs.manage"
  // akceptacje na poziomie firmy (§49)
  | "approvals.company"
  // audit log
  | "audit.readAll"
  | "audit.readSystem"
  | "audit.readRecord";

export type Scope = "global" | "site" | "own";

export const PERMISSIONS: Record<Role, Partial<Record<Permission, Scope>>> = {
  MANAGEMENT: {
    "dictionaries.read": "global",
    "sites.list": "global",
    "sites.read": "global",
    "packages.read": "global",
    "team.read": "global",
    "time.read": "global",
    "costs.read": "global",
    "approvals.company": "global",
    "audit.readAll": "global",
  },
  ADMIN: {
    // Tylko konfiguracja systemu — bez danych operacyjnych i kosztów (D10).
    "accounts.manage": "global",
    "accounts.resetPassword": "global",
    "dictionaries.read": "global",
    "dictionaries.manage": "global",
    "sites.list": "global",
    "audit.readSystem": "global",
  },
  CONTRACT_MANAGER: {
    "accounts.resetPassword": "site", // + reguła ról celu, canResetPassword()
    "dictionaries.read": "global",
    "sites.list": "global",
    "sites.read": "site",
    "sites.manage": "site",
    "packages.read": "site",
    "packages.manage": "site",
    "team.read": "site",
    "team.manage": "site",
    "time.read": "site",
    "time.write": "own",
    "time.approve": "site",
    "time.manage": "site",
    "costs.read": "site",
    "costs.manage": "site",
    "audit.readRecord": "site",
  },
  SITE_ENGINEER: {
    "dictionaries.read": "global",
    "sites.list": "global",
    "sites.read": "site",
    "packages.read": "site",
    "packages.manage": "site",
    "team.read": "site",
    "team.manage": "site",
    "time.read": "site",
    "time.write": "own",
    "time.approve": "site",
    "time.manage": "site",
    "audit.readRecord": "site",
  },
  FOREMAN: {
    "sites.list": "global",
    "sites.read": "site",
    "packages.read": "site",
    "packages.report": "site",
    "team.read": "site",
    "time.read": "site", // godziny brygady
    "time.write": "own", // swoje godziny jak każdy (D3); nie wpisuje za innych
    "time.approve": "site", // zatwierdza dzień ekipy na swojej budowie
  },
  WORKER: {
    // Zakres „swoje budowy” dojdzie z SiteAssignment (iteracja 8); do tego czasu `own`.
    "packages.readBasic": "own",
    "time.write": "own",
  },
};

/** Role, których hasło może resetować wyłącznie ADMIN (przypis ¹ macierzy). */
export const PRIVILEGED_ROLES: ReadonlySet<Role> = new Set([
  "MANAGEMENT",
  "ADMIN",
  "CONTRACT_MANAGER",
]);
