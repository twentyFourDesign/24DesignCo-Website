import "server-only";
import { sql } from "./db";

export const MESSAGE_STATUSES = ["new", "read", "replied", "archived"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
export type MessageScope = "inbox" | "archived";
export const parseMessageScope = (v: unknown): MessageScope => (v === "archived" ? "archived" : "inbox");
export const CONTACT_STAGES = ["Just an idea", "Have a prototype", "Building now", "Live product"];

export type MessageRow = {
  id: string; name: string; email: string; whatsapp: string; message: string; stage: string; page: string;
  status: MessageStatus; notes: string; createdAt: Date; updatedAt: Date;
};

/** Inbox = everything not archived (new first, then newest). */
export async function listMessages(scope: MessageScope, q = "") {
  const like = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const search = q ? sql`and (name ilike ${like} or email ilike ${like} or whatsapp ilike ${like} or message ilike ${like})` : sql``;
  const where = scope === "archived" ? sql`status = 'archived'` : sql`status <> 'archived'`;
  return (await sql`select * from cms_messages where ${where} ${search}
    order by (status = 'new') desc, created_at desc limit 300`) as unknown as MessageRow[];
}

export async function messageCounts() {
  const [r] = await sql`select count(*) filter (where status <> 'archived')::int as inbox, count(*) filter (where status = 'archived')::int as archived,
    count(*) filter (where status = 'new')::int as unread from cms_messages`;
  return r as unknown as { inbox: number; archived: number; unread: number };
}
