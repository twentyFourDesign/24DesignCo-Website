import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { sql } from "@/lib/cms/db";

// Used only if the database cannot be reached; normally the pages and case studies come from the CMS.
const fallbackRoutes = ["", "/about", "/blog", "/contact", "/how-we-work", "/our-work", "/services", "/services/cto-as-a-service", "/services/discovery-sprint", "/services/mvp-development"];

async function cmsRoutes(): Promise<string[]> {
  try {
    const pages = await sql`select path from cms_pages where status = 'published' and coalesce(published_seo->>'noIndex', 'false') <> 'true' order by path`;
    const work = await sql`select slug from cms_projects where status = 'published' order by sort_order`;
    const routes = new Set<string>(["/blog"]);
    for (const p of pages) routes.add(p.path === "/" ? "" : String(p.path));
    for (const w of work) routes.add(`/our-work/${w.slug}`);
    return [...routes];
  } catch {
    return fallbackRoutes;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getAllPosts();
  const staticRoutes = await cmsRoutes();

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: now,
      changeFrequency: route === "" || route === "/blog" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route.startsWith("/services") || route === "/blog" ? 0.8 : 0.6,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.9 : 0.7,
    })),
  ];
}
