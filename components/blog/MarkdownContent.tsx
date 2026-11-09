import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { slugify } from "@/lib/blog";

const PHRASE_LINKS: { pattern: RegExp; href: string }[] = [
  {
    pattern: /guide to the cost of building an app in Nigeria/i,
    href: "/blog/how-much-does-it-cost-to-build-an-app-in-nigeria",
  },
  {
    pattern: /Book a free idea review/i,
    href: "/contact",
  },
];

function linkifyText(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let i = 0;

  while (remaining.length) {
    let earliest: { index: number; length: number; href: string; label: string } | null = null;
    for (const { pattern, href } of PHRASE_LINKS) {
      const match = remaining.match(pattern);
      if (!match || match.index === undefined) continue;
      if (!earliest || match.index < earliest.index) {
        earliest = { index: match.index, length: match[0].length, href, label: match[0] };
      }
    }

    if (!earliest) {
      nodes.push(remaining);
      break;
    }

    if (earliest.index > 0) nodes.push(remaining.slice(0, earliest.index));
    nodes.push(
      <Link
        key={`${keyPrefix}-${i++}`}
        href={earliest.href}
        className="font-medium text-signal underline-offset-2 hover:underline"
      >
        {earliest.label}
      </Link>,
    );
    remaining = remaining.slice(earliest.index + earliest.length);
  }

  return nodes;
}

function mapChildren(children: React.ReactNode, keyPrefix: string): React.ReactNode {
  return React.Children.map(children, (child, idx) => {
    if (typeof child === "string") return linkifyText(child, `${keyPrefix}-${idx}`);
    return child;
  });
}

const components: Components = {
  h2: ({ children }) => {
    const text = String(children);
    const id = slugify(text);
    return (
      <h2 id={id} className="mt-12 scroll-mt-28 text-2xl font-extrabold tracking-tight md:text-3xl">
        {children}
      </h2>
    );
  },
  h3: ({ children }) => (
    <h3 className="mt-8 text-xl font-bold tracking-tight md:text-2xl">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-base leading-relaxed text-slate-700 md:text-lg">
      {mapChildren(children, "p")}
    </p>
  ),
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{mapChildren(children, "li")}</li>,
  strong: ({ children }) => <strong className="font-semibold text-navy">{children}</strong>,
  a: ({ href, children }) => (
    <Link href={href || "#"} className="font-medium text-signal underline-offset-2 hover:underline">
      {children}
    </Link>
  ),
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full border-collapse text-left text-sm md:text-base">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-cloud">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-slate-200 px-4 py-3 font-semibold text-navy">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700">{children}</td>
  ),
  hr: () => <hr className="my-10 border-slate-200" />,
};

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="blog-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
