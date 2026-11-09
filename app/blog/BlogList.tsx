"use client";

import { useState } from "react";
import Link from "next/link";

export type BlogListItem = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingMinutes: number;
  featured: boolean;
};

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogList({
  posts,
  categories,
}: {
  posts: BlogListItem[];
  categories: string[];
}) {
  const [c, setC] = useState("All");
  const shown = posts.filter((p) => c === "All" || p.category === c);
  const featured = shown.find((p) => p.featured) || shown[0];
  const rest = shown.filter((p) => p.slug !== featured?.slug);

  return (
    <>
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Blog categories">
        {categories.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={c === k}
            onClick={() => setC(k)}
            className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
              c === k ? "border-signal bg-signal text-white" : "border-slate-300 hover:border-navy"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {featured && (
        <article className="mt-10">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid gap-8 rounded-2xl border border-slate-200 p-6 transition hover:border-signal md:p-8 lg:grid-cols-2 lg:gap-10"
          >
            <div className="grid aspect-[16/10] place-items-center rounded-2xl bg-cloud text-sm font-semibold uppercase tracking-wide text-slate-500 lg:aspect-auto lg:min-h-[280px]">
              {featured.category}
            </div>
            <div className="self-center">
              <p className="text-xs font-bold uppercase tracking-wide text-signal">
                {featured.featured ? "Featured" : featured.category}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight group-hover:text-signal">
                {featured.title}
              </h2>
              <p className="mt-3 text-slate-600">{featured.description}</p>
              <p className="mt-4 text-sm text-slate-500">
                {formatDate(featured.date)} · {featured.readingMinutes} min read
              </p>
              <span className="mt-5 inline-block font-semibold text-signal">Read the article →</span>
            </div>
          </Link>
        </article>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <article key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="group block">
              <div className="grid aspect-[16/10] place-items-center rounded-2xl bg-cloud text-xs font-semibold uppercase tracking-wide text-slate-500">
                {p.category}
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wide text-signal">{p.category}</p>
              <h3 className="mt-2 text-xl font-bold group-hover:text-signal">{p.title}</h3>
              <p className="mt-2 text-slate-600 line-clamp-3">{p.description}</p>
              <p className="mt-3 text-sm text-slate-500">
                {formatDate(p.date)} · {p.readingMinutes} min read
              </p>
            </Link>
          </article>
        ))}
        {shown.length === 0 && <p className="text-slate-600">No articles in this category yet.</p>}
      </div>
    </>
  );
}
