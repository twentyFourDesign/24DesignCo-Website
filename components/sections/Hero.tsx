import { Eyebrow } from "./primitives";
import type { Fields } from "@/lib/cms/sections";
import { A, list, str, bool } from "./helpers";

export default function Hero({ f }: { f: Fields }) {
  const image = str(f, "image");
  const panel = list(f, "panelItems").filter((p) => str(p, "title"));
  const hasPanel = panel.length > 0 || !!str(f, "panelTitle");
  const split = !!image || hasPanel;
  const pad = hasPanel ? "pb-20 pt-16 md:pb-28 md:pt-24" : image ? "pb-16 pt-14 md:pb-20 md:pt-20" : "pb-16 pt-14 md:pb-24 md:pt-20";
  const h1 = hasPanel ? "text-4xl sm:text-5xl lg:text-[64px]" : "text-4xl md:text-6xl";
  const short = str(f, "eyebrowShort"), eyebrow = str(f, "eyebrow");
  const pText = str(f, "primaryButtonText"), sText = str(f, "secondaryButtonText");
  const accent = bool(f, "accentLast", true);
  return (
    <section className="bg-navy text-white">
      <div className={`mx-auto max-w-[1200px] px-5 md:px-8 ${pad} ${split ? `grid items-center ${hasPanel ? "gap-12" : "gap-10"} lg:grid-cols-2` : ""}`}>
        <div>
          {eyebrow && (short ? <Eyebrow light><span className="md:hidden">{short}</span><span className="hidden md:inline">{eyebrow}</span></Eyebrow> : <Eyebrow light>{eyebrow}</Eyebrow>)}
          <h1 className={`mt-5 font-extrabold leading-[1.1] tracking-tight ${h1} ${split ? "" : "max-w-3xl"}`}>{str(f, "heading")}</h1>
          {str(f, "text") && <p className={`${hasPanel ? "mt-7" : "mt-6"} ${split ? "max-w-xl" : "max-w-2xl"} text-lg leading-relaxed text-slate-300`}>{str(f, "text")}</p>}
          {(pText || sText) && (
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              {pText && <A href={str(f, "primaryButtonLink", "/contact")} className="inline-block rounded-lg bg-signal px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-blue-700">{pText}</A>}
              {sText && <A href={str(f, "secondaryButtonLink", "/")} className="inline-block rounded-lg border border-white/40 px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-white/10">{sText}</A>}
            </div>
          )}
          {str(f, "note") && <p className="mt-4 text-sm text-slate-300">{str(f, "note")}</p>}
        </div>
        {hasPanel && (
          <div className="hidden rounded-3xl bg-navy-2 p-8 lg:block">
            {str(f, "panelTitle") && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">{str(f, "panelTitle")}</p>}
            <ol className="mt-7 space-y-6">
              {panel.map((s, i) => {
                const gold = accent && i === panel.length - 1 && panel.length > 1;
                return (
                  <li key={i} className="flex items-center gap-5">
                    <span className={`font-display grid h-12 w-12 place-items-center rounded-full text-lg font-bold ${gold ? "bg-launch text-navy" : "bg-signal text-white"}`}>{i + 1}</span>
                    <div>
                      <p className="font-display text-lg font-semibold">{str(s, "title")}</p>
                      <p className="text-sm text-slate-300">{str(s, "text")}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        {!hasPanel && image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={str(f, "imageAlt")} className="mx-auto hidden w-full max-w-[520px] rounded-2xl lg:block" />
        )}
      </div>
    </section>
  );
}
