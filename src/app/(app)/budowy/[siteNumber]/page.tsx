import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionLabel } from "@/components/app/AppShell";
import { AppBar } from "@/components/ui/AppBar";
import { Status } from "@/components/ui/Status";
import { TitleBlock } from "@/components/ui/TitleBlock";
import { requireActor } from "@/core/auth/actor";
import { can, ForbiddenError } from "@/core/rbac";
import { BudgetForm, EditSiteForm } from "@/modules/sites/components/SiteForm";
import { siteStatus } from "@/modules/sites/components/SiteList";
import { TeamPanel } from "@/modules/sites/components/TeamPanel";
import { getSite, getTeam, listTeamCandidates, withCostsVisibility } from "@/modules/sites/service";

export const metadata: Metadata = { title: "Budowa · 3Concept Work" };

const toDateOnly = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function SitePage({ params }: PageProps<"/budowy/[siteNumber]">) {
  const actor = await requireActor();
  const { siteNumber: raw } = await params;
  const siteNumber = decodeURIComponent(raw);

  let site;
  try {
    site = await getSite(actor, siteNumber);
  } catch (error) {
    if (error instanceof ForbiddenError) notFound();
    throw error;
  }
  if (!site) notFound();

  const view = withCostsVisibility(actor, site);
  const canManage = can(actor, "sites.manage", { siteId: siteNumber });
  const canTeam = can(actor, "team.manage", { siteId: siteNumber });
  const [team, candidates] = await Promise.all([
    getTeam(actor, siteNumber).catch(() => []),
    canTeam ? listTeamCandidates(actor, siteNumber) : Promise.resolve([]),
  ]);
  const status = siteStatus(site.status);

  return (
    <>
      <AppBar
        title={site.name}
        backHref="/budowy"
        titleBlock={[
          { label: "Budowa", value: site.siteNumber, mono: true },
          { label: "Klient", value: site.client },
          { label: "Stan", value: status.label },
        ]}
      />
      <main className="flex flex-1 flex-col gap-6 px-3 py-4">
        <Status variant={status.variant}>{status.label}</Status>

        {canManage ? (
          <EditSiteForm
            siteNumber={site.siteNumber}
            values={{
              name: site.name,
              client: site.client,
              location: site.location,
              status: site.status,
              startDate: toDateOnly(site.startDate),
              endDate: toDateOnly(site.endDate),
              notes: site.notes,
            }}
          />
        ) : (
          <TitleBlock
            cells={[
              { label: "Lokalizacja", value: site.location },
              { label: "Start", value: toDateOnly(site.startDate) || "—", mono: true },
              { label: "Koniec", value: toDateOnly(site.endDate) || "—", mono: true },
            ]}
            className="grid-cols-[minmax(0,1fr)_auto_auto]"
          />
        )}

        {view.costsVisible &&
          (can(actor, "costs.manage", { siteId: siteNumber }) ? (
            <BudgetForm
              siteNumber={site.siteNumber}
              value={view.laborBudgetHours?.toString() ?? ""}
            />
          ) : (
            <section>
              <SectionLabel>Budżet robocizny</SectionLabel>
              <p className="font-mono text-sm">
                {view.laborBudgetHours
                  ? `${view.laborBudgetHours.toString()} rbh`
                  : "— (brak budżetu)"}
              </p>
            </section>
          ))}

        <TeamPanel
          siteNumber={site.siteNumber}
          members={team.map((m) => ({
            id: m.id,
            employeeId: m.employee.id,
            name: `${m.employee.firstName} ${m.employee.lastName}`,
            position: m.employee.position,
            username: m.employee.user.username,
            isActive: m.employee.user.isActive,
          }))}
          candidates={candidates.map((c) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            position: c.position,
          }))}
          canManage={canTeam}
          linkEmployees={can(actor, "accounts.manage")}
        />
      </main>
    </>
  );
}
