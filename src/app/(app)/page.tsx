import Link from "next/link";
import { SectionLabel } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";
import { Tag } from "@/components/ui/Tag";
import { TitleBlock } from "@/components/ui/TitleBlock";
import { signOut } from "@/core/auth/actions";
import { requireActor } from "@/core/auth/actor";
import { can } from "@/core/rbac";
import { NAV_PROFILE_LABEL, navigationFor } from "../navigation";

const ROLE_LABEL: Record<string, string> = {
  MANAGEMENT: "Zarząd",
  ADMIN: "Administrator",
  CONTRACT_MANAGER: "Kierownik kontraktu",
  SITE_ENGINEER: "Inżynier budowy",
  FOREMAN: "Brygadzista",
  WORKER: "Pracownik",
};

const today = () =>
  new Date().toLocaleDateString("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/** Pulpit startowy — pulpit per rola dojdzie z modułami (it. 8+). */
export default async function Home() {
  const actor = await requireActor();
  const nav = navigationFor(actor.roles);
  const canAudit = can(actor, "audit.readAll") || can(actor, "audit.readSystem");

  return (
    <main className="flex flex-1 flex-col gap-5 px-3 py-4">
      <TitleBlock
        cells={[
          { label: "Użytkownik", value: actor.user.name },
          { label: "Login", value: actor.user.username ?? "—", mono: true },
          { label: "Data", value: today(), mono: true },
        ]}
        className="grid-cols-[minmax(0,1fr)_auto_auto]"
      />

      <section>
        <SectionLabel>Role w systemie</SectionLabel>
        {nav.profile === "none" ? (
          <Status variant="warn">
            Konto nie ma przypisanej roli. Skontaktuj się z administratorem.
          </Status>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {actor.roles.map((role) => (
              <Tag key={role}>{ROLE_LABEL[role] ?? role}</Tag>
            ))}
            <span className="text-[13px] text-ink-2">
              · widok: {NAV_PROFILE_LABEL[nav.profile].toLowerCase()}
            </span>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Na skróty</SectionLabel>
        {nav.menu.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <Button className="w-full">{item.label}</Button>
          </Link>
        ))}
        {canAudit && (
          <Link href="/admin/audyt" className="block">
            <Button className="w-full">Audyt zmian</Button>
          </Link>
        )}
        <form action={signOut}>
          <Button type="submit" className="w-full">
            Wyloguj
          </Button>
        </form>
      </section>

      <p className="mt-auto text-center font-mono text-[11px] text-ink-2">
        Wersja beta — dane testowe
        {process.env.NODE_ENV === "development" && (
          <>
            {" · "}
            <Link href="/dev/ui" className="underline">
              komponenty UI
            </Link>
          </>
        )}
      </p>
    </main>
  );
}
