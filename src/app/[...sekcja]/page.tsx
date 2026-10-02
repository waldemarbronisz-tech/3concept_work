import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";
import { requireActor } from "@/core/auth/actor";
import { navigationFor } from "../navigation";

export const metadata: Metadata = { title: "Sekcja w przygotowaniu · 3Concept Work" };

/** Pozycje nawigacji bez gotowego ekranu → zaślepka z milestone'em, nigdy 404 (PLAN_MVP it. 6). */
const SECTIONS: Record<string, { title: string; milestone: string; what: string }> = {
  kolejka: { title: "Kolejka", milestone: "M3", what: "sprawy wymagające Twojej reakcji" },
  czas: { title: "Czas", milestone: "M3", what: "wpis godzin, dzień ekipy, zatwierdzanie" },
  pakiety: { title: "Pakiety", milestone: "M2", what: "pakiety robocze, stany, blokady" },
  ekipa: { title: "Ekipa", milestone: "M1", what: "zespół budowy i jego godziny" },
  budowa: { title: "Budowa", milestone: "M1", what: "Twoja budowa: etapy, pakiety, pulpit" },
  budowy: { title: "Budowy", milestone: "M1", what: "wszystkie budowy i kontrakty" },
  menu: { title: "Menu", milestone: "M0", what: "ustawienia konta i pozostałe sekcje" },
  admin: { title: "Administracja", milestone: "M1", what: "konta, role, słowniki, katalog prac" },
};

export default async function SectionPlaceholder({ params }: PageProps<"/[...sekcja]">) {
  const { sekcja } = await params;
  const section = SECTIONS[sekcja[0] ?? ""];
  if (!section || sekcja.length > 1) notFound();

  const actor = await requireActor();
  const nav = navigationFor(actor.roles);
  const href = `/${sekcja[0]}`;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col bg-surface sm:my-6 sm:min-h-0 sm:border-[1.5px] sm:border-ink">
      <AppBar
        title={section.title}
        backHref="/"
        titleBlock={[
          { label: "Arkusz", value: section.title },
          { label: "Etap", value: section.milestone, mono: true },
        ]}
      />
      <main className="flex flex-1 flex-col items-start gap-4 px-3 py-6">
        <Status variant="run">{`Sekcja w przygotowaniu (${section.milestone})`}</Status>
        <p className="text-sm text-ink-2">Tu będzie: {section.what}.</p>
        <Link href="/">
          <Button>Wróć na pulpit</Button>
        </Link>
      </main>
      {nav.profile !== "none" && <BottomNav items={nav.bottomNav} currentHref={href} />}
    </div>
  );
}
