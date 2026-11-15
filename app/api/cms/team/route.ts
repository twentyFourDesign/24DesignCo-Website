import { api, readJson } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { requireApi } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { bust, TAGS } from "@/lib/cms/revalidate";

export const GET = api(async () => {
  await requireApi("editor");
  return { team: await sql`select id, name, role, short_bio, photo, is_founder, visible, sort_order from cms_team order by sort_order, created_at` };
});

export const POST = api(async (req: Request) => {
  const me = await requireApi("editor");
  const b = await readJson(req);
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const [{ n }] = await sql`select count(*)::int as n from cms_team`;
  const [m] = await sql`insert into cms_team (name, role, visible, sort_order) values (${name}, ${typeof b.role === "string" ? b.role : ""}, false, ${n}) returning id`;
  await logActivity(me, "team", "added", `Team: ${name || "new member"}`, `/admin/team/${m.id}`);
  bust(TAGS.team);
  return { id: m.id };
});
