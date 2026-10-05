import type { Role } from "@/core/rbac";

export type { Role };

/**
 * Profil dolnej nawigacji na telefonie (docs/UI_STYLE.md §5, U-04) — widok,
 * nie uprawnienie. Wybiera go `navigationFor` z ról użytkownika.
 */
export type NavProfile = "worker" | "foreman" | "engineer" | "management";

/** Klucz ikony — komponenty Lucide mapuje po stronie klienta `components/app/nav-icons.ts`. */
export type NavIcon =
  "inbox" | "clock" | "package" | "users" | "hard-hat" | "building" | "menu" | "settings";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
}

export const NAV_PROFILE_LABEL: Record<NavProfile, string> = {
  worker: "Pracownik",
  foreman: "Brygadzista",
  engineer: "Inżynier",
  management: "Kierownik / Zarząd",
};

// Trasy powstaną w kolejnych iteracjach; adresy są już docelowe.
const ITEM = {
  queue: { href: "/kolejka", label: "Kolejka", icon: "inbox" },
  time: { href: "/czas", label: "Czas", icon: "clock" },
  packages: { href: "/pakiety", label: "Pakiety", icon: "package" },
  crew: { href: "/ekipa", label: "Ekipa", icon: "users" },
  site: { href: "/budowa", label: "Budowa", icon: "hard-hat" },
  sites: { href: "/budowy", label: "Budowy", icon: "building" },
  menu: { href: "/menu", label: "Menu", icon: "menu" },
  admin: { href: "/admin", label: "Administracja", icon: "settings" },
} satisfies Record<string, NavItem>;

export const BOTTOM_NAV: Record<NavProfile, NavItem[]> = {
  worker: [ITEM.queue, ITEM.time, ITEM.packages, ITEM.menu],
  foreman: [ITEM.queue, ITEM.crew, ITEM.packages, ITEM.menu],
  engineer: [ITEM.queue, ITEM.site, ITEM.time, ITEM.menu],
  management: [ITEM.queue, ITEM.sites, ITEM.time, ITEM.menu],
};

/** Od najwyższej roli; pierwsza pasująca wybiera profil. `ADMIN` nie bierze udziału. */
const PROFILE_BY_ROLE: ReadonlyArray<[Role, NavProfile]> = [
  ["MANAGEMENT", "management"],
  ["CONTRACT_MANAGER", "management"],
  ["SITE_ENGINEER", "engineer"],
  ["FOREMAN", "foreman"],
  ["WORKER", "worker"],
];

export interface Navigation {
  /** `none` — konto bez ról: bez nawigacji, tylko ekran „Konto nie ma przypisanej roli…”. */
  profile: NavProfile | "none";
  bottomNav: NavItem[];
  /** Pozycje Menu zależne od roli (dochodzą do stałych pozycji Menu). */
  menu: NavItem[];
}

/**
 * Nawigacja z ról systemowych (RoleAssignment). Funkcja na budowie
 * (SiteAssignment) celowo nie wchodzi — nie zmienia dolnego paska.
 */
export function navigationFor(roles: readonly Role[]): Navigation {
  const held = new Set(roles);
  if (held.size === 0) return { profile: "none", bottomNav: [], menu: [] };

  const isAdmin = held.has("ADMIN");
  const ranked = PROFILE_BY_ROLE.find(([role]) => held.has(role))?.[1];
  // Tu zostaje tylko ADMIN — dostaje pasek kierownika/zarządu.
  const profile = ranked ?? "management";

  return {
    profile,
    bottomNav: BOTTOM_NAV[profile],
    menu: isAdmin ? [ITEM.admin] : [],
  };
}
