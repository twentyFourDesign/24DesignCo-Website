import { NextResponse, type NextRequest } from "next/server";
import { dbConfigured, sql } from "@/lib/cms/db";

/**
 * Real 404s for addresses that do not exist.
 *
 * Pages render inside <Suspense> (the header reads the current path), so by the time a page finds out it is missing the
 * response has already started with "200 OK". Next.js then adds a noindex tag, but the status stays 200, which link checkers,
 * uptime monitors and some crawlers read as "this page exists". This proxy runs before rendering: it checks the address
 * against the published pages, articles and case studies (cached for 30 seconds) and sends unknown ones to the not-found
 * page with a 404 status. An address missing from the cached list is checked once more against the database before it gets
 * a 404, so something published a moment ago works straight away. If the database cannot be reached, requests pass through.
 */

const STATIC_ROUTES = ["/blog"];
const TTL = 30_000;
let known: { at: number; paths: Set<string> } | null = null;
let loading: Promise<Set<string>> | null = null;

async function knownPaths(): Promise<Set<string>> {
  if (known && Date.now() - known.at < TTL) return known.paths;
  loading ??= (async () => {
    try {
      const [pages, posts, work] = await Promise.all([
        sql`select path from cms_pages where status = 'published'`,
        sql`select slug from cms_posts where status = 'published' or (status = 'scheduled' and published_at <= now())`,
        sql`select slug from cms_projects where status = 'published'`,
      ]);
      const paths = new Set<string>(STATIC_ROUTES);
      for (const p of pages) paths.add(String(p.path));
      for (const p of posts) paths.add(`/blog/${p.slug}`);
      for (const w of work) paths.add(`/our-work/${w.slug}`);
      known = { at: Date.now(), paths };
      return paths;
    } finally {
      loading = null;
    }
  })();
  return loading;
}

/** Is this one address published right now? Used when it is not in the cached list (it may have just been published). */
async function existsNow(path: string) {
  const blog = path.match(/^\/blog\/([^/]+)$/);
  const work = path.match(/^\/our-work\/([^/]+)$/);
  const rows = blog
    ? await sql`select 1 from cms_posts where slug = ${blog[1]} and (status = 'published' or (status = 'scheduled' and published_at <= now())) limit 1`
    : work
      ? await sql`select 1 from cms_projects where slug = ${work[1]} and status = 'published' limit 1`
      : await sql`select 1 from cms_pages where path = ${path} and status = 'published' limit 1`;
  if (rows.length) known = null; // refresh the list on the next request
  return rows.length > 0;
}

const normalise = (pathname: string) => {
  let p = pathname;
  try { p = decodeURIComponent(p); } catch { /* keep as is */ }
  p = p.toLowerCase();
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
};

export async function proxy(req: NextRequest) {
  if (!dbConfigured()) return NextResponse.next();
  let paths: Set<string>;
  try {
    paths = await knownPaths();
  } catch {
    return NextResponse.next();
  }
  const path = normalise(req.nextUrl.pathname);
  if (paths.has(path)) return NextResponse.next();
  try {
    if (await existsNow(path)) return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
  return NextResponse.rewrite(new URL("/page-not-found", req.url), { status: 404 });
}

export const config = {
  // Public pages only: not the admin, the API, uploads, Next.js files or anything with a file extension (images, sitemap.xml).
  matcher: ["/((?!admin|api|media|page-not-found|_next|.*\\..*).*)"],
};
