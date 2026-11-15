import type { Fields } from "@/lib/cms/sections";
import { Eyebrow, Card } from "./primitives";
import { A, Band, Bullets, Head, Icon, hasHead, linkCls, list, str, strs } from "./helpers";

type Item = Record<string, unknown>;
const TITLE: Record<string, string> = { lg: "text-lg", xl: "text-xl", "2xl": "text-2xl" };
const Both = ({ long, short, className = "" }: { long: string; short: string; className?: string }) =>
  short ? <p className={className}><span className="md:hidden">{short}</span><span className="hidden md:inline">{long}</span></p> : <p className={className}>{long}</p>;

function grid(cols: string, variant: string) {
  const gap = ["icon", "iconTop", "numbered"].includes(variant) ? "gap-5" : "gap-6";
  const c =
    cols === "1" ? ""
    : cols === "2" ? "md:grid-cols-2"
    : cols === "4" ? (variant === "bordered" ? "md:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4")
    : ["detail", "image"].includes(variant) ? "lg:grid-cols-3" : variant === "icon" ? "md:grid-cols-2 lg:grid-cols-3" : variant === "iconTop" ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-3";
  return `grid ${gap} ${c}`;
}

export function FeatureRow({ img, imgAlt, icon, tag, time, title, text, bullets, bulletsTitle = "What you get", href, linkText, flip }: { img: string; imgAlt: string; icon: string; tag: string; time: string; title: string; text: string; bullets: string[]; bulletsTitle?: string; href: string; linkText: string; flip: boolean }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {img && <img src={img} alt={imgAlt} className={`h-auto w-full rounded-3xl ${flip ? "lg:order-2" : ""}`} />}
      <div>
        {(icon || tag || time) && (
          <div className="flex items-center gap-4">
            {icon && <Icon name={icon} />}
            <div>
              {tag && <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">{tag}</p>}
              {time && <span className="mt-1 inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold">{time}</span>}
            </div>
          </div>
        )}
        <h3 className="mt-5 text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h3>
        {text && <p className="mt-4 text-lg leading-relaxed text-slate-600">{text}</p>}
        {bullets.length > 0 && <><p className="mt-6 font-bold">{bulletsTitle}</p><Bullets items={bullets} gap="space-y-2.5" className="mt-3" /></>}
        {href && <A href={href} className={`${linkCls} mt-6 inline-block`}>{linkText || "Learn more →"}</A>}
      </div>
    </div>
  );
}

function CardItem({ it, i, variant, bg, tSize, row }: { it: Item; i: number; variant: string; bg: string; tSize: string; row: boolean }) {
  const label = str(it, "label"), title = str(it, "title"), text = str(it, "text"), bullets = strs(it, "bullets"), link = str(it, "link");
  switch (variant) {
    case "tinted":
      return (
        <div className="rounded-2xl bg-white p-7">
          {label && <p className="text-xs font-bold uppercase tracking-wider text-signal">{label}</p>}
          <h3 className={`mt-2 ${TITLE[tSize] ?? "text-xl"} font-bold`}>{title}</h3>
          {text && <p className={`${tSize === "xl" ? "mt-2" : "mt-3"} text-slate-600`}>{text}</p>}
        </div>
      );
    case "detail": {
      const hi = it.highlight === true;
      const cls = hi ? "bg-cloud" : bg === "cloud" ? "bg-white" : "";
      const body = (
        <div>
          {label && <Eyebrow>{label}</Eyebrow>}
          <h3 className={`${label ? "mt-3" : ""} text-2xl font-bold`}>{title}</h3>
          <Bullets items={bullets} />
          {text && <p className={`${bullets.length ? "mt-5 text-slate-700" : label ? "mt-4 text-slate-600" : "mt-2 text-slate-600"}`}>{text}</p>}
        </div>
      );
      const more = link ? <A href={link} className={linkCls}>{str(it, "linkText") || "Read more →"}</A> : null;
      const inner = row ? <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">{body}{more}</div> : <>{body}{more && <div className="mt-5">{more}</div>}</>;
      return bg === "cloud" && !hi ? <div className={`rounded-2xl p-8 ${cls}`}>{inner}</div> : <Card className={cls}>{inner}</Card>;
    }
    case "image":
      return (
        <article className="overflow-hidden rounded-2xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {str(it, "image") && <img src={str(it, "image")} alt={str(it, "imageAlt")} className="h-auto w-full" />}
          <div className="p-7">
            {label && <Eyebrow>{label}</Eyebrow>}
            <h3 className="mt-2 text-xl font-bold">{title}</h3>
            {text && <p className="mt-2 leading-relaxed text-slate-600">{text}</p>}
            <Bullets items={bullets} gap="space-y-2.5" />
          </div>
        </article>
      );
    case "icon":
      return (
        <div className="flex gap-5 rounded-2xl border border-slate-200 p-6">
          <Icon name={str(it, "icon")} />
          <div>
            <h3 className="font-bold">{link ? <A href={link} className={`${linkCls} underline`}>{title}</A> : title}</h3>
            <p className="mt-1.5 text-slate-600">{text}</p>
          </div>
        </div>
      );
    case "iconTop":
      return (
        <div className="rounded-2xl bg-white p-7">
          <Icon name={str(it, "icon")} tone="gold" />
          <h3 className="mt-5 text-lg font-bold">{title}</h3>
          <p className="mt-2 text-slate-600">{text}</p>
        </div>
      );
    case "numbered":
      return (
        <div className="rounded-2xl border border-slate-200 p-7">
          <p className="text-sm font-bold tracking-widest text-signal">{String(i + 1).padStart(2, "0")}</p>
          <h3 className="mt-3 text-lg font-bold">{title}</h3>
          <p className="mt-2 text-slate-600">{text}</p>
        </div>
      );
    default:
      return (
        <article className="rounded-2xl border border-slate-200 p-7 md:p-8">
          {str(it, "image") && (
            // SVG logos sit centred on a light tile; a photo or JPG logo (often on its own background) fills the tile.
            /\.svg($|\?)/i.test(str(it, "image")) ? (
              <div className="mb-6 flex h-28 items-center justify-center rounded-xl bg-cloud p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={str(it, "image")} alt={str(it, "imageAlt") || `${title} logo`} className="max-h-full max-w-[70%] object-contain" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={str(it, "image")} alt={str(it, "imageAlt") || `${title} logo`} className="mb-6 h-28 w-full rounded-xl object-cover" />
            )
          )}
          {label && <p className="text-sm font-bold uppercase tracking-wider text-signal">{label}</p>}
          <h3 className="mt-2 text-xl font-bold">{title}</h3>
          {(text || str(it, "textShort")) && <Both long={text} short={str(it, "textShort")} className="mt-3 leading-relaxed text-slate-600" />}
        </article>
      );
  }
}

export default function Cards({ f }: { f: Fields }) {
  const bg = str(f, "background", "white"), variant = str(f, "variant", "bordered");
  const items = list(f, "items").filter((i) => str(i, "title") || str(i, "image"));
  const head = hasHead(f);
  return (
    <Band f={f} bg={bg}>
      <Head f={f} light={bg === "navy"} />
      {variant === "feature" ? (
        <div className={`${head ? "mt-12 " : ""}space-y-16 md:space-y-20`}>
          {items.map((it, i) => (
            <FeatureRow key={i} img={str(it, "image")} imgAlt={str(it, "imageAlt")} icon={str(it, "icon")} tag={str(it, "label")} time={str(it, "time")} title={str(it, "title")} text={str(it, "text")} bullets={strs(it, "bullets")} href={str(it, "link")} linkText={str(it, "linkText")} flip={i % 2 === 1} />
          ))}
        </div>
      ) : (
        <div className={`${head ? "mt-10 " : ""}${grid(str(f, "columns", "3"), variant)}`}>
          {items.map((it, i) => <CardItem key={i} it={it} i={i} variant={variant} bg={bg} tSize={str(f, "titleSize", "xl")} row={str(f, "columns") === "1"} />)}
        </div>
      )}
      {str(f, "footnote") && <p className="mt-8 text-slate-600">{str(f, "footnote")}</p>}
    </Band>
  );
}
