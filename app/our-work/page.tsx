import type { Metadata } from "next";
import Link from "next/link";
import { Check, CtaBand, Eyebrow, H2, PageHero, Placeholder, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Our Work | 24 Design Co." };

const Tag = ({ children }: { children: string }) => <p className="mt-5 text-xs font-bold uppercase tracking-wide text-signal">{children}</p>;

const partners = [
  { name: "Jara Beach Resort", logo: "/work/logo-jara.jpg", href: "/our-work/jara-beach-resort", blurb: "A custom booking system for a beach resort, designed around how the resort actually runs, and supported by us since launch." },
  { name: "Lufasi Lodges", logo: "/work/logo-lufasi.jpg", href: "/our-work/lufasi-lodges", blurb: "A custom booking system built from scratch for Lufasi Lodges, and supported by us since launch." },
];

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
          <Link href="/our-work/nexuss" className="group">
            <Placeholder label="[Nexuss screenshot]" className="aspect-[16/10]" />
            <Tag>HERITAGE PLATFORM · MOBILE AND WEB</Tag>
            <h3 className="mt-1 text-xl font-bold group-hover:text-signal">Nexuss</h3>
            <p className="mt-2 text-slate-600">One home for Nigeria’s family stories. 165 screens, live on iOS, Android and web.</p>
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
        <Eyebrow>Long-term clients</Eyebrow>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <H2>Ongoing partnerships</H2>
            <p className="mt-4 max-w-xl text-lg text-slate-600">We built these products from scratch, and we are still their technical partner today.</p>
          </div>
          <Link href="/services/cto-as-a-service" className="font-semibold text-signal">Talk to us about CTO support →</Link>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {partners.map((p) => (
            <article key={p.name} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.logo} alt={`${p.name} logo`} className="h-auto w-full" />
              <div className="p-7 md:p-8">
                <Tag>BOOKING PLATFORM · ONGOING CTO SUPPORT</Tag>
                <h3 className="mt-1 text-2xl font-bold">{p.name}</h3>
                <p className="mt-2 text-slate-600">{p.blurb}</p>
                <Check items={["Booking system built from scratch", "Maintenance, security monitoring and backups", "Ongoing CTO support and roadmap"]} />
                <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
                  {[["[N]", "Bookings handled"], ["[N]", "Years supported"], ["[N]%", "Uptime"]].map(([v, l]) => (
                    <div key={l}><dt className="sr-only">{l}</dt><dd className="font-display text-2xl font-extrabold">{v}</dd><p className="text-sm text-slate-600">{l}</p></div>
                  ))}
                </dl>
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Partner since [year]</span>
                  <Link href={p.href} className="text-base font-semibold text-signal">Read the story →</Link>
                </div>
              </div>
            </article>
          ))}
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
