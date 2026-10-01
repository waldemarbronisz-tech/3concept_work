import { db } from "@/core/db";
import { authorize, can, ForbiddenError, type AuthorizationActor } from "@/core/rbac";
import type { AuditCategory } from "@/generated/prisma/enums";

/** Globalny widok (przypis ²): zarząd — wszystko, admin — tylko SYSTEM, reszta — brak. */
export async function listAuditLog(actor: AuthorizationActor, options: { limit?: number } = {}) {
  const limit = Math.min(options.limit ?? 100, 500);
  let categories: AuditCategory[] | undefined;
  if (can(actor, "audit.readAll")) categories = undefined;
  else if (can(actor, "audit.readSystem")) categories = ["SYSTEM"];
  else throw new ForbiddenError("audit.readAll");

  return db.auditLog.findMany({
    where: categories ? { category: { in: categories } } : undefined,
    orderBy: { at: "desc" },
    take: limit,
  });
}

/**
 * Historia jednego rekordu w zakresie budowy (zakładka „Historia”): kierownik i inżynier
 * na swoich budowach; inżynier bez zdarzeń FINANCIAL (nie widzi kosztów).
 */
export async function recordHistory(
  actor: AuthorizationActor,
  record: { entityType: string; entityId: string; siteId: string },
) {
  if (!can(actor, "audit.readAll")) authorize(actor, "audit.readRecord", { siteId: record.siteId });
  const hideFinancial =
    !can(actor, "audit.readAll") && !can(actor, "costs.read", { siteId: record.siteId });

  return db.auditLog.findMany({
    where: {
      entityType: record.entityType,
      entityId: record.entityId,
      siteId: record.siteId,
      ...(hideFinancial ? { category: { not: "FINANCIAL" } } : {}),
    },
    orderBy: { at: "asc" },
  });
}
