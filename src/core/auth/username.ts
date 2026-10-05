/** Login: 3–30 znaków, małe litery, cyfry, kropka, myślnik, podkreślenie. Czysty TS — używany też w schematach Zod. */
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,29}$/;
