import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { requireActor } from "@/core/auth/actor";
import { can } from "@/core/rbac";
import { EmployeeList } from "@/modules/employees/components/EmployeeList";
import { listEmployees, type EmployeeListFilter } from "@/modules/employees/service";

export const metadata: Metadata = { title: "Pracownicy · 3Concept Work" };

const FILTERS: Array<{ key: EmployeeListFilter; param: string; label: string }> = [
  { key: "active", param: "aktywni", label: "Aktywni" },
  { key: "blocked", param: "zablokowani", label: "Zablokowani" },
  { key: "all", param: "wszyscy", label: "Wszyscy" },
];

export default async function EmployeesPage({ searchParams }: PageProps<"/admin/pracownicy">) {
  const actor = await requireActor();
  if (!can(actor, "accounts.manage")) notFound();

  const { stan } = await searchParams;
  const filter = FILTERS.find((f) => f.param === stan) ?? FILTERS[0]!;
  const rows = await listEmployees(actor, filter.key);

  return (
    <>
      <AppBar
        title="Pracownicy"
        backHref="/admin"
        titleBlock={[
          { label: "Arkusz", value: "Pracownicy i konta" },
          { label: "Widok", value: filter.label },
          { label: "Osób", value: String(rows.length), mono: true },
        ]}
      />
      <main className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 px-3 py-3">
          <div role="group" aria-label="Filtr" className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <Link key={f.key} href={`/admin/pracownicy?stan=${f.param}`}>
                <Button pressed={f.key === filter.key} className="px-3 text-[13.5px]">
                  {f.label}
                </Button>
              </Link>
            ))}
          </div>
          <span className="flex-1" />
          <Link href="/admin/pracownicy/nowy">
            <Button variant="primary">+ Nowy</Button>
          </Link>
        </div>
        <EmployeeList rows={rows} />
      </main>
    </>
  );
}
