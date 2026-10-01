-- Integralność zakresu roli (docs/PLAN_MVP.md, RoleAssignment):
-- role globalne bez budowy, role budowy zawsze z budową, WORKER dowolnie (do iteracji 8).
ALTER TABLE "role_assignment"
  ADD CONSTRAINT "role_assignment_scope_check" CHECK (
    ("role" IN ('MANAGEMENT', 'ADMIN') AND "siteId" IS NULL)
    OR ("role" IN ('CONTRACT_MANAGER', 'SITE_ENGINEER', 'FOREMAN') AND "siteId" IS NOT NULL)
    OR "role" = 'WORKER'
  );
