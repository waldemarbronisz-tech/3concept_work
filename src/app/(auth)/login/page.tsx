import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActor } from "@/core/auth/actor";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Logowanie · 3Concept Work" };

const NOTICES: Record<string, string> = {
  zablokowane: "Konto jest zablokowane. Skontaktuj się z administratorem.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const actor = await getActor();
  if (actor) redirect(actor.user.mustChangePassword ? "/zmien-haslo" : "/");
  const { powod } = await searchParams;
  const notice = typeof powod === "string" ? NOTICES[powod] : undefined;
  return <LoginForm notice={notice} />;
}
