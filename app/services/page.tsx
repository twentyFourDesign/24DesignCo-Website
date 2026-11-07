import type { Metadata } from "next";
import Link from "next/link";
import { Card, CtaBand, Eyebrow, H2, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Services | 24 Design Co." };

const groups = [
  { eyebrow: "Launch your idea", title: "Start here", items: [["Discovery Sprint", "/services/discovery-sprint"], ["MVP Development", "/services/mvp-development"], ["UI/UX Design", null]] },
  { eyebrow: "Build your product", title: "Apps people use", items: [["Mobile Apps (iOS, Android, Flutter)", null], ["Web Apps", null]] },
  { eyebrow: "Keep it growing", title: "After launch", items: [["CTO as a Service", "/services/cto-as-a-service"], ["DevOps and cloud", null], ["QA and testing", null], ["Dedicated team", null], ["Legacy software modernization", null]] },
] as const;

const every = [
  ["Scope", "Fixed scope", "You know what you are paying for."],
  ["Payment", "Milestone payments", "Tied to working deliverables."],
  ["Progress", "Fortnightly demos", "See working progress every two weeks."],
  ["Ownership", "Your code", "Transferred on final payment."],
];

export default function Services() {
  return (
    <main>
      <PageHero eyebrow="Services" title="Everything you need to launch and grow your product">
        Choose where you are: a rough idea, a first build, or a live product that needs a technical partner.
      </PageHero>
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {groups.map((g) => (
            <Card key={g.title}>
              <Eyebrow>{g.eyebrow}</Eyebrow>
              <h3 className="mt-3 text-2xl font-bold">{g.title}</h3>
              <ul className="mt-5 divide-y divide-slate-100">
                {g.items.map(([name, href]) => (
                  <li key={name} className="py-3">
                    {href ? <Link href={href} className="font-semibold text-signal hover:underline">{name} →</Link> : <span className="text-slate-700">{name}</span>}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
      <section className="bg-cloud">
        <Section>
          <H2>Every engagement includes</H2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {every.map(([k, t, d]) => (
              <div key={k} className="rounded-2xl bg-white p-7">
                <p className="text-xs font-bold uppercase tracking-wider text-signal">{k}</p>
                <h3 className="mt-2 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>
      <CtaBand />
    </main>
  );
}
