import type { Fields } from "@/lib/cms/sections";
import type { TeamMember } from "@/lib/cms/team";
import { Eyebrow } from "./primitives";
import { Band, Head, hasHead, list, paragraphs, str } from "./helpers";

export default function Team({ f, team }: { f: Fields; team: TeamMember[] }) {
  const bg = str(f, "background", "cloud");
  if (str(f, "show", "founder") === "all") {
    return (
      <Band f={f} bg={bg}>
        <Head f={f} />
        <div className={`${hasHead(f) ? "mt-10 " : ""}grid gap-8 sm:grid-cols-2 lg:grid-cols-3`}>
          {team.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {m.photo && <img src={m.photo} alt={m.photoAlt || m.name} className="h-auto w-full" />}
              <div className="p-6"><h3 className="text-xl font-bold">{m.name}</h3><p className="mt-1 font-semibold text-signal">{m.role}</p><p className="mt-3 text-slate-600">{m.shortBio}</p></div>
            </div>
          ))}
        </div>
      </Band>
    );
  }
  const m = team.find((t) => t.isFounder) ?? team[0];
  if (!m) return <Band f={f} bg={bg}><Head f={f} /><p className="text-slate-500">Add a founder under Team to show the profile here.</p></Band>;
  const facts = list(f, "facts").filter((x) => str(x, "value"));
  const quote = str(f, "quote");
  return (
    <Band f={f} bg={bg}>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {m.photo && <img src={m.photo} alt={m.photoAlt || m.name} className="mx-auto h-auto w-full max-w-sm rounded-3xl lg:max-w-none" />}
        <div>
          <Eyebrow>{str(f, "eyebrow", "Meet the founder")}</Eyebrow>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">{m.name}</h2>
          <p className="mt-2 font-semibold text-signal">{m.role}</p>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-slate-600">{paragraphs(m.bio || m.shortBio || "").map((p, i) => <p key={i}>{p}</p>)}</div>
          {m.links?.email && <a href={`mailto:${m.links.email}`} className="mt-6 inline-block rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold hover:border-signal hover:text-signal">{m.links.email}</a>}
          {quote && <blockquote className="mt-8 border-l-4 border-launch pl-5 text-xl font-bold leading-snug md:text-2xl">{quote}</blockquote>}
          {facts.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-slate-300 pt-8 sm:grid-cols-4">
              {facts.map((x, i) => <div key={i}><dt className="font-display text-xl font-extrabold">{str(x, "value")}</dt><dd className="mt-1 text-sm text-slate-600">{str(x, "label")}</dd></div>)}
            </dl>
          )}
        </div>
      </div>
    </Band>
  );
}
