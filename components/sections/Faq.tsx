import type { Fields } from "@/lib/cms/sections";
import { Eyebrow, H2 } from "./primitives";
import { Band, Head, bool, list, str, strs } from "./helpers";

export default function Faq({ f }: { f: Fields }) {
  const bg = str(f, "background", "white");
  const items = list(f, "items").filter((i) => str(i, "question"));
  if (str(f, "layout") === "cards") {
    return (
      <Band f={f} bg={bg}>
        <Head f={f} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((q, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 p-7 md:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-signal">FAQ</p>
              <h3 className="mt-2 text-lg font-bold">{str(q, "question")}</h3>
              <p className="mt-3 text-slate-600">{str(q, "answer")}</p>
            </div>
          ))}
        </div>
      </Band>
    );
  }
  const tags = strs(f, "asideTags");
  const list_ = (
    <div>
      {str(f, "eyebrow") && <Eyebrow>{str(f, "eyebrow")}</Eyebrow>}
      {str(f, "heading") && <H2>{str(f, "heading")}</H2>}
      <div className="mt-8 divide-y divide-slate-200 border-b border-slate-200">
        {items.map((q, i) => (
          <details key={i} className="group py-4" open={bool(f, "openFirst", true) && i === 0}>
            <summary className="cursor-pointer list-none text-lg font-bold marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="mr-3 inline-block text-xs transition group-open:rotate-90">▶</span>{str(q, "question")}
            </summary>
            <p className="mt-3 pl-7 leading-relaxed text-slate-600">{str(q, "answer")}</p>
          </details>
        ))}
      </div>
    </div>
  );
  return (
    <Band f={f} bg={bg}>
      {tags.length ? (
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            {str(f, "asideEyebrow") && <Eyebrow>{str(f, "asideEyebrow")}</Eyebrow>}
            {str(f, "asideHeading") && <H2>{str(f, "asideHeading")}</H2>}
            <ul className="mt-8 flex flex-wrap gap-3">{tags.map((t) => <li key={t} className="rounded-full bg-cloud px-5 py-2.5 font-semibold">{t}</li>)}</ul>
          </div>
          {list_}
        </div>
      ) : <div className="max-w-3xl">{list_}</div>}
    </Band>
  );
}
