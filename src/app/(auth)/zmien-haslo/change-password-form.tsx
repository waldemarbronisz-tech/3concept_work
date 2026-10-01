"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";
import { TextField } from "@/components/ui/TextField";
import { changeTemporaryPassword } from "@/core/auth/actions";

export function ChangePasswordForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(changeTemporaryPassword, {});

  return (
    <form action={action} className="flex flex-col gap-5 p-4">
      <div>
        <h1 className="text-[19px] font-semibold">Ustaw własne hasło</h1>
        <p className="mt-1 text-sm text-ink-2">
          {name}, logujesz się hasłem tymczasowym. Zmień je, żeby przejść dalej.
        </p>
      </div>
      <TextField
        id="currentPassword"
        name="currentPassword"
        label="Hasło tymczasowe"
        type="password"
        autoComplete="current-password"
        required
      />
      <TextField
        id="newPassword"
        name="newPassword"
        label="Nowe hasło · min. 8 znaków"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <TextField
        id="confirm"
        name="confirm"
        label="Powtórz nowe hasło"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {state.error && (
        <Status variant="alarm" className="self-start">
          {state.error}
        </Status>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Zapisywanie…" : "Zapisz hasło"}
      </Button>
    </form>
  );
}
