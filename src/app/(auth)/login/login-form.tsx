"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";
import { TextField } from "@/components/ui/TextField";
import { authClient } from "@/core/auth/client";

export function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(notice ?? null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.username({
      username: String(form.get("username") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });

    if (signInError) {
      setPending(false);
      setError(
        signInError.status === 403
          ? "Konto jest zablokowane. Skontaktuj się z administratorem."
          : "Nieprawidłowy login lub hasło.",
      );
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 p-4">
      <h1 className="text-[19px] font-semibold">Logowanie</h1>
      <TextField
        id="username"
        name="username"
        label="Login"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        required
      />
      <TextField
        id="password"
        name="password"
        label="Hasło"
        type="password"
        autoComplete="current-password"
        required
      />
      {error && (
        <Status variant="alarm" className="self-start">
          {error}
        </Status>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Logowanie…" : "Zaloguj"}
      </Button>
      <p className="text-center text-[12.5px] text-ink-2">
        Nie pamiętasz hasła? Poproś administratora o hasło tymczasowe.
      </p>
    </form>
  );
}
