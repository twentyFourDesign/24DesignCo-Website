import { api, notFound, readJson, uuid } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { requireApi } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { bust, TAGS } from "@/lib/cms/revalidate";

type Ctx = { params: Promise<{ id: string }> };
const str = (v: unknown) => (typeof v === "string" ? v : "");

export const GET = api(async (_req: Request, { params }: Ctx) => {
  await requireApi("editor");
  const id = uuid((await params).id);
  const [m] = id ? await sql`select * from cms_team where id = ${id}` : [];
  if (!m) throw notFound("Team member");
  return { member: m };
});

export const PATCH = api(async (req: Request, { params }: Ctx) => {
  const me = await requireApi("editor");
  const id = uuid((await params).id);
  const [cur] = id ? await sql`select * from cms_team where id = ${id}` : [];
  if (!cur) throw notFound("Team member");
  const b = await readJson(req);
  const links = b.links && typeof b.links === "object" ? { ...cur.links, ...(b.links as object) } : cur.links;
  const founder = b.isFounder !== undefined ? Boolean(b.isFounder) : cur.isFounder;
  await sql.begin(async (tx) => {
    if (founder) await tx`update cms_team set is_founder = false where id <> ${cur.id}`;
    await tx`update cms_team set
      name = ${b.name !== undefined ? str(b.name).trim() : cur.name}, role = ${b.role !== undefined ? str(b.role).trim() : cur.role},
      short_bio = ${b.shortBio !== undefined ? str(b.shortBio) : cur.shortBio}, bio = ${b.bio !== undefined ? str(b.bio) : cur.bio},
      research_area = ${b.researchArea !== undefined ? str(b.researchArea) : cur.researchArea},
      photo = ${b.photo !== undefined ? str(b.photo) : cur.photo}, photo_alt = ${b.photoAlt !== undefined ? str(b.photoAlt) : cur.photoAlt},
      links = ${sql.json(links)}, is_founder = ${founder}, visible = ${b.visible !== undefined ? Boolean(b.visible) : cur.visible}, updated_at = now()
      where id = ${cur.id}`;
  });
  await logActivity(me, "team", "updated", `Team: ${str(b.name) || cur.name || cur.role}`, `/admin/team/${cur.id}`);
  bust(TAGS.team);
  return { ok: true };
});

export const DELETE = api(async (_req: Request, { params }: Ctx) => {
  const me = await requireApi("editor");
  const id = uuid((await params).id);
  const [m] = id ? await sql`delete from cms_team where id = ${id} returning name, role` : [];
  if (!m) throw notFound("Team member");
  await logActivity(me, "team", "removed", `Team: ${m.name || m.role}`, "/admin/team");
  bust(TAGS.team);
  return { ok: true };
});
