"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SectionLabel } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";
import { addTeamMemberAction, removeTeamMemberAction } from "../actions";

export interface TeamMemberItem {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  username: string | null;
  isActive: boolean;
}

export interface TeamCandidate {
  id: string;
  name: string;
  position: string;
}

export interface TeamPanelProps {
  siteNumber: string;
  members: TeamMemberItem[];
  /** Puste = brak `team.manage` (tylko podgląd). */
  candidates?: TeamCandidate[];
  canManage: boolean;
  /** Linki do pracowników tylko dla admina (ekran `/admin/pracownicy`). */
  linkEmployees: boolean;
}

/** Zespół budowy: lista z historią (zdjęcie zamyka przypisanie) i dodawanie z listy pracowników. */
export function TeamPanel({
  siteNumber,
  members,
  candidates = [],
  canManage,
  linkEmployees,
}: TeamPanelProps) {
  const [state, add, pending] = useActionState(addTeamMemberAction.bind(null, siteNumber), {});
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{`Zespół budowy · ${members.length}`}</SectionLabel>
      {members.length === 0 && (
        <p className="text-sm text-ink-2">Nikt jeszcze nie jest w zespole.</p>
      )}
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-3 border-[1.5px] border-line px-3 py-2"
          >
            <span className="flex min-w-0 flex-col">
              {linkEmployees ? (
                <Link href={`/admin/pracownicy/${m.employeeId}`} className="font-medium underline">
                  {m.name}
                </Link>
              ) : (
                <span className="font-medium">{m.name}</span>
              )}
              <span className="text-[13px] text-ink-2">
                {m.position}
                {m.username ? ` · ${m.username}` : ""}
                {m.isActive ? "" : " · konto zablokowane"}
              </span>
            </span>
            {canManage && (
              <form action={removeTeamMemberAction.bind(null, siteNumber, m.id)}>
                <Button type="submit" className="px-3 text-[13.5px]">
                  Zdejmij
                </Button>
              </form>
            )}
          </li>
        ))}
      </ul>
      {canManage && (
        <form action={add} className="flex flex-col gap-2">
          <label
            htmlFor="employeeId"
            className="font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase"
          >
            Dodaj do zespołu
          </label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <select
              id="employeeId"
              name="employeeId"
              required
              className="min-h-12 w-full min-w-0 border-[1.5px] border-line bg-surface px-3 text-base text-ink"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.position}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={pending || candidates.length === 0}>
              Dodaj
            </Button>
          </div>
          {state.error && <Status variant="alarm">{state.error}</Status>}
          {state.ok && <Status variant="done">{state.ok}</Status>}
        </form>
      )}
    </section>
  );
}
