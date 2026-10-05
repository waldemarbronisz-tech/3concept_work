import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Tag } from "@/components/ui/Tag";
import { listAuditLog } from "@/core/audit";
import { requireActor } from "@/core/auth/actor";
import { can } from "@/core/rbac";

export const metadata: Metadata = { title: "Audyt · 3Concept Work" };

type Entry = Awaited<ReturnType<typeof listAuditLog>>[number];

const formatAt = (at: Date) =>
  at.toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const COLUMNS: DataTableColumn<Entry>[] = [
  { key: "at", header: "Kiedy", numeric: true, render: (e) => formatAt(e.at) },
  { key: "action", header: "Akcja", render: (e) => <Tag>{e.action}</Tag> },
  { key: "category", header: "Kategoria", render: (e) => e.category },
  { key: "actor", header: "Kto", render: (e) => e.actorUserId },
  {
    key: "entity",
    header: "Obiekt",
    render: (e) => (
      <>
        {e.entityType} <span className="font-mono text-[12.5px] text-ink-2">{e.entityId}</span>
      </>
    ),
  },
  { key: "reason", header: "Powód", render: (e) => e.reason ?? "—" },
];

/** Podgląd audytu wg macierzy (przypis ²): zarząd — wszystko, admin — tylko SYSTEM. */
export default async function AuditPage() {
  const actor = await requireActor();
  if (!can(actor, "audit.readAll") && !can(actor, "audit.readSystem")) notFound();

  const entries = await listAuditLog(actor, { limit: 200 });
  const scope = can(actor, "audit.readAll") ? "wszystkie zdarzenia" : "tylko SYSTEM";

  return (
    <>
      <AppBar
        title="Audyt zmian"
        backHref="/"
        titleBlock={[
          { label: "Zakres", value: scope },
          { label: "Wpisów", value: String(entries.length), mono: true },
        ]}
      />
      <main className="flex flex-1 flex-col pt-3">
        <DataTable
          caption="Ślad zmian"
          columns={COLUMNS}
          rows={entries}
          rowKey={(e) => e.id}
          rowTone={(e) => (e.category === "FINANCIAL" ? "warn" : undefined)}
        />
      </main>
    </>
  );
}
