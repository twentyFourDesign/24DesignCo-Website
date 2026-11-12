import "server-only";
import { sql } from "./db";
import { hashToken, newToken, type SessionUser } from "./auth";
import { badRequest, forbidden } from "./http";
import { atLeast, type Role } from "./roles";

export const INVITE_DAYS = 7;

/** Owner manages everyone except themselves; an admin manages editors and authors only. Nobody manages their own account here. */
export function canManage(actor: Pick<SessionUser, "role">, targetRole: string) {
  if (actor.role === "owner") return true;
  return actor.role === "admin" && atLeast("editor", targetRole as Role) && targetRole !== "admin" && targetRole !== "owner";
}

export function assertCanAssign(actor: Pick<SessionUser, "role">, role: string) {
  if (!["owner", "admin", "editor", "author"].includes(role)) throw badRequest("Choose a role");
  if (actor.role === "owner") return;
  if (role === "admin" || role === "owner") throw forbidden("Only an owner can make someone an admin or owner");
}

export async function ownerCount() {
  const [r] = await sql`select count(*)::int as n from cms_users where role = 'owner' and status = 'active'`;
  return r.n as number;
}

/** Makes a fresh one-time invite for a user: only the SHA-256 is stored; the plain token is returned once. */
export async function createInvite(userId: string) {
  const token = newToken();
  await sql`update cms_users set invite_token_hash = ${hashToken(token)}, invite_expires_at = now() + make_interval(days => ${INVITE_DAYS}), updated_at = now() where id = ${userId}`;
  return token;
}

export function inviteUrl(req: Request, token: string) {
  const h = req.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || (host ? `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}` : new URL(req.url).origin);
  return `${base.replace(/\/$/, "")}/admin/accept-invite?token=${token}`;
}

export const USER_COLUMNS = sql`id, name, email, role, status, last_login_at, invite_expires_at, created_at`;
