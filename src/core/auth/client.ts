import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Klient Better Auth dla komponentów klienckich (logowanie). */
export const authClient = createAuthClient({ plugins: [usernameClient()] });
