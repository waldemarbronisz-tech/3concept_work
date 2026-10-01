import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActor } from "@/core/auth/actor";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = { title: "Zmiana hasła · 3Concept Work" };

export default async function ChangePasswordPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  return <ChangePasswordForm name={actor.name} />;
}
