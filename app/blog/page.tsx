import type { Metadata } from "next";
import { CtaBand, PageHero, Section } from "@/components/ui";
import BlogList from "./BlogList";
import { getAllPosts, getBlogCategories } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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
  },
};

export default function Page() {
  const posts = getAllPosts();
  const categories = getBlogCategories(posts);
  const items = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    date: p.date,
    readingMinutes: p.readingMinutes,
    featured: p.featured,
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
      <PageHero eyebrow="Blog" title="Practical advice for founders building their first product">
        Costs, MVP scope, Discovery Sprints and how to build product MVPs without overbuilding.
      </PageHero>
      <Section>
        <BlogList posts={items} categories={categories} />
      </Section>
      <section className="bg-cloud">
        <Section>
          <h2 className="text-2xl font-extrabold md:text-3xl">One practical tip a month</h2>
          <form className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row" action="#">
            <label htmlFor="sub" className="sr-only">
              Email
            </label>
            <input
              id="sub"
              type="email"
              required
              placeholder="Email"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3"
            />
            <button
              type="submit"
              className="rounded-lg bg-signal px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Subscribe
            </button>
          </form>
        </Section>
      </section>
      <CtaBand />
    </main>
  );
}
