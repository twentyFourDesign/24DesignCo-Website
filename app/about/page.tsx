import type { Metadata } from "next";
import { CtaBand, Eyebrow, H2, PageHero, Placeholder, Section } from "@/components/ui";

export const metadata: Metadata = { title: "About | 24 Design Co." };

const beliefs = [
  ["Clarity before code", "A clear scope saves more than clever engineering."],
  ["Launch small, learn fast", "The first version should prove your idea."],
  ["Honest estimates", "What it costs, how long, and what we would cut."],
  ["We stay", "Launch is the start of the work."],
];
const team = [["[Your name]", "CEO and CTO partner"], ["[Name]", "[Role]"], ["[Name]", "[Role]"]];

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="About" title="We help founders turn ideas into products, and stay on as their technical team.">
        Building software in Lagos since [year].
      </PageHero>
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <H2>Our story</H2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">Products succeed when a technical partner is involved from the idea stage, not only at the coding stage. So that is how we work: we help you decide what to build, build the first version, and stay with you as it grows.</p>
            <p className="mt-5 text-lg leading-relaxed"><strong>Mission:</strong> to help founders turn ideas into products people use, and to stay on as their technical partner.</p>
          </div>
          <Placeholder label="[Team photo]" className="aspect-[4/3]" />
        </div>
      </Section>
      <section className="bg-cloud"><Section>
        <H2>What we believe</H2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {beliefs.map(([t, d], i) => (
            <div key={t} className="rounded-2xl bg-white p-7"><p className="font-display text-2xl font-extrabold text-launch">0{i + 1}</p>
              <h3 className="mt-3 text-lg font-bold">{t}</h3><p className="mt-2 text-slate-600">{d}</p></div>
          ))}
        </div>
      </Section></section>
      <Section>
        <H2>Meet the team</H2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {team.map(([n, r], i) => (
            <div key={i}><Placeholder label="[Photo]" className="aspect-square" />
              <h3 className="mt-4 text-lg font-bold">{n}</h3><Eyebrow>{r}</Eyebrow></div>
          ))}
        </div>
      </Section>
      <CtaBand />
    </main>
  );
}
