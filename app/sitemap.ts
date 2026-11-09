import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const staticRoutes = [
  "",
  "/about",
  "/blog",
  "/contact",
  "/how-we-work",
  "/our-work",
  "/our-work/jara-beach-resort",
  "/our-work/lufasi-lodges",
  "/our-work/nexuss",
  "/our-work/sharporders",
  "/services",
  "/services/cto-as-a-service",
  "/services/discovery-sprint",
  "/services/mvp-development",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getAllPosts();

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
