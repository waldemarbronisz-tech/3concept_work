import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { signOut } from "@/core/auth/actions";
import { requireActor } from "@/core/auth/actor";

/** Tymczasowy pulpit — właściwy layout z nawigacją wg roli dojdzie w iteracji 6. */
export default async function Home() {
  const actor = await requireActor();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">3Concept Work</h1>
      <p className="text-ink-2">Wersja beta — dane testowe</p>
      <p className="flex items-center gap-2 text-sm">
        Zalogowano: {actor.name} <Tag>{actor.username ?? "—"}</Tag>
      </p>
      <form action={signOut}>
        <Button type="submit">Wyloguj</Button>
      </form>
      {process.env.NODE_ENV === "development" && (
        <Link href="/dev/ui" className="mt-4 font-mono text-sm text-navy underline">
          Podgląd komponentów UI
        </Link>
      )}
    </main>
  );
}
