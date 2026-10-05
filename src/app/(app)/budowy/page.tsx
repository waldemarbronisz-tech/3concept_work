import type { Metadata } from "next";
import Link from "next/link";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { requireActor } from "@/core/auth/actor";
import { can } from "@/core/rbac";
import { SiteList } from "@/modules/sites/components/SiteList";
import { listSites } from "@/modules/sites/service";

export const metadata: Metadata = { title: "Budowy · 3Concept Work" };

/** Budowy w zakresie aktora: zarząd/admin wszystkie, reszta swoje (rola na budowie lub zespół). */
export default async function SitesPage() {
  const actor = await requireActor();
  const rows = await listSites(actor);

  return (
    <>
      <AppBar
        title="Budowy"
        backHref="/"
        titleBlock={[
          { label: "Arkusz", value: "Budowy i kontrakty" },
          { label: "Budów", value: String(rows.length), mono: true },
        ]}
      />
      <main className="flex flex-1 flex-col">
        {can(actor, "sites.create") && (
          <div className="flex justify-end px-3 py-3">
            <Link href="/budowy/nowa">
              <Button variant="primary">+ Nowa budowa</Button>
            </Link>
          </div>
        )}
        <SiteList rows={rows} />
      </main>
    </>
  );
}
