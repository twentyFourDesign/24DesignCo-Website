import "server-only";
import { sql } from "./db";
import type { SessionUser } from "./auth";

export async function logActivity(user: Pick<SessionUser, "id" | "name" | "email"> | null, kind: string, action: string, subject: string, link = "") {
  try {
    await sql`insert into cms_activity (user_id, user_name, kind, action, subject, link)
      values (${user?.id ?? null}, ${user?.name || user?.email || "Website"}, ${kind}, ${action}, ${subject}, ${link})`;
  } catch (e) {
    console.warn("Could not log activity:", (e as Error).message);
  }
}
