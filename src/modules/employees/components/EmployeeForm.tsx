"use client";

import { useActionState } from "react";
import { SectionLabel } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { OptionCard } from "@/components/ui/OptionCard";
import { Status } from "@/components/ui/Status";
import { Tag } from "@/components/ui/Tag";
import { TextField } from "@/components/ui/TextField";
import {
  createEmployeeAction,
  goToEmployees,
  updateEmployeeAction,
  type EmployeeActionState,
} from "../actions";

const INITIAL_ROLES = ["WORKER", "MANAGEMENT", "ADMIN"] as const;
const ROLE_OPTIONS: Record<(typeof INITIAL_ROLES)[number], { label: string; hint: string }> = {
  WORKER: { label: "Pracownik", hint: "własne godziny i pakiety" },
  MANAGEMENT: { label: "Zarząd", hint: "odczyt wszystkiego, akceptacje firmowe" },
  ADMIN: { label: "Administrator", hint: "konta, role, słowniki — bez kosztów" },
};

interface Values {
  firstName?: string;
  lastName?: string;
  position?: string;
  phone?: string | null;
  employmentStatus?: "ACTIVE" | "INACTIVE";
}

function Fields({ values }: { values: Values }) {
  return (
    <>
      <TextField
        id="firstName"
        name="firstName"
        label="Imię"
        defaultValue={values.firstName}
        autoComplete="off"
        required
      />
      <TextField
        id="lastName"
        name="lastName"
        label="Nazwisko"
        defaultValue={values.lastName}
        autoComplete="off"
        required
      />
      <TextField
        id="position"
        name="position"
        label="Stanowisko"
        defaultValue={values.position}
        placeholder="np. elektromonter"
        required
      />
      <TextField
        id="phone"
        name="phone"
        label="Telefon · opcjonalnie"
        type="tel"
        defaultValue={values.phone ?? ""}
        inputMode="tel"
      />
      <fieldset>
        <legend className="contents">
          <SectionLabel>Status zatrudnienia</SectionLabel>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <OptionCard
            name="employmentStatus"
            value="ACTIVE"
            defaultChecked={(values.employmentStatus ?? "ACTIVE") === "ACTIVE"}
          >
            Zatrudniony
          </OptionCard>
          <OptionCard
            name="employmentStatus"
            value="INACTIVE"
            defaultChecked={values.employmentStatus === "INACTIVE"}
          >
            Nie pracuje
          </OptionCard>
        </div>
      </fieldset>
    </>
  );
}

function Feedback({ state }: { state: EmployeeActionState }) {
  if (state.error) return <Status variant="alarm">{state.error}</Status>;
  if (state.ok) return <Status variant="done">{state.ok}</Status>;
  return null;
}

/** Nowy pracownik z kontem; po zapisie hasło tymczasowe pokazane jeden raz. */
export function CreateEmployeeForm() {
  const [state, action, pending] = useActionState(createEmployeeAction, {});

  if (state.temporaryPassword) {
    return (
      <div className="flex flex-col gap-4 px-3 py-4">
        <Status variant="done">{state.ok ?? "Konto założone."}</Status>
        <div className="border-[1.5px] border-ink bg-surface p-4">
          <SectionLabel>Dane do przekazania pracownikowi</SectionLabel>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-ink-2">Login</dt>
            <dd>
              <Tag>{state.username ?? ""}</Tag>
            </dd>
            <dt className="text-ink-2">Hasło tymczasowe</dt>
            <dd>
              <Tag>{state.temporaryPassword}</Tag>
            </dd>
          </dl>
          <p className="mt-3 text-[12.5px] text-ink-2">
            Hasło widać tylko teraz. Przy pierwszym logowaniu pracownik ustawi własne.
          </p>
        </div>
        <form action={goToEmployees}>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Gotowe, do listy
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5 px-3 py-4">
      <Fields values={{}} />
      <TextField
        id="username"
        name="username"
        label="Login · opcjonalnie"
        placeholder="puste = z nazwiska, np. jkowalski"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      <fieldset>
        <legend className="contents">
          <SectionLabel>Role od razu · role budowy nadasz w szczegółach</SectionLabel>
        </legend>
        <div className="flex flex-col gap-2">
          {INITIAL_ROLES.map((role) => (
            <label
              key={role}
              className="flex min-h-14 cursor-pointer items-center gap-3 border-[1.5px] border-line px-3 py-2 has-[input:checked]:border-primary has-[input:checked]:bg-primary-soft"
            >
              <input
                type="checkbox"
                name="roles"
                value={role}
                defaultChecked={role === "WORKER"}
                className="size-5 accent-primary"
              />
              <span className="flex flex-col">
                <span>{ROLE_OPTIONS[role].label}</span>
                <span className="text-[13px] text-ink-2">{ROLE_OPTIONS[role].hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Feedback state={state} />
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Zakładanie…" : "Załóż pracownika i konto"}
      </Button>
    </form>
  );
}

export function EditEmployeeForm({ id, values }: { id: string; values: Values }) {
  const [state, action, pending] = useActionState(updateEmployeeAction.bind(null, id), {});
  return (
    <form action={action} className="flex flex-col gap-5">
      <Fields values={values} />
      <Feedback state={state} />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Zapisywanie…" : "Zapisz dane"}
      </Button>
    </form>
  );
}
