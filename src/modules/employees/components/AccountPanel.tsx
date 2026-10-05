"use client";

import { useActionState } from "react";
import { SectionLabel } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";
import { Tag } from "@/components/ui/Tag";
import { TextField } from "@/components/ui/TextField";
import {
  blockEmployeeAction,
  grantRoleAction,
  resetPasswordAction,
  revokeRoleAction,
  unblockEmployeeAction,
  type EmployeeActionState,
} from "../actions";
import { GRANTABLE_ROLES } from "../schemas";
import { ROLE_SHORT } from "./EmployeeList";

function Feedback({ state }: { state: EmployeeActionState }) {
  if (state.error) return <Status variant="alarm">{state.error}</Status>;
  if (state.ok) return <Status variant="done">{state.ok}</Status>;
  return null;
}

export interface RoleItem {
  id: string;
  role: string;
  siteId: string | null;
}

/** Role pracownika: lista z odebraniem i nadanie roli globalnej / WORKER (budowy od it. 8). */
export function RolesPanel({ id, roles }: { id: string; roles: RoleItem[] }) {
  const [state, grant, pending] = useActionState(grantRoleAction.bind(null, id), {});
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>Role</SectionLabel>
      {roles.length === 0 && <p className="text-sm text-ink-2">Brak ról — konto bez dostępu.</p>}
      <ul className="flex flex-col gap-2">
        {roles.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 border-[1.5px] border-line px-3 py-2"
          >
            <Tag>{`${ROLE_SHORT[r.role] ?? r.role}${r.siteId ? ` @${r.siteId}` : ""}`}</Tag>
            <form action={revokeRoleAction.bind(null, id, r.id)}>
              <Button type="submit" className="px-3 text-[13.5px]">
                Odbierz
              </Button>
            </form>
          </li>
        ))}
      </ul>
      <form action={grant} className="flex flex-col gap-2">
        <label
          htmlFor="role"
          className="font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase"
        >
          Nadaj rolę
        </label>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <select
            id="role"
            name="role"
            className="min-h-12 border-[1.5px] border-line bg-surface px-3 text-base text-ink"
          >
            {GRANTABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_SHORT[role]}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={pending}>
            Nadaj
          </Button>
        </div>
        <p className="text-[12.5px] text-ink-2">
          Kierownik, inżynier i brygadzista wymagają wskazania budowy — dojdzie w iteracji 8.
        </p>
        <Feedback state={state} />
      </form>
    </section>
  );
}

/** Blokada / odblokowanie konta i reset hasła (hasło tymczasowe pokazane raz). */
export function AccountPanel({ id, isActive }: { id: string; isActive: boolean }) {
  const [blockState, block, blocking] = useActionState(
    (isActive ? blockEmployeeAction : unblockEmployeeAction).bind(null, id),
    {},
  );
  const [resetState, reset, resetting] = useActionState(() => resetPasswordAction(id), {});

  return (
    <section className="flex flex-col gap-5">
      <form action={reset} className="flex flex-col gap-2">
        <SectionLabel>Hasło</SectionLabel>
        {resetState.temporaryPassword ? (
          <div className="border-[1.5px] border-ink p-3 text-sm">
            Nowe hasło tymczasowe: <Tag>{resetState.temporaryPassword}</Tag>
            <p className="mt-2 text-[12.5px] text-ink-2">
              Widoczne tylko teraz. Wszystkie sesje pracownika zostały zakończone.
            </p>
          </div>
        ) : (
          <Button type="submit" disabled={resetting}>
            {resetting ? "Resetowanie…" : "Resetuj hasło"}
          </Button>
        )}
        {resetState.error && <Status variant="alarm">{resetState.error}</Status>}
      </form>

      <form action={block} className="flex flex-col gap-2">
        <SectionLabel>{isActive ? "Blokada konta" : "Konto zablokowane"}</SectionLabel>
        <TextField id="reason" name="reason" label="Powód · opcjonalnie" />
        <Button type="submit" variant={isActive ? "default" : "primary"} disabled={blocking}>
          {isActive ? "Zablokuj konto" : "Odblokuj konto"}
        </Button>
        <Feedback state={blockState} />
      </form>
    </section>
  );
}
