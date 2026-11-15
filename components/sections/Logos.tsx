import type { Fields } from "@/lib/cms/sections";
import { A, Band, Head, hasHead, list, str } from "./helpers";

export default function Logos({ f }: { f: Fields }) {
  const items = list(f, "items").filter((i) => str(i, "name") || str(i, "logo"));
  return (
    <Band f={f} bg={str(f, "background", "white")}>
      <Head f={f} />
      <ul className={`${hasHead(f) ? "mt-10 " : ""}grid grid-cols-2 gap-5 md:grid-cols-4`}>
        {items.map((l, i) => {
          const inner = str(l, "logo")
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={str(l, "logo")} alt={str(l, "name")} className="mx-auto max-h-16 w-auto" />
            : <span className="text-lg font-bold">{str(l, "name")}</span>;
          return <li key={i} className="grid place-items-center rounded-2xl border border-slate-200 bg-white p-6 text-center">{str(l, "link") ? <A href={str(l, "link")}>{inner}</A> : inner}</li>;
        })}
      </ul>
    </Band>
  );
}
