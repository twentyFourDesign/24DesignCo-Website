import { api, badRequest, notFound, readJson, uuid } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { bust, TAGS } from "@/lib/cms/revalidate";
import { logActivity } from "@/lib/cms/activity";
import { FOLDERS } from "@/lib/cms/blog-shared";
import { getMedia, mediaUsage } from "@/lib/cms/media-server";

type Ctx = { params: Promise<{ id: string }> };

export const GET = api(async (_req: Request, { params }: Ctx) => {
  await requireApi("author");
  const id = uuid((await params).id);
  const file = id && (await getMedia(id));
  if (!file) throw notFound("File");
  return { ...file, usedOn: await mediaUsage(file.id) };
});

export const PATCH = api(async (req: Request, { params }: Ctx) => {
  const user = await requireApi("editor");
  const id = uuid((await params).id);
  const file = id && (await getMedia(id));
  if (!file) throw notFound("File");
  const body = await readJson(req);
  const alt = body.alt === undefined ? file.alt : String(body.alt).slice(0, 300);
  const folder = body.folder === undefined ? file.folder : String(body.folder);
  const originalName = body.originalName === undefined ? file.originalName : String(body.originalName).trim().slice(0, 200) || file.originalName;
  if (!(FOLDERS as readonly string[]).includes(folder)) throw badRequest("Unknown folder");
  await sql`update cms_media set alt = ${alt}, folder = ${folder}, original_name = ${originalName} where id = ${file.id}`;
  await logActivity(user, "media", "updated", originalName, "/admin/media");
  bust(TAGS.media);
  return { ...file, alt, folder, originalName };
});

export const DELETE = api(async (req: Request, { params }: Ctx) => {
  const user = await requireApi("editor");
  const id = uuid((await params).id);
  const file = id && (await getMedia(id));
  if (!file) throw notFound("File");
  const usedOn = await mediaUsage(file.id);
  if (usedOn.length && new URL(req.url).searchParams.get("force") !== "1") {
    return Response.json({ error: "This file is still in use. Delete it anyway only if you are sure.", usedOn }, { status: 409 });
  }
  await sql`delete from cms_media where id = ${file.id}`;
  await logActivity(user, "media", "deleted", file.originalName, "/admin/media");
  bust(TAGS.media, TAGS.pages, TAGS.posts, TAGS.work, TAGS.team, TAGS.settings);
  return { ok: true };
});
