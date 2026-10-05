import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Status } from "@/components/ui/Status";
import { Tag } from "@/components/ui/Tag";
import { fullName } from "../domain";
import type { EmployeeRow } from "../repository";

export const ROLE_SHORT: Record<string, string> = {
  MANAGEMENT: "Zarząd",
  ADMIN: "Admin",
  CONTRACT_MANAGER: "Kierownik",
  SITE_ENGINEER: "Inżynier",
  FOREMAN: "Brygadzista",
  WORKER: "Pracownik",
};

export function accountStatus(e: EmployeeRow) {
  if (!e.user.isActive) return { variant: "alarm" as const, label: "Zablokowane" };
  if (e.user.mustChangePassword) return { variant: "warn" as const, label: "Hasło tymczasowe" };
  if (e.employmentStatus === "INACTIVE")
    return { variant: "neutral" as const, label: "Nie pracuje" };
  return { variant: "done" as const, label: "Aktywne" };
}

const COLUMNS: DataTableColumn<EmployeeRow>[] = [
  {
    key: "name",
    header: "Pracownik",
    render: (e) => (
      <Link href={`/admin/pracownicy/${e.id}`} className="font-medium underline">
        {fullName(e)}
        <span className="mt-0.5 block font-mono text-[12.5px] font-normal text-ink-2 no-underline">
          {e.user.username}
        </span>
      </Link>
    ),
  },
  { key: "position", header: "Stanowisko", render: (e) => e.position },
  {
    key: "status",
    header: "Konto",
    render: (e) => {
      const s = accountStatus(e);
      return <Status variant={s.variant}>{s.label}</Status>;
    },
  },
  {
    key: "roles",
    header: "Role",
    render: (e) => (
      <span className="flex flex-wrap gap-1">
        {e.user.roleAssignments.length === 0 && <span className="text-ink-2">—</span>}
        {e.user.roleAssignments.map((r) => (
          <Tag
            key={r.id}
          >{`${ROLE_SHORT[r.role] ?? r.role}${r.siteId ? ` @${r.siteId}` : ""}`}</Tag>
        ))}
      </span>
    ),
  },
];

export function EmployeeList({ rows }: { rows: EmployeeRow[] }) {
  if (rows.length === 0) {
    return <p className="px-4 py-6 text-sm text-ink-2">Brak pracowników w tym widoku.</p>;
  }
  return (
    <DataTable
      caption="Pracownicy i konta"
      columns={COLUMNS}
      rows={rows}
      rowKey={(e) => e.id}
      rowTone={(e) => (e.user.isActive ? undefined : "alarm")}
    />
  );
}
