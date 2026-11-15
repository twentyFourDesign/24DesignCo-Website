import { api, HttpError } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { allow, clientIp } from "@/lib/cms/rate";
import { hashToken } from "@/lib/cms/auth";

// GET /api/cms/auth/invite?token=... tells the accept-invite page who the link is for.
export const GET = api(async (req: Request) => {
  if (!(await allow(`invite:${clientIp(req)}`, 30, 15 * 60))) throw new HttpError(429, "Too many attempts. Try again in a few minutes.");
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const [u] = await sql`select email, name, role, invite_expires_at from cms_users where invite_token_hash = ${hashToken(token)} and status = 'invited'`;
  if (!u || new Date(u.inviteExpiresAt) < new Date()) throw new HttpError(404, "This invite link is invalid or has expired");
  return { email: u.email, name: u.name, role: u.role };
});
