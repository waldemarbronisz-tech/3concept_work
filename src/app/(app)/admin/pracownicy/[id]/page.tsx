import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Status } from "@/components/ui/Status";
import { requireActor } from "@/core/auth/actor";
import { can, canManageManagementAccount, canManageManagementRole } from "@/core/rbac";
import { AccountPanel, RolesPanel } from "@/modules/employees/components/AccountPanel";
import { EditEmployeeForm } from "@/modules/employees/components/EmployeeForm";
import { accountStatus } from "@/modules/employees/components/EmployeeList";
import { getEmployee } from "@/modules/employees/service";

export const metadata: Metadata = { title: "Pracownik · 3Concept Work" };

export default async function EmployeePage({ params }: PageProps<"/admin/pracownicy/[id]">) {
  const actor = await requireActor();
  if (!can(actor, "accounts.manage")) notFound();

  const { id } = await params;
  const employee = await getEmployee(actor, id);
  if (!employee) notFound();
  const status = accountStatus(employee);
  const isSelf = employee.user.id === actor.userId;
  const isManagement = employee.user.roleAssignments.some((r) => r.role === "MANAGEMENT");
  const lockedReason = isSelf
    ? "Własnego konta nie blokuje się ani nie resetuje samemu — poproś innego administratora."
    : isManagement && !canManageManagementAccount(actor)
      ? "Kontem zarządu zarządza tylko administrator z rolą zarządu."
      : undefined;

  return (
    <>
      <AppBar
        title={`${employee.firstName} ${employee.lastName}`}
        backHref="/admin/pracownicy"
        titleBlock={[
          { label: "Login", value: employee.user.username ?? "—", mono: true },
          { label: "Stanowisko", value: employee.position },
        ]}
      />
      <main className="flex flex-1 flex-col gap-6 px-3 py-4">
        <Status variant={status.variant}>{status.label}</Status>
        <EditEmployeeForm
          id={employee.id}
          values={{
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            phone: employee.phone,
            employmentStatus: employee.employmentStatus,
          }}
        />
        <RolesPanel
          id={employee.id}
          roles={employee.user.roleAssignments}
          isSelf={isSelf}
          canManageManagement={canManageManagementRole(actor)}
        />
        <AccountPanel
          id={employee.id}
          isActive={employee.user.isActive}
          lockedReason={lockedReason}
        />
      </main>
    </>
  );
}
