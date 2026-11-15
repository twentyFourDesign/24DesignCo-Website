"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { categoryLook, formatBlogDate, TOPIC_ORDER } from "@/lib/blog-visuals";
import Tile from "@/components/blog/Tile";

export type BlogListItem = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingMinutes: number;
  featured: boolean;
  author: string;
};

const chip = "shrink-0 whitespace-nowrap rounded-full border px-4 py-[7px] text-sm font-semibold transition";

/** The blog index: hero with search and topic filters, featured guide, topics and the latest guides. */
export default function BlogList({ posts }: { posts: BlogListItem[] }) {
  const [topic, setTopic] = useState("All");
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLElement>(null);

  // /blog?topic=Costs (used by the breadcrumb on each article) opens with that topic selected.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("topic");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the URL once on load
    if (t) setTopic(t);
  }, []);

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    const rank = (c: string) => (TOPIC_ORDER.indexOf(c) + 1 || 99);
    return [...counts.entries()].sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count }));
  }, [posts]);

  const q = query.trim().toLowerCase();
  const filtering = topic !== "All" || q !== "";
  const matches = posts.filter(
    (p) => (topic === "All" || p.category === topic) && (!q || `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(q)),
  );
  const featured = filtering ? undefined : posts.find((p) => p.featured) || posts[0];
  const latest = matches.filter((p) => p.slug !== featured?.slug);

  function pick(name: string, scroll = false) {
    setTopic(name);
    const url = new URL(window.location.href);
    if (name === "All") url.searchParams.delete("topic");
    else url.searchParams.set("topic", name);
    window.history.replaceState(null, "", url);
    if (scroll) listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-5 pb-14 pt-12 md:px-8 md:pb-16 md:pt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300 md:text-sm">Blog</p>
          <h1 className="mt-3 max-w-[820px] text-[30px] font-extrabold leading-[1.1] tracking-tight md:text-[46px]">
            Practical advice for founders building their first product
          </h1>
          <p className="mt-4 max-w-[640px] leading-relaxed text-slate-300 md:text-lg">
            Plain-language guides on costs, MVPs and building your first app<span className="hidden md:inline">, written by the team that builds them</span>.
          </p>
          <div className="mt-6 flex flex-col gap-3.5 md:mt-8 md:flex-row md:flex-wrap md:items-center">
            <label htmlFor="blog-search" className="sr-only">Search guides</label>
            <input
              id="blog-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guides"
              className="w-full rounded-lg border border-slate-500 bg-white px-3 py-3 text-slate-900 placeholder:text-slate-500 md:max-w-[300px]"
            />
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1.5 md:mx-0 md:flex-wrap md:gap-2.5 md:overflow-visible md:px-0 md:pb-0" role="group" aria-label="Filter by topic">
              {["All", ...topics.map((t) => t.name)].map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={topic === name}
                  onClick={() => pick(name)}
                  className={`${chip} ${topic === name ? "border-signal bg-signal text-white" : "border-slate-300 bg-white text-navy hover:border-signal"}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {featured && (
        <div className="mx-auto max-w-[1200px] px-5 pt-8 md:px-8 md:pt-14">
          <Link href={`/blog/${featured.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 transition hover:border-signal lg:flex-row">
            <Tile category={featured.category} dot="?" className="h-[170px] lg:h-auto lg:min-h-[320px] lg:flex-1" glyphClass="text-[84px] lg:text-[150px] leading-none" />
            <div className="p-5 lg:flex-1 lg:p-11">
              <p className="text-xs font-semibold uppercase tracking-[0.17em] text-signal">Featured · {featured.category}</p>
              <h2 className="mt-2 text-[23px] font-extrabold leading-[1.2] text-navy group-hover:text-signal lg:mt-3 lg:text-[34px] lg:leading-[1.15]">{featured.title}</h2>
              <p className="mt-2.5 leading-relaxed text-slate-600 lg:mt-3.5 lg:text-[17px]">{featured.description}</p>
              <p className="mt-2.5 text-[13px] text-slate-600 lg:mt-[18px]">
                {featured.author} · {featured.readingMinutes} min read · <time dateTime={featured.date}>{formatBlogDate(featured.date)}</time>
              </p>
              <span className="mt-4 block rounded-lg bg-signal px-6 py-3.5 text-center font-semibold text-white transition group-hover:bg-blue-700 lg:mt-6 lg:inline-block">Read the guide</span>
            </div>
          </Link>
        </div>
      )}

      {!filtering && topics.length > 1 && (
        <section className="mx-auto max-w-[1200px] px-5 pt-10 md:px-8 md:pt-14" aria-labelledby="topics-h">
          <h2 id="topics-h" className="text-2xl font-extrabold tracking-tight text-navy md:text-[32px]">Browse by topic</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3 md:gap-6">
            {topics.map((t) => {
              const look = categoryLook(t.name);
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => pick(t.name, true)}
                  className="group rounded-xl border border-slate-200 p-[18px] text-left transition hover:border-signal md:p-7"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.17em] text-signal">{t.count} {t.count === 1 ? "guide" : "guides"}</span>
                  <span className="mt-2 block font-display text-[19px] font-bold text-navy md:text-[22px]">{look.topic}</span>
                  <span className="mt-2 block leading-relaxed text-slate-600">{look.blurb}</span>
                  <span className="mt-3.5 hidden font-semibold text-blue-700 group-hover:underline md:block">View guides →</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section ref={listRef} className="mx-auto max-w-[1200px] scroll-mt-24 px-5 py-10 md:px-8 md:py-14" aria-labelledby="latest-h">
        <h2 id="latest-h" className="text-2xl font-extrabold tracking-tight text-navy md:text-[32px]">
          {filtering ? (topic === "All" ? "Search results" : categoryLook(topic).topic) : "Latest guides"}
        </h2>
        {filtering && (
          <p className="mt-2 text-slate-600" role="status">
            {matches.length} {matches.length === 1 ? "guide" : "guides"}
            {q && <> matching “{query.trim()}”</>}.{" "}
            <button type="button" onClick={() => { setQuery(""); pick("All"); }} className="font-semibold text-signal hover:underline">Show all guides</button>
          </p>
        )}

        {/* Phones: compact rows. */}
        <ul className="mt-3 md:hidden">
          {latest.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="flex gap-3.5 border-b border-slate-200 py-3.5">
                <Tile category={p.category} className="h-[84px] w-[84px] shrink-0 rounded-xl" glyphClass="text-[22px]" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-signal">{p.category}</p>
                  <p className="mt-0.5 font-semibold leading-snug text-navy">{p.title}</p>
                  <p className="mt-0.5 text-[13px] text-slate-600">{p.readingMinutes} min read</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Tablets and computers: cards. */}
        <div className="mt-5 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
          {latest.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white transition hover:border-signal">
              <Tile category={p.category} className="h-[130px]" glyphClass="text-[40px]" />
              <div className="px-5 pb-[22px] pt-[18px]">
                <p className="text-xs font-semibold uppercase tracking-[0.17em] text-signal">{p.category}</p>
                <h3 className="mt-1.5 text-[17px] font-bold leading-[1.3] text-navy group-hover:text-signal">{p.title}</h3>
                <p className="mt-2 text-[13px] leading-normal text-slate-600">{p.description}</p>
                <p className="mt-2.5 text-[13px] text-slate-600">{p.readingMinutes} min read</p>
              </div>
            </Link>
          ))}
          <div className="flex flex-col justify-center rounded-[14px] bg-navy p-7 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-blue-300">Your turn</p>
            <p className="mb-4 mt-2.5 font-display text-2xl font-extrabold leading-[1.2]">Got an idea you want to build?</p>
            <Link href="/contact" className="rounded-lg bg-signal px-6 py-3.5 text-center font-semibold text-white transition hover:bg-blue-700">Book a free idea review</Link>
          </div>
        </div>

        {latest.length === 0 && <p className="mt-6 text-slate-600">No guides match yet. Try another word or topic.</p>}
      </section>
    </>
  );
}
