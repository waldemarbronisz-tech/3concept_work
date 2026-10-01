import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActor } from "@/core/auth/actor";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Logowanie · 3Concept Work" };

export default async function LoginPage() {
  const actor = await getActor();
  if (actor) redirect(actor.mustChangePassword ? "/zmien-haslo" : "/");
  return <LoginForm />;
}
