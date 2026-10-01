import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Testy integracyjne na bazie testowej (pomijane bez DATABASE_URL_TEST).
const url = process.env.DATABASE_URL;
const mods = url
  ? {
      db: (await import("@/core/db")).db,
      auth: (await import("./auth")).auth,
      accounts: await import("./accounts"),
      SYSTEM_ACTOR: (await import("@/core/rbac")).SYSTEM_ACTOR,
    }
  : null;

const signIn = (username: string, password: string) =>
  mods!.auth.api.signInUsername({ body: { username, password }, asResponse: true });

describe.skipIf(!mods)("konta i logowanie", () => {
  const prefix = `t${Date.now().toString(36)}`;
  const username = `${prefix}.anowak`;

  beforeAll(async () => {
    await mods!.db.user.deleteMany({ where: { username: { startsWith: "t" } } });
  });
  afterAll(() => mods!.db.$disconnect());

  it("generuje czytelne hasło tymczasowe", () => {
    expect(mods!.accounts.generateTemporaryPassword()).toMatch(
      /^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/,
    );
  });

  it("odrzuca nieprawidłowy login", async () => {
    await expect(
      mods!.accounts.createAccount(mods!.SYSTEM_ACTOR, { username: "Ąę Ż", name: "X" }),
    ).rejects.toThrow(/login/i);
  });

  it("zakłada konto z hasłem tymczasowym i syntetycznym e-mailem", async () => {
    const created = await mods!.accounts.createAccount(mods!.SYSTEM_ACTOR, {
      username,
      name: "Anna Nowak",
      temporaryPassword: "tymczasowe1",
    });
    const user = await mods!.db.user.findUniqueOrThrow({ where: { id: created.userId } });
    expect(user.email).toBe(`${username}@konto.3concept.local`);
    expect(user.mustChangePassword).toBe(true);
    expect(user.isActive).toBe(true);
  });

  it("loguje loginem i hasłem, odrzuca złe hasło", async () => {
    expect((await signIn(username, "tymczasowe1")).status).toBe(200);
    expect((await signIn(username, "zle-haslo")).status).toBe(401);
  });

  it("publiczna rejestracja jest wyłączona", async () => {
    const res = await mods!.auth.api.signUpEmail({
      body: { email: "ktos@konto.3concept.local", password: "haslo1234", name: "Ktoś" },
      asResponse: true,
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("reset hasła: nowe hasło tymczasowe, wymuszona zmiana, sesje skasowane", async () => {
    const user = await mods!.db.user.findUniqueOrThrow({ where: { username } });
    await mods!.db.user.update({ where: { id: user.id }, data: { mustChangePassword: false } });
    expect(await mods!.db.session.count({ where: { userId: user.id } })).toBeGreaterThan(0);

    const { temporaryPassword } = await mods!.accounts.resetPassword(mods!.SYSTEM_ACTOR, user.id);

    expect(await mods!.db.session.count({ where: { userId: user.id } })).toBe(0);
    const after = await mods!.db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.mustChangePassword).toBe(true);
    expect((await signIn(username, "tymczasowe1")).status).toBe(401);
    expect((await signIn(username, temporaryPassword)).status).toBe(200);
  });

  it("blokada konta: sesje skasowane, getActor nie przepuszcza, admin nie zablokuje siebie", async () => {
    const { resolveActorById } = await import("./actor");
    const user = await mods!.db.user.findUniqueOrThrow({ where: { username } });
    const { temporaryPassword } = await mods!.accounts.resetPassword(mods!.SYSTEM_ACTOR, user.id);
    expect((await signIn(username, temporaryPassword)).status).toBe(200);
    expect(await mods!.db.session.count({ where: { userId: user.id } })).toBe(1);
    expect((await resolveActorById(user.id)).kind).toBe("ok");

    await mods!.accounts.deactivateAccount(mods!.SYSTEM_ACTOR, user.id);

    expect(await mods!.db.session.count({ where: { userId: user.id } })).toBe(0);
    expect((await resolveActorById(user.id)).kind).toBe("blocked");
    await expect(
      mods!.accounts.deactivateAccount(
        { userId: user.id, grants: mods!.SYSTEM_ACTOR.grants },
        user.id,
      ),
    ).rejects.toThrow(/własnego/);
    await mods!.accounts.activateAccount(mods!.SYSTEM_ACTOR, user.id);
    expect((await resolveActorById(user.id)).kind).toBe("ok");
  });

  it("zablokowane konto nie może się zalogować", async () => {
    const user = await mods!.db.user.findUniqueOrThrow({ where: { username } });
    const { temporaryPassword } = await mods!.accounts.resetPassword(mods!.SYSTEM_ACTOR, user.id);
    await mods!.db.user.update({ where: { id: user.id }, data: { isActive: false } });
    expect((await signIn(username, temporaryPassword)).status).toBe(403);
  });
});
