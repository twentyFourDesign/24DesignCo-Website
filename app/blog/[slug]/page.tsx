import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/ui";
import MarkdownContent from "@/components/blog/MarkdownContent";
import ArticleToc from "@/components/blog/ArticleToc";
import ShareLinks from "@/components/blog/ShareLinks";
import Tile from "@/components/blog/Tile";
import { formatBlogDate } from "@/lib/blog-visuals";
import { getTeam } from "@/lib/cms/team";
import JsonLd from "@/components/blog/JsonLd";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { SITE_NAME, SITE_URL, shareImages } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
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
      images: shareImages(post.image, post.imageAlt || post.title),
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.description,
      images: shareImages(post.image).map((i) => i.url),
    },
    robots: { index: true, follow: true },
  };
}

/** Splits an article into its opening paragraph (shown as the lede), the body, and the FAQ (the booking box sits just before it). */
function splitContent(content: string) {
  let rest = content.trim();
  let lede = "";
  const first = rest.split(/\n\s*\n/)[0] ?? "";
  if (first && !/^\s*(#|[-*+] |\d+\. |\||>|!\[|<)/.test(first)) {
    lede = first.trim();
    rest = rest.slice(first.length).trim();
  }
  const faqAt = rest.search(/^## Frequently asked questions\s*$/m);
  return faqAt === -1 ? { lede, body: rest, faq: "" } : { lede, body: rest.slice(0, faqAt).trim(), faq: rest.slice(faqAt).trim() };
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

// `params` is only awaited inside <Suspense>, so the static shell can be built without knowing the slug.
export default function BlogPostPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="min-h-[60vh]" aria-busy="true" />}>
      <BlogPostContent params={params} />
    </Suspense>
  );
}

async function BlogPostContent({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [related, team] = await Promise.all([getRelatedPosts(post), getTeam().catch(() => [])]);
  const member = team.find((m) => m.name.trim().toLowerCase() === post.author.trim().toLowerCase());
  const role = member?.role || "24 Design Co.";
  const { lede, body, faq } = splitContent(post.content);
  const showToc = post.headings.length >= 2;
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
      { "@type": "ListItem", position: 3, name: post.category, item: `${SITE_URL}/blog?topic=${encodeURIComponent(post.category)}` },
      { "@type": "ListItem", position: 4, name: post.title, item: url },
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

      <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-cloud">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-2 gap-y-1 px-5 py-3.5 text-sm text-slate-600 md:px-8">
          <li><Link href="/" className="hover:text-signal">Home</Link></li>
          <li aria-hidden="true">›</li>
          <li><Link href="/blog" className="hover:text-signal">Blog</Link></li>
          <li aria-hidden="true">›</li>
          <li><Link href={`/blog?topic=${encodeURIComponent(post.category)}`} className="hover:text-signal">{post.category}</Link></li>
          <li aria-hidden="true" className="hidden md:block">›</li>
          <li aria-current="page" className="hidden font-semibold text-navy md:block">{post.title}</li>
        </ol>
      </nav>

      <article>
        <header className="mx-auto max-w-[1200px] px-5 pt-8 md:px-8 md:pt-11">
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-signal">{post.category}</p>
          <h1 className="mt-3 max-w-[900px] text-[30px] font-extrabold leading-[1.12] tracking-tight text-navy md:text-[46px] md:leading-[1.1]">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-5 md:mt-6">
            <div className="flex items-center gap-3.5">
              {member?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
              ) : (
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-signal text-[15px] font-bold text-white">{initials(post.author)}</span>
              )}
              <div>
                <p className="font-semibold text-navy">{post.author}</p>
                <p className="text-[13px] text-slate-600">
                  {role} · <time dateTime={post.date}>{formatBlogDate(post.date)}</time> · {post.readingMinutes} min read
                </p>
              </div>
            </div>
            <ShareLinks url={url} title={post.title} />
          </div>
          {post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image} alt={post.imageAlt} className="mt-7 h-[180px] w-full rounded-[14px] object-cover md:mt-8 md:h-[300px]" />
          ) : (
            <Tile category={post.category} dot="." className="mt-7 h-[180px] rounded-[14px] md:mt-8 md:h-[300px]" glyphClass="text-[80px] md:text-[130px] leading-none" />
          )}
          {showToc && <ArticleToc headings={post.headings} variant="inline" />}
        </header>

        <div className="mx-auto flex max-w-[1200px] items-start gap-14 px-5 pb-14 pt-8 md:px-8 md:pb-16 md:pt-11">
          {showToc && <ArticleToc headings={post.headings} variant="side" />}
          <div className="min-w-0 max-w-[720px] flex-1">
            {lede && (
              <div className="mb-2.5 rounded-r-xl border-l-4 border-launch bg-cloud px-5 py-5 text-[17px] leading-relaxed text-navy md:px-6 md:text-[19px]">
                <MarkdownContent content={lede} lede />
              </div>
            )}
            <MarkdownContent content={body} />

            <aside aria-label="Book a free idea review" className="my-9 flex flex-wrap items-center justify-between gap-5 rounded-[14px] bg-signal p-6 text-white md:p-7">
              <div className="flex-[1_1_300px]">
                <p className="font-display text-xl font-extrabold md:text-2xl">{post.ctaHeading}</p>
                <p className="mt-1.5">A free 30-minute idea review. Honest advice, no obligation.</p>
              </div>
              <Link href="/contact" className="w-full rounded-lg bg-white px-6 py-3.5 text-center font-semibold text-blue-700 transition hover:bg-blue-50 sm:w-auto">Book a free idea review</Link>
            </aside>

            {faq && <MarkdownContent content={faq} />}

            <div className="mt-10 flex items-start gap-4 rounded-[14px] border border-slate-200 p-5 md:gap-[18px] md:p-6">
              {member?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photo} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
              ) : (
                <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-signal text-xl font-bold text-white">{initials(post.author)}</span>
              )}
              <div className="min-w-0">
                <p className="text-lg font-semibold text-navy">{post.author}</p>
                <p className="text-sm font-medium text-slate-600">{role}</p>
                {member?.shortBio && <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{member.shortBio}</p>}
                {member && <Link href="/about" className="mt-2 inline-block text-sm font-semibold text-signal hover:underline">More about {member.name.split(" ")[0]}</Link>}
              </div>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-cloud" aria-labelledby="keep-reading">
          <div className="mx-auto max-w-[1200px] px-5 py-12 md:px-8 md:py-14">
            <h2 id="keep-reading" className="text-2xl font-extrabold tracking-tight text-navy md:text-[32px]">Keep reading</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3 md:gap-6">
              {related.map((item) => (
                <Link key={item.slug} href={`/blog/${item.slug}`} className="group flex overflow-hidden rounded-[14px] border border-slate-200 bg-white transition hover:border-signal md:flex-col">
                  <Tile category={item.category} className="w-[96px] shrink-0 md:h-[130px] md:w-auto" glyphClass="text-[22px] md:text-[40px]" />
                  <div className="min-w-0 px-4 py-4 md:px-5 md:pb-[22px] md:pt-[18px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-signal md:text-xs">{item.category}</p>
                    <h3 className="mt-1 font-bold leading-[1.3] text-navy group-hover:text-signal md:mt-1.5 md:text-[17px]">{item.title}</h3>
                    <p className="mt-2 hidden text-[13px] leading-normal text-slate-600 md:block">{item.excerpt}</p>
                    <p className="mt-1.5 text-[13px] text-slate-600 md:mt-2.5">{item.readingMinutes} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </main>
  );
}
