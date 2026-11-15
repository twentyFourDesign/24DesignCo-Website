import type { Fields } from "@/lib/cms/sections";
import { A, str } from "./helpers";

export default function Cta({ f }: { f: Fields }) {
  const btn = str(f, "buttonText"), href = str(f, "buttonLink", "/contact");
  if (str(f, "style") === "band") {
    return (
      <section className="bg-signal text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center md:px-8 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{str(f, "heading")}</h2>
            {str(f, "text") && <p className="mt-4 text-lg text-blue-50">{str(f, "text")}</p>}
          </div>
          {btn && <A href={href} className="shrink-0 rounded-lg bg-white px-7 py-4 font-semibold text-signal transition hover:bg-blue-50">{btn}</A>}
        </div>
      </section>
    );
  }
  return (
    <section className="bg-navy text-center text-white">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-24">
        {str(f, "eyebrow") && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">{str(f, "eyebrow")}</p>}
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">{str(f, "heading")}</h2>
        {str(f, "text") && <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300">{str(f, "text")}</p>}
        {btn && <A href={href} className="mt-9 inline-block rounded-lg bg-signal px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-blue-700">{btn}</A>}
        {str(f, "note") && <p className="mt-5 text-sm text-slate-300">{str(f, "note")}</p>}
      </div>
    </section>
  );
}
