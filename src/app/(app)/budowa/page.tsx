import { redirect } from "next/navigation";
import { requireActor } from "@/core/auth/actor";
import { listSites } from "@/modules/sites/service";

/** „Budowa” w nawigacji inżyniera: jedna budowa → prosto do niej, inaczej lista. */
export default async function MySitePage() {
  const actor = await requireActor();
  const sites = await listSites(actor);
  if (sites.length === 1) redirect(`/budowy/${encodeURIComponent(sites[0]!.siteNumber)}`);
  redirect("/budowy");
}
