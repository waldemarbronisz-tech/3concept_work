import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { NavItem } from "@/app/navigation";
import logo from "../../../public/brand/3concept-logo.png";
import { AppNav } from "./AppNav";

/**
 * Powłoka po zalogowaniu (UI_STYLE §5): nagłówek z logo, treść, dolna nawigacja wg roli.
 * Telefon pierwszy; na desktopie arkusz o szerokości telefonu na papierze.
 */
export function AppShell({ nav, children }: { nav: NavItem[]; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col bg-surface sm:my-6 sm:min-h-0 sm:border-[1.5px] sm:border-ink md:max-w-4xl">
      <header className="flex items-center justify-between gap-3 border-b-[1.5px] border-ink px-4 py-3">
        <Link href="/" aria-label="Pulpit">
          <Image src={logo} alt="3Concept" className="h-auto w-[180px]" priority />
        </Link>
        <span className="font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase">
          Work · beta
        </span>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      {nav.length > 0 && <AppNav items={nav} />}
    </div>
  );
}

/** Etykieta sekcji formularza / listy (mono, uppercase). */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase">
      {children}
    </span>
  );
}
