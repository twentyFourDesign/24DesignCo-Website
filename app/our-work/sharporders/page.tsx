import type { Metadata } from "next";
import { Card, CtaBand, Eyebrow, PageHero, Placeholder, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Sharporders case study | 24 Design Co." };

const stats = [["Result", "[X] weeks", "Idea to launch"], ["Users", "[N]", "In the first [period]"], ["Live", "Both stores", "iOS and Android"]];
const blocks = [
  ["The idea", "What the founder wanted", "[Who it is for, and why.]"],
  ["The challenge", "What made it hard", "[Budget, time, complexity.]"],
  ["What we did", "In plain language", "[Discovery, design, build, launch.]"],
  ["The result", "What changed", "[Two or more numbers.]"],
];

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="Case study · Mobile app" title="Sharporders: from idea to App Store and Google Play launch in [X] weeks">
        Services: Discovery, MVP build, launch.
      </PageHero>
      <Section className="pb-0 md:pb-0">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(([k, v, d]) => (
            <Card key={k} className="bg-cloud"><Eyebrow>{k}</Eyebrow><p className="font-display mt-2 text-3xl font-extrabold">{v}</p><p className="mt-1 text-slate-600">{d}</p></Card>
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          {blocks.map(([k, t, d]) => (
            <div key={k}><Eyebrow>{k}</Eyebrow><h2 className="mt-2 text-2xl font-bold">{t}</h2><p className="mt-3 text-lg text-slate-600">{d}</p></div>
          ))}
        </div>
        <Placeholder label="[Product screenshots]" className="mt-14 aspect-[16/7]" />
        <blockquote className="font-display mt-14 border-l-4 border-launch pl-6 text-2xl font-bold">
          “[Quote from the founder.]” <span className="block pt-3 text-base font-normal text-slate-600">— [Name, role]</span>
        </blockquote>
      </Section>
      <CtaBand />
    </main>
  );
}
