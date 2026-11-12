"use client";
import { Bold, Code, Eye, Heading2, Heading3, Italic, Link2, List, ListOrdered, Pencil, Quote } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/components/cms/ui/core";

type Edit = { value: string; from: number; to: number };

const PREVIEW: Components = {
  h1: ({ children }) => <h1 className="mt-6 mb-3 text-2xl font-bold text-ink">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-6 mb-2 text-xl font-semibold text-ink">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-5 mb-2 text-lg font-semibold text-ink">{children}</h3>,
  p: ({ children }) => <p className="my-3 leading-relaxed text-ink-2">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-6 text-ink-2">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6 text-ink-2">{children}</ol>,
  a: ({ href, children }) => <a href={href} className="text-accent underline underline-offset-2">{children}</a>,
  blockquote: ({ children }) => <blockquote className="my-4 border-l-4 border-accent-line bg-accent-soft px-4 py-1 text-ink-2">{children}</blockquote>,
  code: ({ children }) => <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.9em] text-ink">{children}</code>,
  pre: ({ children }) => <pre className="my-4 overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 font-mono text-[13px]">{children}</pre>,
  table: ({ children }) => <div className="my-4 overflow-x-auto"><table className="min-w-full border-collapse text-left text-[13px]">{children}</table></div>,
  th: ({ children }) => <th className="border-b border-line bg-surface-2 px-3 py-2 font-semibold text-ink">{children}</th>,
  td: ({ children }) => <td className="border-b border-line px-3 py-2 text-ink-2">{children}</td>,
  hr: () => <hr className="my-6 border-line" />,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} className="my-4 max-w-full rounded-lg" />
  ),
};

/** Markdown field with a formatting toolbar and a live preview. `value` is the Markdown text. */
export default function MarkdownEditor({ value, onChange, rows = 14 }: { value: string; onChange: (md: string) => void; rows?: number }) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  function apply(fn: (v: string, from: number, to: number) => Edit) {
    const el = ta.current;
    if (!el) return;
    const r = fn(el.value, el.selectionStart, el.selectionEnd);
    onChange(r.value);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(r.from, r.to); });
  }
  const wrap = (before: string, after = before, placeholder = "text") => () => apply((v, a, b) => {
    const sel = v.slice(a, b) || placeholder;
    return { value: v.slice(0, a) + before + sel + after + v.slice(b), from: a + before.length, to: a + before.length + sel.length };
  });
  const linePrefix = (prefix: string | ((i: number) => string)) => () => apply((v, a, b) => {
    const start = v.lastIndexOf("\n", a - 1) + 1;
    const endIdx = v.indexOf("\n", b);
    const end = endIdx === -1 ? v.length : endIdx;
    const lines = v.slice(start, end).split("\n").map((l, i) => (typeof prefix === "function" ? prefix(i) : prefix) + l);
    const text = lines.join("\n");
    return { value: v.slice(0, start) + text + v.slice(end), from: start, to: start + text.length };
  });
  const link = () => apply((v, a, b) => {
    const sel = v.slice(a, b) || "link text";
    const ins = `[${sel}](https://)`;
    const urlStart = a + sel.length + 3;
    return { value: v.slice(0, a) + ins + v.slice(b), from: urlStart, to: urlStart + 8 };
  });

  const tools = [
    { label: "Bold (Ctrl+B)", icon: Bold, run: wrap("**") },
    { label: "Italic (Ctrl+I)", icon: Italic, run: wrap("*") },
    { label: "Heading 2", icon: Heading2, run: linePrefix("## ") },
    { label: "Heading 3", icon: Heading3, run: linePrefix("### ") },
    { label: "Bulleted list", icon: List, run: linePrefix("- ") },
    { label: "Numbered list", icon: ListOrdered, run: linePrefix((i) => `${i + 1}. `) },
    { label: "Link (Ctrl+K)", icon: Link2, run: link },
    { label: "Quote", icon: Quote, run: linePrefix("> ") },
    { label: "Code", icon: Code, run: wrap("`", "`", "code") },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line-strong bg-surface shadow-card focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface-2 px-2 py-1.5">
        {tools.map((t) => (
          <button key={t.label} type="button" title={t.label} aria-label={t.label} disabled={preview} onClick={t.run}
            className="rounded-md p-1.5 text-ink-2 hover:bg-surface hover:text-ink disabled:opacity-40"><t.icon className="size-4" /></button>
        ))}
        <button type="button" onClick={() => setPreview((p) => !p)} aria-pressed={preview}
          className={cn("ml-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium", preview ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-surface hover:text-ink")}>
          {preview ? <Pencil className="size-3.5" /> : <Eye className="size-3.5" />}{preview ? "Edit" : "Preview"}
        </button>
      </div>
      {preview ? (
        <div className="min-h-40 overflow-y-auto px-4 py-3 text-sm" style={{ minHeight: `${rows * 1.5}rem` }}>
          {value.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={PREVIEW}>{value}</ReactMarkdown> : <p className="text-muted">Nothing to preview yet.</p>}
        </div>
      ) : (
        <textarea
          ref={ta}
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            const k = e.key.toLowerCase();
            if (k === "b") { e.preventDefault(); wrap("**")(); }
            else if (k === "i") { e.preventDefault(); wrap("*")(); }
            else if (k === "k") { e.preventDefault(); link(); }
          }}
          aria-label="Article body in Markdown"
          className="block w-full resize-y bg-surface px-4 py-3 font-mono text-[13px] leading-relaxed text-ink placeholder:text-faint focus:outline-none"
        />
      )}
    </div>
  );
}
