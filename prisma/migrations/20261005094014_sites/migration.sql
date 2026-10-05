-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('PLANNED', 'ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "site" (
    "id" TEXT NOT NULL,
    "siteNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "SiteStatus" NOT NULL DEFAULT 'PLANNED',
    "startDate" DATE,
    "endDate" DATE,
    "laborBudgetHours" DECIMAL(10,2),
    "notes" TEXT,
    "deletedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_assignment" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "validFrom" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_siteNumber_key" ON "site"("siteNumber");

-- CreateIndex
CREATE INDEX "site_assignment_siteId_validTo_idx" ON "site_assignment"("siteId", "validTo");

-- CreateIndex
CREATE INDEX "site_assignment_employeeId_validTo_idx" ON "site_assignment"("employeeId", "validTo");

-- AddForeignKey
-- Dane z iteracji 4–7 mają role z numerem budowy bez rekordu budowy (beta): dopisujemy brakujące
-- budowy jako PLANNED z nazwą do uzupełnienia, żeby klucz obcy przeszedł.
INSERT INTO "site" ("id", "siteNumber", "name", "client", "location", "status", "createdAt", "updatedAt")
SELECT 'site_' || md5(r."siteId"), r."siteId", 'Budowa ' || r."siteId" || ' (uzupełnij)', '—', '—', 'PLANNED', now(), now()
FROM (SELECT DISTINCT "siteId" FROM "role_assignment" WHERE "siteId" IS NOT NULL) r
WHERE NOT EXISTS (SELECT 1 FROM "site" s WHERE s."siteNumber" = r."siteId");

ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "site"("siteNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_assignment" ADD CONSTRAINT "site_assignment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_assignment" ADD CONSTRAINT "site_assignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
