import type { AuditCategory } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import type { AuthorizationActor } from "@/core/rbac";

export type { AuditCategory };

/**
 * Akcje audytu i ich kategorie (przypis ² macierzy w docs/PLAN_MVP.md).
 * Kategoria wynika z akcji, nie jest podawana przy zapisie — żeby nie dało się
 * „ukryć” zdarzenia finansowego pod SYSTEM.
 */
export const AUDIT_ACTIONS = {
  "account.create": "SYSTEM",
  "account.resetPassword": "SYSTEM",
  "account.deactivate": "SYSTEM",
  "account.activate": "SYSTEM",
  "role.grant": "SYSTEM",
  "role.revoke": "SYSTEM",
} as const satisfies Record<string, AuditCategory>;

export type AuditAction = keyof typeof AUDIT_ACTIONS;

export interface AuditEntry {
  action: AuditAction;
  entityType: string;
  entityId: string;
  siteId?: string | null;
  /** Stan przed i po — tylko pola istotne, nigdy hasła ani sekrety. */
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  reason?: string | null;
}

/** Klient transakcji albo zwykły — zapis audytu ma iść w tej samej transakcji co zmiana. */
export type AuditClient = Pick<Prisma.TransactionClient, "auditLog">;

/**
 * Jawny zapis śladu w serwisie (PLAN_MVP §1): `audit.record(tx, actor, {...})`.
 * Zwraca kategorię, żeby serwis mógł ją np. zalogować.
 */
export async function record(tx: AuditClient, actor: AuthorizationActor, entry: AuditEntry) {
  const category = AUDIT_ACTIONS[entry.action];
  await tx.auditLog.create({
    data: {
      actorUserId: actor.userId,
      action: entry.action,
      category,
      entityType: entry.entityType,
      entityId: entry.entityId,
      siteId: entry.siteId ?? null,
      before: entry.before,
      after: entry.after,
      reason: entry.reason ?? null,
    },
  });
  return category;
}

export const audit = { record };
