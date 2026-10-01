-- CreateEnum
CREATE TYPE "AuditCategory" AS ENUM ('SYSTEM', 'OPERATIONAL', 'FINANCIAL');

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" "AuditCategory" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "siteId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_log_siteId_at_idx" ON "audit_log"("siteId", "at");

-- CreateIndex
CREATE INDEX "audit_log_category_at_idx" ON "audit_log"("category", "at");

-- CreateIndex
CREATE INDEX "audit_log_at_idx" ON "audit_log"("at");
