import type { Metadata } from "next";
import { Card, Check, CtaBand, Eyebrow, H2, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = { title: "How We Work | 24 Design Co." };

const steps = [
  ["Free idea review", "30 minutes. We learn your idea, stage, budget and timeline."],
  ["Discovery Sprint", "1 to 2 weeks. Prototype, scope and a fixed quote."],
  ["MVP Build", "8 to 12 weeks. Design, build, test and launch, with a demo every two weeks."],
  ["CTO Partner", "Monthly. Ongoing leadership, maintenance and growth."],
];
const faqs = [
  ["Will you sign an NDA?", "Yes, before we discuss your idea in detail."],
  ["Can you work with my existing developers?", "Yes, where it makes sense."],
  ["What if I run out of budget?", "We plan in stages so you can stop at a clean point."],
];

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="How we work" title="How we take you from idea to launch">
        No surprises: what happens, what it costs and what we need from you.
      </PageHero>
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([t, d], i) => (
            <Card key={t}><p className="text-sm font-bold uppercase tracking-wider text-signal">Step {i + 1}</p>
              <h3 className="mt-2 text-xl font-bold">{t}</h3><p className="mt-3 text-slate-600">{d}</p></Card>
          ))}
        </div>
      </Section>
      <section className="bg-cloud"><Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-8"><Eyebrow>Communication</Eyebrow><h3 className="mt-3 text-2xl font-bold">How we communicate</h3>
            <Check items={["One point of contact", "A demo every two weeks", "A shared project board", "A weekly update"]} /></div>
          <div className="rounded-2xl bg-white p-8"><Eyebrow>Payment</Eyebrow><h3 className="mt-3 text-2xl font-bold">How you pay</h3>
            <Check items={["Discovery: [upfront]", "MVP: milestone payments", "CTO Partner: monthly", "USD or GBP invoicing available"]} /></div>
          <div className="rounded-2xl bg-white p-8"><Eyebrow>Ownership</Eyebrow><h3 className="mt-3 text-2xl font-bold">What you own</h3>
            <p className="mt-5 text-slate-700">Code, designs and documentation, transferred on final payment.</p></div>
        </div>
      </Section></section>
      <Section>
        <H2>Frequently asked questions</H2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {faqs.map(([q, a]) => (
            <Card key={q}><p className="text-xs font-bold uppercase tracking-wider text-signal">FAQ</p>
              <h3 className="mt-2 text-lg font-bold">{q}</h3><p className="mt-3 text-slate-600">{a}</p></Card>
          ))}
        </div>
      </Section>
      <CtaBand />
    </main>
  );
}
