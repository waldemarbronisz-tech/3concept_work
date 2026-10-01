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
        Zalogowano: {actor.user.name} <Tag>{actor.user.username ?? "—"}</Tag>
      </p>
      <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-ink-2">
        Role:{" "}
        {actor.roles.length === 0
          ? "brak — skontaktuj się z administratorem"
          : actor.roles.map((role) => <Tag key={role}>{role}</Tag>)}
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
