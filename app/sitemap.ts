import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { sql } from "@/lib/cms/db";

// Used only if the database cannot be reached; normally the pages and case studies come from the CMS.
const fallbackRoutes = ["", "/about", "/blog", "/contact", "/how-we-work", "/our-work", "/services", "/services/cto-as-a-service", "/services/discovery-sprint", "/services/mvp-development"];

/** Published pages and case studies with the date each was last changed. */
async function cmsRoutes(): Promise<{ route: string; at?: Date }[]> {
  try {
    const pages = await sql`select path, updated_at from cms_pages where status = 'published' and coalesce(published_seo->>'noIndex', 'false') <> 'true' order by path`;
    const work = await sql`select slug, updated_at from cms_projects where status = 'published' order by sort_order`;
    const routes = new Map<string, Date | undefined>([["/blog", undefined]]);
    for (const p of pages) routes.set(p.path === "/" ? "" : String(p.path), p.updatedAt as Date);
    for (const w of work) routes.set(`/our-work/${w.slug}`, w.updatedAt as Date);
    return [...routes].map(([route, at]) => ({ route, at }));
  } catch {
    return fallbackRoutes.map((route) => ({ route }));
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const staticRoutes = await cmsRoutes();
  // The blog index changes whenever an article does.
  const newestPost = posts.map((p) => p.updated).sort().pop();

  return [
    ...staticRoutes.map(({ route, at }) => ({
      url: `${SITE_URL}${route}`,
      ...(at ? { lastModified: at } : route === "/blog" && newestPost ? { lastModified: new Date(newestPost) } : {}),
      changeFrequency: route === "" || route === "/blog" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route.startsWith("/services") || route === "/blog" ? 0.8 : 0.6,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated),
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.9 : 0.7,
    })),
  ];
}
