import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, H2, PageHero, Placeholder, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Our Work | 24 Design Co." };

const Tag = ({ children }: { children: string }) => <p className="mt-5 text-xs font-bold uppercase tracking-wide text-signal">{children}</p>;

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="Our work" title="Products we have taken from idea to launch">
        From the first idea to a live product, and in many cases beyond launch as the technical partner.
      </PageHero>
      <Section>
        <H2>Startups: idea to launch</H2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <Link href="/our-work/sharporders" className="group">
            <Placeholder label="[Sharporders screenshot]" className="aspect-[16/10]" />
            <Tag>MOBILE APP · MVP</Tag>
            <h3 className="mt-1 text-xl font-bold group-hover:text-signal">Sharporders</h3>
            <p className="mt-2 text-slate-600">[One line.] Live on both app stores.</p>
          </Link>
          <div>
            <Placeholder label="[Napollo Music screenshot]" className="aspect-[16/10]" />
            <Tag>[TYPE] · MVP</Tag>
            <h3 className="mt-1 text-xl font-bold">Napollo Music</h3>
            <p className="mt-2 text-slate-600">[One line.] [Result.]</p>
          </div>
        </div>
      </Section>
      <section className="bg-cloud"><Section>
        <H2>Ongoing partnerships</H2>
        <div className="mt-8 rounded-2xl bg-white p-8">
          <Tag>BOOKING PLATFORMS · ONGOING CTO SUPPORT</Tag>
          <h3 className="mt-1 text-xl font-bold">Jara Beach Resort and Lufasi Lodges</h3>
          <p className="mt-2 text-slate-600">Custom booking systems built from scratch and supported by us since launch. [Result, with permission.]</p>
        </div>
      </Section></section>
      <Section>
        <H2>Brand and design work</H2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[["ileri Labs"], ["Grillz & Moore"], ["EveryCation"]].map(([n]) => (
            <div key={n} className="rounded-2xl border border-slate-200 p-7">
              <p className="text-xs font-bold uppercase tracking-wide text-signal">BRAND AND WEBSITE</p>
              <h3 className="mt-2 text-xl font-bold">{n}</h3><p className="mt-2 text-slate-600">[What you did.]</p>
            </div>
          ))}
        </div>
      </Section>
      <CtaBand />
    </main>
  );
}
