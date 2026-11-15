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
      <h2 id={id} className="mb-3.5 mt-10 scroll-mt-28 text-2xl font-extrabold tracking-tight text-navy md:text-[28px]">
        {children}
      </h2>
    );
  },
  h3: ({ children }) => (
    <h3 className="mb-3 mt-8 text-xl font-bold tracking-tight text-navy">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-[18px] text-base leading-[1.7] text-slate-700 md:text-[17px]">
      {mapChildren(children, "p")}
    </p>
  ),
  ul: ({ children }) => <ul className="mb-5 list-disc space-y-1.5 pl-6 leading-[1.7] text-slate-700 md:text-[17px]">{children}</ul>,
  ol: ({ children }) => <ol className="mb-5 list-decimal space-y-1.5 pl-6 leading-[1.7] text-slate-700 md:text-[17px]">{children}</ol>,
  li: ({ children }) => <li>{mapChildren(children, "li")}</li>,
  strong: ({ children }) => <strong className="font-semibold text-navy">{children}</strong>,
  a: ({ href, children }) => (
    <Link href={href || "#"} className="font-medium text-signal underline-offset-2 hover:underline">
      {children}
    </Link>
  ),
  table: ({ children }) => (
    <div className="mb-6 mt-1.5 overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-[15px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-navy">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3.5 py-3 text-sm font-semibold text-white">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-200 px-3.5 py-3 align-top text-slate-700">{children}</td>
  ),
  hr: () => <hr className="my-10 border-slate-200" />,
};

const ledeComponents: Components = {
  ...components,
  p: ({ children }) => <p>{mapChildren(children, "lede")}</p>,
};

export default function MarkdownContent({ content, lede = false }: { content: string; lede?: boolean }) {
  return (
    <div className="blog-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={lede ? ledeComponents : components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
