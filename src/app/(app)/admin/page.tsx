import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionLabel } from "@/components/app/AppShell";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { requireActor } from "@/core/auth/actor";
import { can } from "@/core/rbac";

export const metadata: Metadata = { title: "Administracja · 3Concept Work" };

/** Hub administracji: konta i pracownicy, audyt. Słowniki i katalog dojdą w M2. */
export default async function AdminPage() {
  const actor = await requireActor();
  if (!can(actor, "accounts.manage")) notFound();

  return (
    <>
      <AppBar title="Administracja" backHref="/" />
      <main className="flex flex-1 flex-col gap-5 px-3 py-4">
        <section className="flex flex-col gap-2">
          <SectionLabel>Konta</SectionLabel>
          <Link href="/admin/pracownicy" className="block">
            <Button className="w-full">Pracownicy i konta</Button>
          </Link>
          <Link href="/admin/pracownicy/nowy" className="block">
            <Button variant="primary" className="w-full">
              + Nowy pracownik
            </Button>
          </Link>
        </section>
        <section className="flex flex-col gap-2">
          <SectionLabel>Kontrola</SectionLabel>
          <Link href="/admin/audyt" className="block">
            <Button className="w-full">Audyt zmian</Button>
          </Link>
        </section>
        <p className="font-mono text-[11px] text-ink-2">
          Słowniki, szablony etapów i katalog prac — w przygotowaniu (M2).
        </p>
      </main>
    </>
  );
}
