import type { Fields } from "@/lib/cms/sections";
import type { Project } from "@/lib/cms/projects";
import { A, Band, Bullets, Head, hasHead, str } from "./helpers";
import Link from "next/link";
import { Eyebrow } from "./primitives";

const COLS: Record<string, string> = { "2": "md:grid-cols-2", "3": "md:grid-cols-3", "4": "md:grid-cols-2 lg:grid-cols-4" };

export function pick(projects: Project[], show: string) {
  return projects.filter((p) => (show === "featured" ? p.featured : show === "case-study" || show === "partnership" ? p.type === show : true));
}

export default function Projects({ f, projects }: { f: Fields; projects: Project[] }) {
  const bg = str(f, "background", "white");
  const items = pick(projects, str(f, "show", "featured"));
  const mobile = str(f, "mobileCount", "3");
  const mobileN = mobile === "all" ? 99 : Number(mobile) || 3;
  const head = hasHead(f);
  if (str(f, "layout") === "partners") {
    return (
      <Band f={f} bg={bg}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            {str(f, "eyebrow") && <Eyebrow>{str(f, "eyebrow")}</Eyebrow>}
            {str(f, "heading") && <h2 className={`${str(f, "eyebrow") ? "mt-3 " : ""}text-3xl font-extrabold tracking-tight md:text-4xl`}>{str(f, "heading")}</h2>}
            {str(f, "intro") && <p className="mt-4 max-w-xl text-lg text-slate-600">{str(f, "intro")}</p>}
          </div>
          {str(f, "linkText") && <A href={str(f, "linkUrl", "/")} className="font-semibold text-signal">{str(f, "linkText")}</A>}
        </div>
        <div className={`${head || str(f, "linkText") ? "mt-10 " : ""}grid gap-8 md:grid-cols-2`}>
          {items.map((p) => (
            <article key={p.slug} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {(p.logo || p.coverImage) && <img src={p.logo || p.coverImage} alt={`${p.name} logo`} className="h-auto w-full" />}
              <div className="p-7 md:p-8">
                {p.tag && <p className="mt-5 text-xs font-bold uppercase tracking-wide text-signal">{p.tag}</p>}
                <h3 className="mt-1 text-2xl font-bold">{p.name}</h3>
                <p className="mt-2 text-slate-600">{p.summary}</p>
                <Bullets items={p.services ?? []} />
                {(p.stats?.length ?? 0) > 0 && (
                  <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6">
                    {p.stats.map((s) => <div key={s.label}><dt className="sr-only">{s.label}</dt><dd className="font-display text-2xl font-extrabold">{s.value}</dd><p className="text-sm text-slate-600">{s.label}</p></div>)}
                  </dl>
                )}
                <div className="mt-6 flex justify-end"><Link href={`/our-work/${p.slug}`} className="text-base font-semibold text-signal">Read the story →</Link></div>
              </div>
            </article>
          ))}
        </div>
      </Band>
    );
  }
  return (
    <Band f={f} bg={bg}>
      <Head f={f} />
      <div className={`${head ? "mt-10 " : ""}grid gap-8 ${COLS[str(f, "columns", "3")] ?? COLS["3"]}`}>
        {items.map((p, i) => (
          <Link key={p.slug} href={`/our-work/${p.slug}`} className={`group ${i >= mobileN ? "hidden md:block" : ""}`}>
            <div className="flex aspect-[16/10] items-center justify-center gap-3 overflow-hidden rounded-2xl bg-navy p-4 md:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.coverImage && <img src={p.coverImage} alt={`${p.name} screenshot`} className="max-h-full w-auto max-w-full rounded-lg shadow-lg" />}
            </div>
            {p.tag && <p className="mt-5 text-xs font-bold uppercase tracking-wide text-signal">{p.tag}</p>}
            <h3 className="mt-1 text-xl font-bold group-hover:text-signal">{p.name}</h3>
            <p className="mt-2 leading-relaxed text-slate-600">{p.summary}</p>
          </Link>
        ))}
      </div>
    </Band>
  );
}
