import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Status } from "@/components/ui/Status";
import { Tag } from "@/components/ui/Tag";
import { SITE_STATUS_LABEL, type SiteStatus } from "../domain";
import type { SiteRow } from "../repository";

export function siteStatus(status: SiteStatus) {
  const variant = status === "ACTIVE" ? "run" : status === "CLOSED" ? "done" : "neutral";
  return { variant, label: SITE_STATUS_LABEL[status] } as const;
}

const COLUMNS: DataTableColumn<SiteRow>[] = [
  {
    key: "site",
    header: "Budowa",
    render: (s) => (
      <Link href={`/budowy/${encodeURIComponent(s.siteNumber)}`} className="block">
        <Tag>{s.siteNumber}</Tag>
        <span className="mt-0.5 block font-medium underline">{s.name}</span>
      </Link>
    ),
  },
  { key: "client", header: "Klient", render: (s) => s.client },
  { key: "location", header: "Lokalizacja", render: (s) => s.location },
  {
    key: "status",
    header: "Stan",
    render: (s) => {
      const st = siteStatus(s.status);
      return <Status variant={st.variant}>{st.label}</Status>;
    },
  },
  {
    key: "manager",
    header: "Kierownik",
    render: (s) => s.roleAssignments.map((r) => r.user.name).join(", ") || "—",
  },
  { key: "team", header: "Zespół", numeric: true, render: (s) => String(s._count.team) },
];

export function SiteList({ rows }: { rows: SiteRow[] }) {
  if (rows.length === 0) {
    return <p className="px-4 py-6 text-sm text-ink-2">Brak budów w Twoim zakresie.</p>;
  }
  return <DataTable caption="Budowy" columns={COLUMNS} rows={rows} rowKey={(s) => s.id} />;
}
