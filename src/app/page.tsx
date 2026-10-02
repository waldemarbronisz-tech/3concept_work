import Image from "next/image";
import Link from "next/link";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";
import { Tag } from "@/components/ui/Tag";
import { TitleBlock } from "@/components/ui/TitleBlock";
import { signOut } from "@/core/auth/actions";
import { requireActor } from "@/core/auth/actor";
import { can } from "@/core/rbac";
import logo from "../../public/brand/3concept-logo.png";
import { NAV_PROFILE_LABEL, navigationFor } from "./navigation";

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

/** Pulpit startowy — docelowy layout z nawigacją wg roli dojdzie w iteracji 6. */
export default async function Home() {
  const actor = await requireActor();
  const nav = navigationFor(actor.roles);
  const canAudit = can(actor, "audit.readAll") || can(actor, "audit.readSystem");

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col bg-surface sm:my-6 sm:min-h-0 sm:border-[1.5px] sm:border-ink">
      <header className="flex items-center justify-between gap-3 border-b-[1.5px] border-ink px-4 py-3">
        <Image src={logo} alt="3Concept" className="h-auto w-[180px]" priority />
        <span className="font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase">
          Work · beta
        </span>
      </header>

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
          <span className="mb-2 block font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase">
            Role w systemie
          </span>
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
          <span className="block font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase">
            Na skróty
          </span>
          {canAudit && (
            <Link href="/admin/audyt" className="block">
              <Button className="w-full">Audyt zmian</Button>
            </Link>
          )}
          {nav.menu.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button className="w-full">{item.label}</Button>
            </Link>
          ))}
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

      {nav.profile !== "none" && <BottomNav items={nav.bottomNav} currentHref="/" />}
    </div>
  );
}
