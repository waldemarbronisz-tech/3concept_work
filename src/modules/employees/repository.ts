import { db } from "@/core/db";
import type { Prisma } from "@/generated/prisma/client";

export type EmployeeListFilter = "active" | "blocked" | "all";

const listSelect = {
  id: true,
  firstName: true,
  lastName: true,
  position: true,
  employmentStatus: true,
  phone: true,
  user: {
    select: {
      id: true,
      username: true,
      isActive: true,
      mustChangePassword: true,
      roleAssignments: {
        where: { validTo: null },
        select: { id: true, role: true, siteId: true },
        orderBy: { validFrom: "asc" as const },
      },
    },
  },
} satisfies Prisma.EmployeeSelect;

export type EmployeeRow = Prisma.EmployeeGetPayload<{ select: typeof listSelect }>;

/** Pracownicy wg stanu konta: aktywni (konto działa), zablokowani, wszyscy. Bez usuniętych. */
export function findEmployees(filter: EmployeeListFilter) {
  return db.employee.findMany({
    where: {
      deletedAt: null,
      ...(filter === "active" ? { user: { isActive: true } } : {}),
      ...(filter === "blocked" ? { user: { isActive: false } } : {}),
    },
    select: listSelect,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

export function findEmployee(id: string) {
  return db.employee.findFirst({ where: { id, deletedAt: null }, select: listSelect });
}

export async function takenUsernames(prefix: string): Promise<Set<string>> {
  const rows = await db.user.findMany({
    where: { username: { startsWith: prefix } },
    select: { username: true },
  });
  return new Set(rows.flatMap((r) => (r.username ? [r.username] : [])));
}
