import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "./primitives";
import { ICON_PATHS, type Fields, type IconName } from "@/lib/cms/sections";

export const str = (f: Fields, k: string, d = ""): string => (typeof f[k] === "string" ? (f[k] as string) : f[k] == null ? d : String(f[k]));
export const bool = (f: Fields, k: string, d = false): boolean => (typeof f[k] === "boolean" ? (f[k] as boolean) : d);
export const list = (f: Fields, k: string): Record<string, unknown>[] => (Array.isArray(f[k]) ? (f[k] as unknown[]).filter((x): x is Record<string, unknown> => !!x && typeof x === "object") : []);
export const strs = (f: Fields, k: string): string[] => (Array.isArray(f[k]) ? (f[k] as unknown[]).map((x) => String(x ?? "").trim()).filter(Boolean) : []);

/** A link that uses the Next router for site paths and a plain anchor for everything else (mailto:, #hash, https://). */
export function A({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  if (href.startsWith("/") && !href.startsWith("//")) return <Link href={href} className={className}>{children}</Link>;
  return <a href={href} className={className}>{children}</a>;
}

/** **bold** inside a paragraph. */
export function Inline({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") && p.length > 4 ? <strong key={i} className="text-navy">{p.slice(2, -2)}</strong> : p))}</>;
}

export const paragraphs = (t: string) => t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export const linkCls = "font-semibold text-signal hover:underline";

export function Icon({ name, tone = "blue" }: { name: string; tone?: "blue" | "gold" }) {
  const paths = ICON_PATHS[name as IconName];
  if (!paths) return null;
  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone === "gold" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-signal"}`}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {paths.map((d) => <path key={d} d={d} />)}
      </svg>
    </span>
  );
}

/** Bullet list; an entry "Text | /path" becomes a link. */
export function Bullets({ items, gap = "space-y-3", className = "mt-5" }: { items: string[]; gap?: string; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={`${className} ${gap}`}>
      {items.map((raw, i) => {
        const [text, href] = raw.split("|").map((x) => x.trim());
        return (
          <li key={i} className="flex gap-3 text-slate-700">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-launch" />
            {href ? <A href={href} className={`${linkCls} underline`}>{text}</A> : text}
          </li>
        );
      })}
    </ul>
  );
}

/** Section background (white, grey "cloud", dark "navy") and vertical spacing (field `spacing`: normal, large, top). */
export function Band({ bg, f, children }: { bg: string; f?: Fields; children: ReactNode }) {
  const sp = f ? str(f, "spacing") : "";
  const pad = sp === "large" ? "py-20 md:py-28" : sp === "top" ? "pt-20 md:pt-28" : "py-14 md:py-20";
  const inner = <div className={`mx-auto max-w-[1200px] px-5 md:px-8 ${pad}`}>{children}</div>;
  if (bg === "cloud") return <section className="bg-cloud">{inner}</section>;
  if (bg === "navy") return <section className="bg-navy text-white">{inner}</section>;
  return <section>{inner}</section>;
}

export function Head({ f, light = false, center = false }: { f: Fields; light?: boolean; center?: boolean }) {
  const eyebrow = str(f, "eyebrow"), heading = str(f, "heading"), short = str(f, "headingShort"), intro = str(f, "intro");
  const big = str(f, "headingSize") === "large";
  return (
    <div className={center ? "text-center" : undefined}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      {heading && (
        <h2 className={`${eyebrow ? "mt-3 " : ""}text-3xl font-extrabold tracking-tight ${big ? "md:text-5xl" : "md:text-4xl"}`}>
          {short ? <><span className="md:hidden">{short}</span><span className="hidden md:inline">{heading}</span></> : heading}
        </h2>
      )}
      {intro && <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${light ? "text-slate-300" : "text-slate-600"} ${center ? "mx-auto" : ""} ${str(f, "hideIntroOnMobile") === "true" || f.hideIntroOnMobile === true ? "hidden md:block" : ""}`}>{intro}</p>}
    </div>
  );
}
export const hasHead = (f: Fields) => Boolean(str(f, "eyebrow") || str(f, "heading") || str(f, "intro"));

export const Anchor = ({ id, children }: { id?: string; children: ReactNode }) => (id ? <div id={id} className="scroll-mt-20">{children}</div> : <>{children}</>);
