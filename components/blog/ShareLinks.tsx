"use client";
import { useState } from "react";

const chip = "inline-block rounded-full border border-slate-300 bg-white px-4 py-[7px] text-sm font-semibold text-navy transition hover:border-signal";

/** Share chips under an article's title. */
export default function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5" aria-label="Share this guide" role="group">
      <a className={chip} href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
      <a className={chip} href={`https://x.com/intent/post?url=${u}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">X<span className="sr-only"> (opens in a new tab)</span></a>
      <button type="button" onClick={copy} className={chip}>{copied ? "Link copied" : "Copy link"}</button>
      <span className="sr-only" role="status">{copied ? "Link copied" : ""}</span>
    </div>
  );
}
