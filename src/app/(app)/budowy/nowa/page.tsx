import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { requireActor } from "@/core/auth/actor";
import { can } from "@/core/rbac";
import { CreateSiteForm } from "@/modules/sites/components/SiteForm";

export const metadata: Metadata = { title: "Nowa budowa · 3Concept Work" };

export default async function NewSitePage() {
  const actor = await requireActor();
  if (!can(actor, "sites.create")) notFound();
  return (
    <>
      <AppBar title="Nowa budowa" backHref="/budowy" />
      <main className="flex flex-1 flex-col">
        <CreateSiteForm />
      </main>
    </>
  );
}
