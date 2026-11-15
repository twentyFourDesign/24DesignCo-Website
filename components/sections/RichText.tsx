import type { Fields } from "@/lib/cms/sections";
import { Band, Head, Inline, paragraphs, str } from "./helpers";

export default function RichText({ f }: { f: Fields }) {
  const bg = str(f, "background", "white");
  const center = str(f, "align") === "center";
  return (
    <Band f={f} bg={bg}>
      <div className={center ? "mx-auto max-w-3xl" : "max-w-3xl"}>
        <Head f={{ ...f, intro: "" }} light={bg === "navy"} center={center} />
        {paragraphs(str(f, "body")).map((p, i) => <p key={i} className={`mt-5 text-lg leading-relaxed ${center ? "text-center" : ""} ${bg === "navy" ? "text-slate-300" : "text-slate-600"}`}><Inline text={p} /></p>)}
      </div>
    </Band>
  );
}
