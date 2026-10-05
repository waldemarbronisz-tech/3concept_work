import { AppShell } from "@/components/app/AppShell";
import { requireActor } from "@/core/auth/actor";
import { navigationFor } from "../navigation";

/** Wszystkie ekrany po zalogowaniu: sesja wymagana, nawigacja z ról aktora. */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const actor = await requireActor();
  const nav = navigationFor(actor.roles);
  return <AppShell nav={nav.bottomNav}>{children}</AppShell>;
}
