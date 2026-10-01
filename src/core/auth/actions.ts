"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/core/db";
import { auth } from "./auth";

export interface ActionState {
  error?: string;
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

/** Zmiana hasła tymczasowego na własne; po niej konto jest w pełni aktywne. */
export async function changeTemporaryPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (newPassword.length < 8) return { error: "Nowe hasło musi mieć co najmniej 8 znaków." };
  if (newPassword !== confirm) return { error: "Hasła nie są takie same." };
  if (newPassword === currentPassword)
    return { error: "Nowe hasło musi różnić się od tymczasowego." };

  try {
    await auth.api.changePassword({
      headers: requestHeaders,
      body: { currentPassword, newPassword, revokeOtherSessions: true },
    });
  } catch (error) {
    if (error instanceof APIError) return { error: "Hasło tymczasowe jest nieprawidłowe." };
    throw error;
  }

  await db.user.update({ where: { id: session.user.id }, data: { mustChangePassword: false } });
  redirect("/");
}
