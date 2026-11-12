import crypto from "node:crypto";
import { api, badRequest } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { bust, TAGS } from "@/lib/cms/revalidate";
import { logActivity } from "@/lib/cms/activity";
import { FOLDERS } from "@/lib/cms/blog-shared";
import { sniff, svgIsSafe, svgSize } from "@/lib/cms/image-size";
import { listMedia } from "@/lib/cms/media-server";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 20;

// Authors may list and upload (they add images to their articles); changing and deleting is for editors.
export const GET = api(async (req: Request) => {
  await requireApi("author");
  const u = new URL(req.url).searchParams;
  return listMedia({ folder: u.get("folder") || undefined, q: u.get("q") || undefined, type: u.get("type") || undefined, missingAlt: u.get("missingAlt") === "1" });
});

export const POST = api(async (req: Request) => {
  const user = await requireApi("author");
  let form: FormData;
  try { form = await req.formData(); } catch { throw badRequest("Choose at least one file"); }
  const files = form.getAll("files").filter((f): f is File => typeof f !== "string" && f.size >= 0 && "arrayBuffer" in f);
  if (!files.length) throw badRequest("Choose at least one file");
  if (files.length > MAX_FILES) throw badRequest(`Upload up to ${MAX_FILES} files at a time`);
  const folderRaw = String(form.get("folder") ?? "");
  const folder = (FOLDERS as readonly string[]).includes(folderRaw) ? folderRaw : "Other";
  const alt = String(form.get("alt") ?? "").slice(0, 300);

  const created: unknown[] = [];
  const errors: string[] = [];
  for (const f of files) {
    if (f.size === 0) { errors.push(`${f.name}: the file is empty`); continue; }
    if (f.size > MAX_BYTES) { errors.push(`${f.name}: larger than 10 MB`); continue; }
    const bytes = new Uint8Array(await f.arrayBuffer());
    const kind = sniff(bytes);
    if (!kind) { errors.push(`${f.name}: only PNG, JPG, WEBP, GIF, SVG or PDF files`); continue; }
    let { width, height } = kind;
    if (kind.mime === "image/svg+xml") {
      const text = new TextDecoder().decode(bytes);
      if (!svgIsSafe(text)) { errors.push(`${f.name}: contains scripts or external links and was not uploaded`); continue; }
      ({ width, height } = svgSize(text));
    }
    const base = f.name.replace(/\.[^.]*$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "file";
    const filename = `${base}-${crypto.randomBytes(4).toString("hex")}${kind.ext}`;
    const [row] = await sql`insert into cms_media (filename, original_name, mime_type, size, width, height, alt, folder, data, uploaded_by)
      values (${filename}, ${f.name.slice(0, 200)}, ${kind.mime}, ${bytes.length}, ${width ?? null}, ${height ?? null}, ${alt}, ${folder}, ${Buffer.from(bytes)}, ${user.id})
      returning id, filename, original_name, mime_type, size, width, height, alt, folder, created_at`;
    created.push({ ...row, url: `/media/${row.id}/${row.filename}` });
  }
  if (!created.length) throw badRequest(errors.join(". "), { errors });
  await logActivity(user, "media", "uploaded", `${created.length} file${created.length > 1 ? "s" : ""}`, "/admin/media");
  bust(TAGS.media);
  return Response.json({ files: created, errors }, { status: 201 });
});
