import "server-only";
import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}
export const badRequest = (m: string, d?: unknown) => new HttpError(400, m, d);
export const notFound = (what = "Item") => new HttpError(404, `${what} not found`);
export const forbidden = (m = "You do not have permission to do this") => new HttpError(403, m);

export const isEmail = (s: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s ?? ""));

export function slugify(s = "") {
  return String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

export function requireFields(body: Record<string, unknown> | null | undefined, fields: string[]) {
  const missing = fields.filter((f) => body?.[f] === undefined || body?.[f] === null || String(body[f]).trim() === "");
  if (missing.length) throw badRequest(`Please fill in: ${missing.join(", ")}`, { missing });
}

/** Picks only the allowed keys from a request body, so clients cannot set protected fields. */
export function pick<T extends Record<string, unknown>>(obj: T | null | undefined, keys: string[]): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const k of keys) if (obj && Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  return out as Partial<T>;
}

export const uuid = (s: unknown) => (typeof s === "string" && /^[0-9a-f-]{36}$/i.test(s) ? s : null);

/** Wraps a route handler: thrown HttpErrors become JSON errors, anything else is a logged 500. */
export function api<A extends unknown[]>(fn: (...args: A) => Promise<Response | object>) {
  return async (...args: A): Promise<Response> => {
    try {
      const out = await fn(...args);
      return out instanceof Response ? out : NextResponse.json(out);
    } catch (e) {
      // Next.js signals dynamic rendering and redirects by throwing special errors (they carry a digest); let them through.
      if (e && typeof e === "object" && "digest" in e) throw e;
      if (e instanceof HttpError) return NextResponse.json({ error: e.message, details: e.details }, { status: e.status });
      console.error("API error:", e);
      return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
    }
  };
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const v = await req.json();
    return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  } catch {
    throw badRequest("The request could not be read");
  }
}
