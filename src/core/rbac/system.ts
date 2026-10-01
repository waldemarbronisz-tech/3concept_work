import type { AuthorizationActor } from "./authorize";

/**
 * Aktor systemowy do operacji bez sesji (seed, zadania w tle). Ma rolę ADMIN
 * globalnie i nic więcej — tak jak admin, nie dotyka danych operacyjnych.
 */
export const SYSTEM_ACTOR: AuthorizationActor = {
  userId: "system",
  grants: [{ role: "ADMIN", siteId: null }],
};
