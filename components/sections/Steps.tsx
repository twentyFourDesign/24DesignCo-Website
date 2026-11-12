import type { Fields } from "@/lib/cms/sections";
import { Band, Head, bool, list, str } from "./helpers";

const COLS: Record<number, string> = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };

export default function Steps({ f }: { f: Fields }) {
  const bg = str(f, "background", "navy");
  const items = list(f, "items").filter((i) => str(i, "title"));
  const dark = bg === "navy";
  return (
    <Band f={f} bg={bg}>
      <Head f={f} light={dark} />
      <ol className={`mt-10 grid gap-8 ${COLS[Math.min(items.length, 4)] ?? "md:grid-cols-4"}`}>
        {items.map((s, i) => (
          <li key={i}>
            <span className={`font-display grid h-14 w-14 place-items-center rounded-full text-xl font-bold ${bool(f, "accentLast", true) && i === items.length - 1 && items.length > 1 ? "bg-launch text-navy" : "bg-signal text-white"}`}>{i + 1}</span>
            <h3 className="mt-5 text-lg font-bold">{str(s, "title")}</h3>
            <p className={`mt-2 ${dark ? "text-slate-300" : "text-slate-600"}`}>{str(s, "text")}</p>
          </li>
        ))}
      </ol>
    </Band>
  );
}
