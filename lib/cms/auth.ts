import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { sql } from "./db";
import { atLeast, type Role } from "./roles";
import { HttpError } from "./http";

export const COOKIE = "cms_session";
const SESSION_DAYS = 7;

export type SessionUser = { id: string; name: string; email: string; role: Role; status: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  return new TextEncoder().encode(s);
}

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const checkPassword = (p: string, hash: string | null | undefined) => (hash ? bcrypt.compare(p, hash) : Promise.resolve(false));
export const passwordOk = (p: unknown): p is string => typeof p === "string" && p.length >= 10;
export const hashToken = (t: string) => crypto.createHash("sha256").update(String(t)).digest("hex");
export const newToken = () => crypto.randomBytes(32).toString("hex");

export async function issueSession(userId: string) {
  const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime(`${SESSION_DAYS}d`).sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: SESSION_DAYS * 86400, path: "/" });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in user, or null. Looked up in the database each request so disabling or demoting someone takes effect at once. */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  await connection(); // signed-in state is per request; also lets jwtVerify use the clock under cacheComponents
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  let sub: string | undefined;
  try {
    ({ payload: { sub } } = await jwtVerify(token, secret()));
  } catch {
    return null;
  }
  if (!sub || !/^[0-9a-f-]{36}$/i.test(sub)) return null;
  const [u] = await sql`select id, name, email, role, status from cms_users where id = ${sub}`;
  return u && u.status === "active" ? (u as unknown as SessionUser) : null;
});

/** For admin pages: send people who are not signed in to the login page, and people without the role back to the overview. */
export async function requireUser(min: Role = "author"): Promise<SessionUser> {
  const u = await getUser();
  if (!u) redirect("/admin/login");
  if (!atLeast(u.role, min)) redirect("/admin?error=" + encodeURIComponent("You do not have permission to open that page."));
  return u;
}

/** For route handlers: throws a 401 or 403 that `api()` turns into a JSON error. */
export async function requireApi(min: Role = "author"): Promise<SessionUser> {
  const u = await getUser();
  if (!u) throw new HttpError(401, "Please sign in");
  if (!atLeast(u.role, min)) throw new HttpError(403, "You do not have permission to do this");
  return u;
}
