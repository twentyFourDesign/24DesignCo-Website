import Link from "next/link";
import { Card, CtaBand, Eyebrow, H2, Placeholder, Section } from "@/components/ui";

export type CaseStudyData = {
  name: string;
  eyebrow: string;
  title: string;
  url?: string;
  hero?: string;
  intro: string;
  meta: [string, string][];
  stats: [string, string][]; // [value, label]
  idea: { title: string; paras: string[]; brief: string; who: string };
  challenge: { title: string; items: [string, string][] };
  stages: { no: string; name: string; title: string; points: string[] }[];
  look: { title: string; body: string; tagline?: string; swatches: [string, string, string?][]; fonts?: [string, string][] };
  design: { eyebrow: string; title: string; body: string; steps?: [string, string, string][]; features: { eyebrow: string; title: string; body: string[]; shot: string }[] };
  extra?: { eyebrow: string; title: string; body: string[]; shots: (string | [string, string])[] };
  run: { title: string; paras: string[]; liveTitle?: string; liveBody?: string; stack: string[]; note?: { label: string; text: string } };
  resultTitle: string;
  results: [string, string, string][]; // [label, value, description]
  quote: string;
  quoteBy: string;
  next: { title: string; href: string };
};

export default function CaseStudy({ d }: { d: CaseStudyData }) {
  return (
    <main>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-8 md:px-8 md:pb-24">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link> › <Link href="/our-work" className="hover:text-white">Our Work</Link> › <span className="font-semibold text-white">{d.name}</span>
          </nav>
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow light>{d.eyebrow}</Eyebrow>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">{d.title}</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">{d.intro}</p>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                {d.meta.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">{k}</dt>
                    <dd className="mt-1 font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {d.hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.hero} alt={`${d.name} screenshot`} className="h-auto w-full rounded-xl shadow-2xl shadow-black/40" />
            ) : (
              <Placeholder label={`[${d.name} hero screenshot]`} className="aspect-[16/10]" />
            )}
          </div>
        </div>
      </section>

      <Section className="pb-0 md:pb-0">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {d.stats.map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-4xl font-extrabold md:text-5xl">{v}</p>
              <p className="mt-2 text-slate-600">{l}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <Eyebrow>The idea</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{d.idea.title}</h2>
            {d.idea.paras.map((p) => <p key={p} className="mt-5 text-lg leading-relaxed text-slate-600">{p}</p>)}
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-navy p-7 text-white">
              <Eyebrow light>The brief in one line</Eyebrow>
              <p className="font-display mt-3 text-xl font-bold leading-snug">{d.idea.brief}</p>
            </div>
            <Card className="bg-cloud">
              <Eyebrow>Who it is for</Eyebrow>
              <p className="mt-3 text-slate-600">{d.idea.who}</p>
            </Card>
          </div>
        </div>
      </Section>

      <section className="bg-cloud">
        <Section>
          <Eyebrow>The challenge</Eyebrow>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl">{d.challenge.title}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {d.challenge.items.map(([t, b], i) => (
              <div key={t} className="rounded-2xl bg-white p-7">
                <span className="font-display text-sm font-bold text-launch">0{i + 1}</span>
                <h3 className="mt-2 text-xl font-bold">{t}</h3>
                <p className="mt-2 text-slate-600">{b}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Section>
        <Eyebrow>How we did it</Eyebrow>
        <H2>From idea to launch in five stages</H2>
        <ol className="mt-10 grid gap-4 md:grid-cols-5">
          {d.stages.map((s) => (
            <li key={s.no} className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">{s.no} · {s.name}</p>
              <h3 className="mt-2 text-lg font-bold leading-snug">{s.title}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {s.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <section className="bg-cloud">
        <Section>
          <Eyebrow>Stage 02 · {d.look.title.startsWith("Roots") ? "Brand identity" : "Look and feel"}</Eyebrow>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl">{d.look.title}</h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">{d.look.body}</p>
          {d.look.tagline && <p className="font-display mt-6 text-2xl font-bold">{d.look.tagline}</p>}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {d.look.swatches.map(([n, hex, note]) => (
              <div key={n} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="h-24" style={{ backgroundColor: hex }} />
                <div className="p-4">
                  <p className="font-bold">{n}</p>
                  <p className="text-sm text-slate-600">{hex}{note ? ` · ${note}` : ""}</p>
                </div>
              </div>
            ))}
          </div>
          {d.look.fonts && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {d.look.fonts.map(([f, sample]) => (
                <Card key={f} className="bg-white"><Eyebrow>{f}</Eyebrow><p className="font-display mt-2 text-2xl font-bold">{sample}</p></Card>
              ))}
            </div>
          )}
        </Section>
      </section>

      <Section>
        <Eyebrow>{d.design.eyebrow}</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{d.design.title}</h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">{d.design.body}</p>
        {d.design.steps && (
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {d.design.steps.map(([n, t, b]) => (
              <li key={n} className="rounded-2xl bg-cloud p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">{n}</p>
                <h3 className="mt-1 font-bold">{t}</h3>
                <p className="mt-1 text-sm text-slate-600">{b}</p>
              </li>
            ))}
          </ol>
        )}
        <div className="mt-16 space-y-16">
          {d.design.features.map((f, i) => (
            <div key={f.title} className="grid items-center gap-10 lg:grid-cols-2">
              <div className={i % 2 ? "lg:order-2" : ""}>
                <Eyebrow>{f.eyebrow}</Eyebrow>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{f.title}</h3>
                {f.body.map((p) => <p key={p} className="mt-4 text-lg leading-relaxed text-slate-600">{p}</p>)}
              </div>
              <Placeholder label={f.shot} className="aspect-[4/3]" />
            </div>
          ))}
        </div>
      </Section>

      {d.extra && (
        <section className="bg-cloud">
          <Section>
            <Eyebrow>{d.extra.eyebrow}</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{d.extra.title}</h2>
            {d.extra.body.map((p) => <p key={p} className="mt-4 max-w-2xl text-lg text-slate-600">{p}</p>)}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {d.extra.shots.map((s, i) => typeof s === "string" ? (
                <Placeholder key={s} label={s} className="aspect-[16/10] bg-white" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={s[1]} src={s[1]} alt={s[0]} className={`h-auto w-full rounded-xl shadow-lg ${i === 0 && d.extra!.shots.length === 3 ? "md:col-span-2" : ""}`} />
              ))}
            </div>
          </Section>
        </section>
      )}

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Eyebrow>Stages 04 and 05 · {d.name === "Nexuss" ? "Build and launch" : "Launch and run"}</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{d.run.title}</h2>
            {d.run.paras.map((p) => <p key={p} className="mt-5 text-lg leading-relaxed text-slate-600">{p}</p>)}
            <ul className="mt-6 flex flex-wrap gap-2">
              {d.run.stack.map((s) => <li key={s} className="rounded-full bg-cloud px-4 py-1.5 text-sm font-semibold">{s}</li>)}
            </ul>
          </div>
          <div className="space-y-4">
            {d.run.liveTitle && (
              <div className="rounded-2xl bg-navy p-7 text-white">
                <Eyebrow light>{d.url ? "Live at" : "Launch"}</Eyebrow>
                <p className="font-display mt-2 text-xl font-bold">{d.run.liveTitle}</p>
                {d.run.liveBody && <p className="mt-2 text-slate-300">{d.run.liveBody}</p>}
              </div>
            )}
            {d.run.note && (
              <Card className="bg-cloud"><Eyebrow>{d.run.note.label}</Eyebrow><p className="mt-3 text-slate-600">{d.run.note.text}</p></Card>
            )}
          </div>
        </div>
      </Section>

      <section className="bg-cloud">
        <Section>
          <Eyebrow>The result</Eyebrow>
          <H2>{d.resultTitle}</H2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {d.results.map(([l, v, t]) => (
              <div key={l} className="rounded-2xl bg-white p-6">
                <Eyebrow>{l}</Eyebrow>
                <p className="font-display mt-2 text-4xl font-extrabold">{v}</p>
                <p className="mt-1 text-slate-600">{t}</p>
              </div>
            ))}
          </div>
          <blockquote className="font-display mt-14 border-l-4 border-launch pl-6 text-2xl font-bold">
            “{d.quote}”
            <span className="block pt-3 text-base font-normal text-slate-600">{d.quoteBy}</span>
          </blockquote>
        </Section>
      </section>

      <Section>
        <Link href={d.next.href} className="group flex flex-col gap-3 rounded-2xl border border-slate-200 p-8 transition hover:border-signal md:flex-row md:items-center md:justify-between">
          <div>
            <Eyebrow>Next case study</Eyebrow>
            <p className="font-display mt-2 text-2xl font-bold group-hover:text-signal">{d.next.title}</p>
          </div>
          <span className="font-semibold text-signal">Read the case study →</span>
        </Link>
      </Section>
      <CtaBand />
    </main>
  );
}
