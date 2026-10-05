"use client";

import { useActionState, useState } from "react";
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
import { GRANTABLE_ROLES, SITE_ROLES } from "../schemas";
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

export interface SiteOption {
  siteNumber: string;
  name: string;
}

export interface RolesPanelProps {
  id: string;
  roles: RoleItem[];
  /** Budowy do wyboru przy rolach budowy (`sites.list`). */
  sites: SiteOption[];
  /** Własne konto — ról nie zmienia się samemu (przypis ⁵). */
  isSelf: boolean;
  /** Aktor ma ADMIN + MANAGEMENT — tylko on nadaje/odbiera MANAGEMENT. */
  canManageManagement: boolean;
}

/** Role pracownika: lista z odebraniem i nadanie roli globalnej / WORKER (budowy od it. 8). */
export function RolesPanel({ id, roles, sites, isSelf, canManageManagement }: RolesPanelProps) {
  const [state, grant, pending] = useActionState(grantRoleAction.bind(null, id), {});
  const grantable = GRANTABLE_ROLES.filter((r) => r !== "MANAGEMENT" || canManageManagement);
  const [role, setRole] = useState<(typeof GRANTABLE_ROLES)[number]>("WORKER");
  const needsSite = (SITE_ROLES as readonly string[]).includes(role);

  if (isSelf) {
    return (
      <section className="flex flex-col gap-3">
        <SectionLabel>Role</SectionLabel>
        <ul className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <li key={r.id}>
              <Tag>{`${ROLE_SHORT[r.role] ?? r.role}${r.siteId ? ` @${r.siteId}` : ""}`}</Tag>
            </li>
          ))}
        </ul>
        <p className="text-[12.5px] text-ink-2">Własnych ról nie zmienia się samemu.</p>
      </section>
    );
  }

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
            {(r.role !== "MANAGEMENT" || canManageManagement) && (
              <form action={revokeRoleAction.bind(null, id, r.id)}>
                <Button type="submit" className="px-3 text-[13.5px]">
                  Odbierz
                </Button>
              </form>
            )}
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
            value={role}
            onChange={(e) => setRole(e.target.value as (typeof GRANTABLE_ROLES)[number])}
            className="min-h-12 w-full min-w-0 border-[1.5px] border-line bg-surface px-3 text-base text-ink"
          >
            {grantable.map((r) => (
              <option key={r} value={r}>
                {ROLE_SHORT[r]}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={pending || (needsSite && sites.length === 0)}>
            Nadaj
          </Button>
        </div>
        {needsSite && (
          <>
            <label
              htmlFor="siteNumber"
              className="font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase"
            >
              Budowa
            </label>
            <select
              id="siteNumber"
              name="siteNumber"
              required
              className="min-h-12 w-full min-w-0 border-[1.5px] border-line bg-surface px-3 text-base text-ink"
            >
              {sites.map((s) => (
                <option key={s.siteNumber} value={s.siteNumber}>
                  {s.siteNumber} · {s.name}
                </option>
              ))}
            </select>
            {sites.length === 0 && (
              <p className="text-[12.5px] text-ink-2">
                Najpierw załóż budowę (Budowy, Nowa budowa).
              </p>
            )}
          </>
        )}
        <Feedback state={state} />
      </form>
    </section>
  );
}

export interface AccountPanelProps {
  id: string;
  isActive: boolean;
  /** Powód, dla którego akcje są ukryte (własne konto, konto zarządu bez MANAGEMENT). */
  lockedReason?: string;
}

/** Blokada / odblokowanie konta i reset hasła (hasło tymczasowe pokazane raz). */
export function AccountPanel({ id, isActive, lockedReason }: AccountPanelProps) {
  const [blockState, block, blocking] = useActionState(
    (isActive ? blockEmployeeAction : unblockEmployeeAction).bind(null, id),
    {},
  );
  const [resetState, reset, resetting] = useActionState(() => resetPasswordAction(id), {});

  if (lockedReason) {
    return (
      <section className="flex flex-col gap-2">
        <SectionLabel>Konto</SectionLabel>
        <p className="text-[12.5px] text-ink-2">{lockedReason}</p>
      </section>
    );
  }

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
