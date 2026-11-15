import type { Metadata } from "next";
import { CtaBand } from "@/components/ui";
import BlogList from "./BlogList";
import NewsletterForm from "./NewsletterForm";
import { getAllPosts } from "@/lib/blog";
import { SITE_NAME, SITE_URL, shareImages } from "@/lib/site";
import JsonLd from "@/components/blog/JsonLd";

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description:
    "Practical advice for founders building their first product: app costs in Nigeria, MVP scope, Discovery Sprints, CRM builds, fitness, ridesharing and streaming apps.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description:
      "Practical advice for founders building their first product: costs, MVP scope, Discovery Sprints and product guides.",
    url: `${SITE_URL}/blog`,
    type: "website",
    images: shareImages(null, "24 Design Co. blog"),
  },
  twitter: { card: "summary_large_image", images: shareImages(null).map((i) => i.url) },
};

export default async function Page() {
  const posts = await getAllPosts();
  const items = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.excerpt,
    category: p.category,
    date: p.date,
    readingMinutes: p.readingMinutes,
    featured: p.featured,
    author: p.author,
  }));

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    description:
      "Practical advice for founders building their first product: app costs in Nigeria, MVP scope, Discovery Sprints and product guides.",
    url: `${SITE_URL}/blog`,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      author: { "@type": "Person", name: p.author },
      url: `${SITE_URL}/blog/${p.slug}`,
    })),
  };

  return (
    <main>
      <JsonLd data={collectionLd} />
      <BlogList posts={items} />
      <NewsletterForm />
      <CtaBand />
    </main>
  );
}
