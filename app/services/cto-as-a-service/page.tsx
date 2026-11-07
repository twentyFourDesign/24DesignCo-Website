import type { Metadata } from "next";
import { Card, Check, CtaBand, Eyebrow, H2, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = { title: "CTO as a Service | 24 Design Co." };

const plans = [
  ["Maintain", "Hosting oversight, security updates, bug fixes, monitoring, monthly check-in."],
  ["Grow", "Everything in Maintain, plus [X] development hours and roadmap planning."],
  ["Lead", "Everything in Grow, plus senior engineering time and hiring support."],
];

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="CTO as a Service" title="Senior technical leadership without the full-time salary">
        A technical partner who owns the technology side of your business, so you can focus on customers and growth.
      </PageHero>
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><Eyebrow>What your CTO partner does</Eyebrow><h3 className="mt-3 text-2xl font-bold">Every month</h3>
            <Check items={["Plans your roadmap", "Oversees engineering", "Keeps your product secure and online", "Advises on hiring and vendors", "Prepares you for investor due diligence"]} /></Card>
          <Card><Eyebrow>Who it is for</Eyebrow><h3 className="mt-3 text-2xl font-bold">Founders who</h3>
            <Check items={["Need someone to make technical decisions with them", "Have a launched product that needs oversight", "Want to manage developers with confidence"]} /></Card>
        </div>
      </Section>
      <section className="bg-cloud"><Section>
        <H2>Plans</H2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map(([k, d]) => (
            <div key={k} className="rounded-2xl bg-white p-7"><p className="text-xs font-bold uppercase tracking-wider text-signal">{k}</p>
              <h3 className="mt-2 text-2xl font-bold">[price] a month</h3><p className="mt-3 text-slate-600">{d}</p></div>
          ))}
        </div>
        <p className="mt-8 text-slate-600">[6 or 12] month minimum. [60 to 90] days notice to end.</p>
      </Section></section>
      <CtaBand />
    </main>
  );
}
