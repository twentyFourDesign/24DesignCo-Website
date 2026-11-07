import type { Metadata } from "next";
import Link from "next/link";
import { Card, Check, CtaBand, Eyebrow, H2, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = { title: "MVP Development | 24 Design Co." };

const tiers = [
  ["Lean", "One platform, one main user type, basic admin."],
  ["Standard", "Mobile app plus admin dashboard, accounts, payments or one integration."],
  ["Advanced", "Marketplace, several user roles, multiple integrations."],
];

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="MVP Development" title="Launch your first version in 8 to 12 weeks">
        The smallest version of your idea that real users can use, designed, built, tested and launched.
      </PageHero>
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card><Eyebrow>Included</Eyebrow><h3 className="mt-3 text-2xl font-bold">What is included</h3>
            <Check items={["UI and UX design", "Mobile and web development", "Testing before launch", "App Store and Google Play submission", "Analytics and monitoring", "30 days of post-launch fixes"]} /></Card>
          <Card><Eyebrow>Timeline</Eyebrow><h3 className="mt-3 text-2xl font-bold">8 to 12 weeks</h3>
            <Check items={["Weeks 1 to 2: design and setup", "Weeks 3 to 8: build in two-week cycles", "Weeks 9 to 10: testing", "Weeks 11 to 12: launch"]} /></Card>
          <Card className="bg-cloud"><Eyebrow>Payment</Eyebrow><h3 className="mt-3 text-2xl font-bold">Milestone payments</h3>
            <p className="mt-4 text-slate-600">Tied to working deliverables. You own the code on final payment.</p></Card>
        </div>
      </Section>
      <section className="bg-cloud"><Section>
        <H2>What it costs</H2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {tiers.map(([k, d]) => (
            <div key={k} className="rounded-2xl bg-white p-7"><p className="text-xs font-bold uppercase tracking-wider text-signal">{k}</p>
              <h3 className="mt-2 text-2xl font-bold">From [price]</h3><p className="mt-3 text-slate-600">{d}</p></div>
          ))}
        </div>
      </Section></section>
      <Section>
        <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><Eyebrow>Proof</Eyebrow><h3 className="mt-2 text-2xl font-bold">Sharporders</h3>
            <p className="mt-2 text-slate-600">From idea to live on both the App Store and Google Play. [Result.]</p></div>
          <Link href="/our-work/sharporders" className="font-semibold text-signal hover:underline">Read the story →</Link>
        </Card>
      </Section>
      <CtaBand />
    </main>
  );
}
