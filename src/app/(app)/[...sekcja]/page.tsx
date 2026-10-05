import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";

export const metadata: Metadata = { title: "Sekcja w przygotowaniu · 3Concept Work" };

/** Pozycje nawigacji bez gotowego ekranu → zaślepka z milestone'em, nigdy 404 (PLAN_MVP it. 6). */
const SECTIONS: Record<string, { title: string; milestone: string; what: string }> = {
  kolejka: { title: "Kolejka", milestone: "M3", what: "sprawy wymagające Twojej reakcji" },
  czas: { title: "Czas", milestone: "M3", what: "wpis godzin, dzień ekipy, zatwierdzanie" },
  pakiety: { title: "Pakiety", milestone: "M2", what: "pakiety robocze, stany, blokady" },
  ekipa: { title: "Ekipa", milestone: "M1", what: "zespół budowy i jego godziny" },
  menu: { title: "Menu", milestone: "M0", what: "ustawienia konta i pozostałe sekcje" },
};

export default async function SectionPlaceholder({ params }: PageProps<"/[...sekcja]">) {
  const { sekcja } = await params;
  const section = SECTIONS[sekcja[0] ?? ""];
  if (!section || sekcja.length > 1) notFound();

  return (
    <>
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
    </>
  );
}
