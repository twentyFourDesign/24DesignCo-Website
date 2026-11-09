import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, PrimaryBtn, Section } from "@/components/ui";
import MarkdownContent from "@/components/blog/MarkdownContent";
import JsonLd from "@/components/blog/JsonLd";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.seoTitle} | ${SITE_NAME}`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.seoTitle,
      description: post.description,
      siteName: SITE_NAME,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.description,
    },
    robots: { index: true, follow: true },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);
  const url = `${SITE_URL}/blog/${post.slug}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    inLanguage: "en",
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const faqLd =
    post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <main>
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      {faqLd && <JsonLd data={faqLd} />}

      <article>
        <header className="bg-navy text-white">
          <div className="mx-auto max-w-[1200px] px-5 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16">
            <nav aria-label="Breadcrumb" className="text-sm text-slate-300">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-white/80">{post.category}</li>
              </ol>
            </nav>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              {post.category}
            </p>
            <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-[1.15] tracking-tight md:text-5xl">
              {post.title}
            </h1>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              <span>
                By <span className="text-white">{post.author}</span>
              </span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>{post.readingMinutes} min read</span>
            </div>
          </div>
        </header>

        <Section>
          <div className="mx-auto max-w-[820px]">
            {post.headings.length > 3 && (
              <aside className="mb-10 rounded-2xl border border-slate-200 bg-cloud p-6">
                <p className="text-sm font-bold uppercase tracking-wide text-signal">In this article</p>
                <ol className="mt-4 space-y-2">
                  {post.headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="text-slate-700 hover:text-signal">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </aside>
            )}

            <MarkdownContent content={post.content} />

            <div className="mt-14 rounded-2xl bg-navy p-8 text-white md:p-10">
              <h2 className="text-2xl font-extrabold md:text-3xl">Ready to turn this into a build plan?</h2>
              <p className="mt-3 max-w-2xl text-slate-300">
                Book a free idea review. We will help you decide what belongs in version one and what can wait.
              </p>
              <PrimaryBtn className="mt-7" />
            </div>
          </div>
        </Section>
      </article>

      <section className="border-t border-slate-200 bg-cloud">
        <Section>
          <h2 className="text-2xl font-extrabold md:text-3xl">Related reading</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-signal"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-signal">{item.category}</p>
                <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.description}</p>
              </Link>
            ))}
          </div>
        </Section>
      </section>

      <CtaBand />
    </main>
  );
}
