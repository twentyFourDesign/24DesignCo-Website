import type { Fields } from "@/lib/cms/sections";
import { Eyebrow } from "./primitives";
import { A, Band, Bullets, Inline, linkCls, paragraphs, str, strs } from "./helpers";
import { FeatureRow } from "./Cards";

export default function ImageText({ f }: { f: Fields }) {
  const bg = str(f, "background", "white"), image = str(f, "image"), left = str(f, "imagePosition") === "left";
  if (str(f, "variant") === "feature") {
    return (
      <Band f={f} bg={bg}>
        <FeatureRow img={image} imgAlt={str(f, "imageAlt")} icon={str(f, "icon")} tag={str(f, "tag") || str(f, "eyebrow")} time={str(f, "time")} title={str(f, "heading")} text={str(f, "body")} bullets={strs(f, "bullets")} bulletsTitle={str(f, "bulletsTitle") || "What you get"} href={str(f, "link")} linkText={str(f, "linkText")} flip={left} />
      </Band>
    );
  }
  const chips = strs(f, "chips");
  const dark = bg === "navy";
  return (
    <Band f={f} bg={bg}>
      <div className={`grid items-center ${!image && chips.length ? "gap-10" : "gap-12"} lg:grid-cols-2`}>
        <div className={left && image ? "lg:order-2" : ""}>
          {str(f, "eyebrow") && <Eyebrow light={dark}>{str(f, "eyebrow")}</Eyebrow>}
          {str(f, "heading") && <h2 className={`${str(f, "eyebrow") ? "mt-3 " : ""}text-3xl font-extrabold tracking-tight md:text-4xl`}>{str(f, "heading")}</h2>}
          {paragraphs(str(f, "body")).map((p, i) => <p key={i} className={`mt-5 text-lg leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}><Inline text={p} /></p>)}
          <Bullets items={strs(f, "bullets")} />
          {str(f, "link") && <A href={str(f, "link")} className={`${linkCls} mt-5 inline-block`}>{str(f, "linkText") || "Learn more →"}</A>}
        </div>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={str(f, "imageAlt")} className="h-auto w-full rounded-3xl" />
        ) : chips.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">{chips.map((c) => <li key={c} className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-lg font-bold text-navy">{c}</li>)}</ul>
        ) : null}
      </div>
    </Band>
  );
}
