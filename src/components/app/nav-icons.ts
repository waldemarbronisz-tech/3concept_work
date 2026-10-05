import {
  Building2,
  Clock,
  HardHat,
  Inbox,
  type LucideIcon,
  Menu,
  Package,
  Settings,
  Users,
} from "lucide-react";
import type { NavIcon, NavItem } from "@/app/navigation";
import type { BottomNavItem } from "@/components/ui/BottomNav";

/** Klucze ikon z `src/app/navigation.ts` → komponenty Lucide (po stronie klienta). */
export const NAV_ICONS: Record<NavIcon, LucideIcon> = {
  inbox: Inbox,
  clock: Clock,
  package: Package,
  users: Users,
  "hard-hat": HardHat,
  building: Building2,
  menu: Menu,
  settings: Settings,
};

export const toBottomNavItems = (items: NavItem[]): BottomNavItem[] =>
  items.map((item) => ({ href: item.href, label: item.label, icon: NAV_ICONS[item.icon] }));
