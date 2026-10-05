"use client";

import { usePathname } from "next/navigation";
import type { NavItem } from "@/app/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { toBottomNavItems } from "./nav-icons";

/** Dolna nawigacja z aktywną pozycją wyliczoną z bieżącej ścieżki (ikony mapowane tutaj, po stronie klienta). */
export function AppNav({ items: navItems }: { items: NavItem[] }) {
  const pathname = usePathname();
  const items = toBottomNavItems(navItems);
  const current =
    items.find((i) => i.href === pathname)?.href ??
    items.find((i) => i.href !== "/" && pathname.startsWith(`${i.href}/`))?.href;
  return <BottomNav items={items} currentHref={current} />;
}
