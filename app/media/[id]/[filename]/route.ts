import { sql } from "@/lib/cms/db";
import { uuid } from "@/lib/cms/http";

// Public file route for uploads stored in cms_media. Files never change once uploaded (the name carries a random suffix), so they cache for a year.
export async function GET(req: Request, { params }: { params: Promise<{ id: string; filename: string }> }) {
  const { id: rawId, filename } = await params;
  const id = uuid(rawId);
  if (!id) return new Response("Not found", { status: 404 });
  const [f] = await sql`select data, mime_type, filename, original_name from cms_media where id = ${id}`;
  if (!f || f.filename !== decodeURIComponent(filename)) return new Response("Not found", { status: 404 });

  const etag = `"${id}"`;
  const headers: Record<string, string> = {
    "Content-Type": String(f.mimeType),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    ETag: etag,
    "Content-Disposition": `inline; filename="${String(f.filename).replace(/[^\w.-]/g, "_")}"`,
  };
  // Uploaded SVGs must never run script. (PDFs are left without the sandbox, which would stop the browser's PDF viewer.)
  if (f.mimeType !== "application/pdf") headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
  const data = f.data as Buffer;
  return new Response(new Uint8Array(data), { headers: { ...headers, "Content-Length": String(data.length) } });
}
