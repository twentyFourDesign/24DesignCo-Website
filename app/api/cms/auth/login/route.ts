import { api, badRequest, HttpError, readJson, requireFields } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { allow, clientIp } from "@/lib/cms/rate";
import { checkPassword, issueSession } from "@/lib/cms/auth";

export const POST = api(async (req: Request) => {
  if (!(await allow(`login:${clientIp(req)}`, 20, 15 * 60))) throw new HttpError(429, "Too many attempts. Try again in a few minutes.");
  const b = await readJson(req);
  requireFields(b, ["email", "password"]);
  const email = String(b.email).toLowerCase().trim();
  const [u] = await sql`select id, name, email, role, status, password_hash from cms_users where lower(email) = ${email}`;
  if (!u || u.status !== "active" || !(await checkPassword(String(b.password), u.passwordHash))) throw new HttpError(401, "Email or password is incorrect");
  await sql`update cms_users set last_login_at = now() where id = ${u.id}`;
  await issueSession(u.id);
  return { user: { id: u.id, name: u.name, email: u.email, role: u.role } };
});
