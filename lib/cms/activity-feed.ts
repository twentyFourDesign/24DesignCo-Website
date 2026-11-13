import "server-only";
import { sql } from "./db";

export const ACTIVITY_PAGE_SIZE = 30;
export type ActivityRow = { id: string; userName: string | null; kind: string; action: string; subject: string; link: string; createdAt: Date };

export async function activityKinds() {
  const rows = await sql`select distinct kind from cms_activity order by kind`;
  return rows.map((r) => r.kind as string);
}

/** Content changes only: what an author may see. Bookings, messages, users and settings are for editors and above. */
export const CONTENT_KINDS = ["page", "post", "project", "team", "media"];

export async function listActivity({ kind = "", page = 1, contentOnly = false }: { kind?: string; page?: number; contentOnly?: boolean }) {
  const p = Math.max(1, Math.floor(page));
  const where = kind && contentOnly && !CONTENT_KINDS.includes(kind) ? sql`where false`
    : kind ? sql`where kind = ${kind}`
    : contentOnly ? sql`where kind in ${sql(CONTENT_KINDS)}` : sql``;
  const [rows, [c]] = await Promise.all([
    sql`select id, user_name, kind, action, subject, link, created_at from cms_activity ${where} order by created_at desc, id desc limit ${ACTIVITY_PAGE_SIZE} offset ${(p - 1) * ACTIVITY_PAGE_SIZE}`,
    sql`select count(*)::int as n from cms_activity ${where}`,
  ]);
  return { items: rows as unknown as ActivityRow[], total: c.n as number, page: p, pages: Math.max(1, Math.ceil(c.n / ACTIVITY_PAGE_SIZE)) };
}
