import type { Metadata } from "next";
import { Card, Check, CtaBand, Eyebrow, H2, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Discovery Sprint | 24 Design Co." };

const how = [["Days 1 to 2", "Workshop", "Users, problem and priorities."], ["Days 3 to 7", "Design", "User journeys and the prototype."], ["Week 2", "Plan and quote", "Scope, approach and fixed quote, presented to you."]];

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="Discovery Sprint" title="Turn your idea into a clear plan">
        In one to two weeks, we shape your idea into a scoped, costed plan you can build with us, fund, or hand to any team.
      </PageHero>
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card><Eyebrow>What you get</Eyebrow><h3 className="mt-3 text-2xl font-bold">Deliverables</h3>
            <Check items={["Founder workshop", "User flows and clickable prototype", "Prioritized feature list", "Technical approach in plain language", "Timeline and fixed quote"]} /></Card>
          <Card><Eyebrow>Who it is for</Eyebrow><h3 className="mt-3 text-2xl font-bold">Founders who</h3>
            <Check items={["Have an idea but no clear scope", "Need a prototype for investors", "Have quotes they cannot compare"]} /></Card>
          <Card className="bg-cloud"><Eyebrow>Price</Eyebrow><h3 className="mt-3 text-2xl font-bold">Starting from [price]</h3>
            <p className="mt-4 text-slate-600">Credited toward your build if you sign within [30] days.</p></Card>
        </div>
      </Section>
      <section className="bg-cloud"><Section>
        <H2>How it works</H2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {how.map(([k, t, d]) => (
            <div key={t} className="rounded-2xl bg-white p-7"><p className="text-xs font-bold uppercase tracking-wider text-signal">{k}</p>
              <h3 className="mt-2 text-xl font-bold">{t}</h3><p className="mt-2 text-slate-600">{d}</p></div>
          ))}
        </div>
      </Section></section>
      <CtaBand />
    </main>
  );
}
