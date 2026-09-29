import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "./cn";

export interface BottomNavItem {
  href: string;
  label: string;
  /** Ikona liniowa 24 px; podpis jest zawsze widoczny. */
  icon: ReactNode;
  current?: boolean;
}

/** Nawigacja na telefonie: ikona + podpis; aktywna pozycja granatowa z belką u góry. */
export function BottomNav({ items }: { items: BottomNavItem[] }) {
  return (
    <nav aria-label="Nawigacja" className="border-t-[1.5px] border-ink bg-surface">
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={cn(
                "relative flex min-h-15 flex-col items-center justify-center gap-1 text-[12.5px]",
                item.current
                  ? "font-semibold text-navy before:absolute before:inset-x-[18%] before:-top-[1.5px] before:h-[3px] before:bg-navy"
                  : "text-ink-2",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
