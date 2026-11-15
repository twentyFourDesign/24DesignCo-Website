"use client";
import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

/** "In this guide": a sticky list beside the article on computers (highlights the section you're reading), and a collapsible list on phones. */
export default function ArticleToc({ headings, variant }: { headings: Heading[]; variant: "side" | "inline" }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (variant !== "side") return;
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      let current = els[0]?.id ?? "";
      for (const el of els) if (el.getBoundingClientRect().top < 140) current = el.id;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings, variant]);

  if (variant === "inline")
    return (
      <details open className="mt-5 rounded-xl border border-slate-200 px-4 py-3.5 lg:hidden">
        <summary className="cursor-pointer font-semibold text-navy">In this guide</summary>
        <nav aria-label="In this guide" className="mt-2">
          {headings.map((h) => (
            <a key={h.id} href={`#${h.id}`} className="block py-1.5 text-[15px] text-slate-700 hover:text-signal">{h.text}</a>
          ))}
        </nav>
      </details>
    );

  return (
    <nav aria-label="In this guide" className="sticky top-24 hidden w-[250px] shrink-0 lg:block">
      <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-signal">In this guide</p>
      {headings.map((h) => {
        const on = h.id === active;
        return (
          <a
            key={h.id}
            href={`#${h.id}`}
            aria-current={on ? "location" : undefined}
            className={`block border-l-[3px] py-2 pl-3.5 text-[15px] transition ${on ? "border-signal font-semibold text-navy" : "border-slate-200 text-slate-600 hover:text-navy"}`}
          >
            {h.text}
          </a>
        );
      })}
    </nav>
  );
}
