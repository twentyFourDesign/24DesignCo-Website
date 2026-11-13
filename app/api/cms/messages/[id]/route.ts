import { api, badRequest, notFound, readJson, uuid } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { MESSAGE_STATUSES } from "@/lib/cms/messages";

type Ctx = { params: Promise<{ id: string }> };

async function load(ctx: Ctx) {
  const id = uuid((await ctx.params).id);
  const [m] = id ? await sql`select * from cms_messages where id = ${id}` : [];
  if (!m) throw notFound("Message");
  return m;
}

export const GET = api(async (_req: Request, ctx: Ctx) => {
  await requireApi("editor");
  return { message: await load(ctx) };
});

export const PATCH = api(async (req: Request, ctx: Ctx) => {
  const me = await requireApi("editor");
  const m = await load(ctx);
  const b = await readJson(req);
  let { status, notes } = m as Record<string, string>;
  if (b.notes !== undefined) notes = String(b.notes).slice(0, 5000);
  if (b.status !== undefined) {
    if (!(MESSAGE_STATUSES as readonly string[]).includes(String(b.status))) throw badRequest("Invalid status");
    status = String(b.status);
  }
  const [message] = await sql`update cms_messages set status = ${status}, notes = ${notes}, updated_at = now() where id = ${m.id} returning *`;
  // Opening a message marks it read; that is not worth an activity line. Real changes are.
  if (status !== m.status && status !== "read") await logActivity(me, "message", `marked ${status}`, `Message from ${m.name}`, "/admin/messages");
  return { message };
});

export const DELETE = api(async (_req: Request, ctx: Ctx) => {
  const me = await requireApi("editor");
  const m = await load(ctx);
  await sql`delete from cms_messages where id = ${m.id}`;
  await logActivity(me, "message", "deleted", `Message from ${m.name}`, "/admin/messages");
  return { ok: true };
});
