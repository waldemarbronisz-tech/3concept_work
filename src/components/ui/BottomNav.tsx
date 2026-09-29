import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "./cn";

export interface BottomNavItem {
  href: string;
  label: string;
  /** Ikona liniowa; rysowana 24 px z obrysem 1.8. Podpis jest zawsze widoczny. */
  icon: LucideIcon;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  /** Adres bieżącego ekranu — ta pozycja dostaje `aria-current`. */
  currentHref?: string;
}

/** Nawigacja na telefonie: ikona + podpis; aktywna pozycja granatowa z belką u góry. */
export function BottomNav({ items, currentHref }: BottomNavProps) {
  return (
    <nav aria-label="Nawigacja" className="border-t-[1.5px] border-ink bg-surface">
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const current = href === currentHref;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "relative flex min-h-15 flex-col items-center justify-center gap-1 text-[12.5px]",
                  current
                    ? "font-semibold text-navy before:absolute before:inset-x-[18%] before:-top-[1.5px] before:h-[3px] before:bg-navy"
                    : "text-ink-2",
                )}
              >
                <Icon size={24} strokeWidth={1.8} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
