"use client";
import { useState } from "react";
import { Placeholder } from "@/components/ui";

const cats = ["All", "Costs", "MVP", "Hiring", "After launch", "Case studies"];
const posts = [
  { cat: "Costs", tag: "FEATURED", title: "How much does it cost to build an app in Nigeria?", d: "[Short summary.]", featured: true },
  { cat: "MVP", tag: "MVP", title: "What is an MVP, and what should yours include?", d: "[Summary.]" },
  { cat: "After launch", tag: "CTO", title: "What does a CTO as a Service actually do?", d: "[Summary.]" },
  { cat: "Hiring", tag: "HIRING", title: "Seven mistakes non-technical founders make when hiring developers", d: "[Summary.]" },
];

export default function BlogList() {
  const [c, setC] = useState("All");
  const shown = posts.filter((p) => c === "All" || p.cat === c);
  return (
    <>
      <div className="flex flex-wrap gap-3">
        {cats.map((k) => (
          <button key={k} onClick={() => setC(k)}
            className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${c === k ? "border-signal bg-signal text-white" : "border-slate-300 hover:border-navy"}`}>{k}</button>
        ))}
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <article key={p.title} className={p.featured ? "md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-2 lg:gap-10" : ""}>
            <Placeholder label="[Article image]" className={p.featured ? "aspect-[16/9]" : "aspect-[16/10]"} />
            <div className={p.featured ? "mt-5 lg:mt-0 lg:self-center" : ""}>
              <p className="mt-5 text-xs font-bold uppercase tracking-wide text-signal lg:mt-0">{p.tag}</p>
              <h3 className={`mt-2 font-bold ${p.featured ? "text-3xl" : "text-xl"}`}>{p.title}</h3>
              <p className="mt-2 text-slate-600">{p.d}</p>
              {p.featured && <span className="mt-4 inline-block font-semibold text-signal">Read the article →</span>}
            </div>
          </article>
        ))}
        {shown.length === 0 && <p className="text-slate-600">No articles in this category yet.</p>}
      </div>
    </>
  );
}
