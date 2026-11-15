import { api, badRequest, HttpError, readJson, requireFields } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { allow, clientIp } from "@/lib/cms/rate";
import { hashPassword, hashToken, issueSession, passwordOk } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";

export const POST = api(async (req: Request) => {
  if (!(await allow(`invite:${clientIp(req)}`, 30, 15 * 60))) throw new HttpError(429, "Too many attempts. Try again in a few minutes.");
  const b = await readJson(req);
  requireFields(b, ["token", "name", "password"]);
  if (!passwordOk(b.password)) throw badRequest("Use at least 10 characters for your password");
  const [u] = await sql`select id, email, invite_expires_at from cms_users where invite_token_hash = ${hashToken(String(b.token))} and status = 'invited'`;
  if (!u || new Date(u.inviteExpiresAt) < new Date()) throw new HttpError(404, "This invite link is invalid or has expired");
  const name = String(b.name).trim();
  await sql`update cms_users set name = ${name}, password_hash = ${await hashPassword(b.password)}, status = 'active', invite_token_hash = null, invite_expires_at = null, last_login_at = now(), updated_at = now() where id = ${u.id}`;
  await logActivity({ id: u.id, name, email: u.email }, "user", "joined the admin", name, "/admin/settings?tab=users");
  await issueSession(u.id);
  return { ok: true };
});
