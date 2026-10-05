"use client";

import { useActionState } from "react";
import { SectionLabel } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { OptionCard } from "@/components/ui/OptionCard";
import { Status } from "@/components/ui/Status";
import { TextField } from "@/components/ui/TextField";
import {
  createSiteAction,
  updateSiteAction,
  updateSiteBudgetAction,
  type SiteActionState,
} from "../actions";
import { SITE_STATUS_LABEL, type SiteStatus } from "../domain";

interface Values {
  siteNumber?: string;
  name?: string;
  client?: string;
  location?: string;
  status?: SiteStatus;
  startDate?: string;
  endDate?: string;
  notes?: string | null;
}

function Feedback({ state }: { state: SiteActionState }) {
  if (state.error) return <Status variant="alarm">{state.error}</Status>;
  if (state.ok) return <Status variant="done">{state.ok}</Status>;
  return null;
}

function Fields({ values, numberEditable }: { values: Values; numberEditable: boolean }) {
  const statuses = Object.keys(SITE_STATUS_LABEL) as SiteStatus[];
  return (
    <>
      {numberEditable && (
        <TextField
          id="siteNumber"
          name="siteNumber"
          label="Numer budowy"
          placeholder="np. 075"
          defaultValue={values.siteNumber}
          autoCapitalize="none"
          required
        />
      )}
      <TextField id="name" name="name" label="Nazwa" defaultValue={values.name} required />
      <TextField id="client" name="client" label="Klient" defaultValue={values.client} required />
      <TextField
        id="location"
        name="location"
        label="Lokalizacja"
        defaultValue={values.location}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <TextField
          id="startDate"
          name="startDate"
          label="Start"
          type="date"
          defaultValue={values.startDate}
        />
        <TextField
          id="endDate"
          name="endDate"
          label="Termin końca"
          type="date"
          defaultValue={values.endDate}
        />
      </div>
      <fieldset>
        <legend className="contents">
          <SectionLabel>Stan</SectionLabel>
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {statuses.map((status) => (
            <OptionCard
              key={status}
              name="status"
              value={status}
              defaultChecked={(values.status ?? "PLANNED") === status}
              className="text-sm"
            >
              {SITE_STATUS_LABEL[status]}
            </OptionCard>
          ))}
        </div>
      </fieldset>
      <div>
        <label
          htmlFor="notes"
          className="mb-2 block font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase"
        >
          Notatki · opcjonalnie
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={values.notes ?? ""}
          className="w-full border-[1.5px] border-line bg-surface px-3 py-2.5 text-base text-ink focus:border-primary"
        />
      </div>
    </>
  );
}

export function CreateSiteForm() {
  const [state, action, pending] = useActionState(createSiteAction, {});
  return (
    <form action={action} className="flex flex-col gap-5 px-3 py-4">
      <Fields values={{}} numberEditable />
      <Feedback state={state} />
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Zakładanie…" : "Załóż budowę"}
      </Button>
    </form>
  );
}

export function EditSiteForm({ siteNumber, values }: { siteNumber: string; values: Values }) {
  const [state, action, pending] = useActionState(updateSiteAction.bind(null, siteNumber), {});
  return (
    <form action={action} className="flex flex-col gap-5">
      <Fields values={values} numberEditable={false} />
      <Feedback state={state} />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Zapisywanie…" : "Zapisz dane budowy"}
      </Button>
    </form>
  );
}

/** Budżet robocizny — tylko dla ról z `costs.manage` (strona nie renderuje go innym). */
export function BudgetForm({ siteNumber, value }: { siteNumber: string; value: string }) {
  const [state, action, pending] = useActionState(
    updateSiteBudgetAction.bind(null, siteNumber),
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-3">
      <SectionLabel>Budżet robocizny</SectionLabel>
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <TextField
          id="laborBudgetHours"
          name="laborBudgetHours"
          label="Planowane rbh"
          inputMode="decimal"
          defaultValue={value}
          placeholder="np. 3510"
          className="font-mono"
        />
        <Button type="submit" disabled={pending}>
          Zapisz
        </Button>
      </div>
      <Feedback state={state} />
    </form>
  );
}
