import { api, badRequest, readJson, uuid } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { requireApi } from "@/lib/cms/auth";
import { bust, TAGS } from "@/lib/cms/revalidate";

export const POST = api(async (req: Request) => {
  await requireApi("editor");
  const { ids } = await readJson(req);
  if (!Array.isArray(ids)) throw badRequest("ids must be a list");
  await sql.begin(async (tx) => { for (let i = 0; i < ids.length; i++) { const id = uuid(ids[i]); if (id) await tx`update cms_team set sort_order = ${i} where id = ${id}`; } });
  bust(TAGS.team);
  return { ok: true };
});
