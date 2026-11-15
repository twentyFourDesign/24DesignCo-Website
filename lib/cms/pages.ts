import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { sql } from "./db";
import { TAGS } from "./revalidate";
import { SITE_NAME, SITE_URL, shareImages } from "@/lib/site";
import { getSiteSafe } from "./site";
import type { Section, Seo } from "./sections";

export type PublicPage = { title: string; path: string; sections: Section[]; seo: Seo };

/** The live version of the page at `path`, or null. Cached; refreshed when the admin publishes (TAGS.pages). */
export async function getPublishedPage(path: string): Promise<PublicPage | null> {
  "use cache";
  cacheLife({ revalidate: 60, expire: 3600 });
  cacheTag(TAGS.pages);
  const [r] = await sql`select title, path, published_sections, published_seo from cms_pages where path = ${path} and status = 'published'`;
  if (!r) return null;
  return { title: r.title, path: r.path, sections: r.publishedSections as Section[], seo: (r.publishedSeo ?? {}) as Seo };
}

/** Next.js metadata from a page's published SEO. */
export async function pageMetadata(path: string): Promise<Metadata> {
  const page = await getPublishedPage(path);
  if (!page) return {};
  const { metaTitle, metaDescription, ogImage, noIndex } = page.seo;
  const site = await getSiteSafe();
  const title = metaTitle || `${page.title}${site.seo.titleSuffix || " | 24 Design Co."}`;
  const description = metaDescription || site.seo.defaultDescription || undefined;
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const images = shareImages(ogImage || site.seo.ogImage, title);
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, siteName: SITE_NAME, locale: "en_NG", images },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
