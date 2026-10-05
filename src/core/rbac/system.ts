import type { AuthorizationActor } from "./authorize";

/**
 * Aktor systemowy do operacji bez sesji (seed, `npm run account:bootstrap`).
 * Ma ADMIN i MANAGEMENT globalnie — może więc nadać MANAGEMENT pierwszemu
 * użytkownikowi (bootstrap). Nigdy nie jest dostępny z poziomu żądania HTTP.
 */
export const SYSTEM_ACTOR: AuthorizationActor = {
  userId: "system",
  grants: [
    { role: "ADMIN", siteId: null },
    { role: "MANAGEMENT", siteId: null },
  ],
};
