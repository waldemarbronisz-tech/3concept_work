import {
  Building2,
  Clock,
  HardHat,
  Inbox,
  type LucideIcon,
  Menu,
  Package,
  Users,
} from "lucide-react";

/**
 * Pozycje dolnej nawigacji na telefonie według roli (docs/UI_STYLE.md §5, U-04).
 * Profil to widok nawigacji, nie rola RBAC — przypisanie ról z RoleAssignment
 * do profili dojdzie razem z layoutem aplikacji (iteracja 6).
 */
export type NavProfile = "worker" | "foreman" | "engineer" | "management";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_PROFILE_LABEL: Record<NavProfile, string> = {
  worker: "Pracownik",
  foreman: "Brygadzista",
  engineer: "Inżynier",
  management: "Kierownik / Zarząd",
};

// Trasy powstaną w kolejnych iteracjach; adresy są już docelowe.
const ITEM = {
  queue: { href: "/kolejka", label: "Kolejka", icon: Inbox },
  time: { href: "/czas", label: "Czas", icon: Clock },
  packages: { href: "/pakiety", label: "Pakiety", icon: Package },
  crew: { href: "/ekipa", label: "Ekipa", icon: Users },
  site: { href: "/budowa", label: "Budowa", icon: HardHat },
  sites: { href: "/budowy", label: "Budowy", icon: Building2 },
  menu: { href: "/menu", label: "Menu", icon: Menu },
} satisfies Record<string, NavItem>;

export const BOTTOM_NAV: Record<NavProfile, NavItem[]> = {
  worker: [ITEM.queue, ITEM.time, ITEM.packages, ITEM.menu],
  foreman: [ITEM.queue, ITEM.crew, ITEM.packages, ITEM.menu],
  engineer: [ITEM.queue, ITEM.site, ITEM.time, ITEM.menu],
  management: [ITEM.queue, ITEM.sites, ITEM.time, ITEM.menu],
};
