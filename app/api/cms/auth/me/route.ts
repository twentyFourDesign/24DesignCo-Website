import { api, badRequest, readJson } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { checkPassword, endSessions, hashPassword, issueSession, passwordOk, requireApi } from "@/lib/cms/auth";

export const GET = api(async () => ({ user: await requireApi() }));

export const PATCH = api(async (req: Request) => {
  const me = await requireApi();
  const b = await readJson(req);
  if (b.name !== undefined) await sql`update cms_users set name = ${String(b.name).trim()}, updated_at = now() where id = ${me.id}`;
  if (b.newPassword) {
    const [u] = await sql`select password_hash from cms_users where id = ${me.id}`;
    if (!(await checkPassword(String(b.currentPassword ?? ""), u.passwordHash))) throw badRequest("Your current password is incorrect");
    if (!passwordOk(b.newPassword)) throw badRequest("Use at least 10 characters for your password");
    await sql`update cms_users set password_hash = ${await hashPassword(b.newPassword)}, updated_at = now() where id = ${me.id}`;
    // Sign out every other device that was using the old password, and keep this one signed in.
    await endSessions(me.id);
    await issueSession(me.id);
  }
  const [user] = await sql`select id, name, email, role, status from cms_users where id = ${me.id}`;
  return { user };
});
