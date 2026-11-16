import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Search engines may crawl the public site; the admin, the API and the not-found page are kept out. AI crawlers are allowed. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/page-not-found"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
