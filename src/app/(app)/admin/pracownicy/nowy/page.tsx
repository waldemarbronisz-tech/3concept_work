import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { requireActor } from "@/core/auth/actor";
import { can } from "@/core/rbac";
import { CreateEmployeeForm } from "@/modules/employees/components/EmployeeForm";

export const metadata: Metadata = { title: "Nowy pracownik · 3Concept Work" };

export default async function NewEmployeePage() {
  const actor = await requireActor();
  if (!can(actor, "accounts.manage")) notFound();

  return (
    <>
      <AppBar title="Nowy pracownik" backHref="/admin/pracownicy" />
      <main className="flex flex-1 flex-col">
        <CreateEmployeeForm />
      </main>
    </>
  );
}
