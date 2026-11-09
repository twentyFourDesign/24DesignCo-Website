import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, Eyebrow, H2, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "About | 24 Design Co.",
  description: "We help founders turn ideas into products, and stay on as their technical team. Meet the founder behind 24 Design Co.",
};

const beliefs = [
  ["Clarity before code", "A clear scope saves more than clever engineering."],
  ["Launch small, learn fast", "The first version should prove your idea, not hold every feature."],
  ["Honest estimates", "What it costs, how long it takes and what we would cut."],
  ["We stay", "Launch is the start of the work, not the end of it."],
];

const facts = [
  ["Since 2008", "Building digital products"],
  ["MIT, UNILAG", "Master of Information Technology"],
  ["PhD research", "Currently exploring"],
  ["CTO partner", "To growing businesses"],
];

const built = ["Sharporders", "Napollo Music", "Jara Beach Resort", "Lufasi Lodges"];

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="About" title="We help founders turn ideas into products, and stay on as their technical team.">
        Building products and software in Lagos since 2008.
      </PageHero>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">A technical partner from the idea stage</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">Products succeed when a technical partner is involved from the idea stage, not only at the coding stage. So that is how we work: we help you decide what to build, build the first version, and stay with you as it grows.</p>
            <p className="mt-5 text-lg leading-relaxed"><strong>Our mission:</strong> <span className="text-slate-600">to help founders turn ideas into products people use, and to stay on as their technical partner.</span></p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/services/about-team.jpg" alt="Illustration of the 24 Design Co. team at work" className="h-auto w-full rounded-3xl" />
        </div>
      </Section>

      <section className="bg-cloud">
        <Section>
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-14">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/services/founder.jpg" alt="Oluwole Olarewaju" className="mx-auto h-auto w-full max-w-sm rounded-3xl lg:max-w-none" />
            <div>
              <Eyebrow>Meet the founder</Eyebrow>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Oluwole Olarewaju</h2>
              <p className="mt-2 font-semibold text-signal">Founder and CEO, 24 Design Co.</p>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-slate-600">
                <p>Oluwole Olarewaju (Wole) is the founder and CEO of 24 Design Co. He has been building digital products since 2008, starting out in project management and media operations, and has led 24 Discovery Limited, the Lagos technology company behind 24 Design Co., since 2012.</p>
                <p>Over the years he has taken startup ideas from a first conversation to products live on the App Store and Google Play, designed and built custom booking platforms from scratch, and served as a long-term CTO partner to growing businesses.</p>
                <p>Wole holds a Master of Information Technology from the University of Lagos and is currently exploring PhD research in Developing a Socio-technical System for Digitizing Field Data and Modeling Radicalization Pathways to Strengthen Counterterrorism in Sub-Saharan Africa. Today he leads the studio’s work with startups and first-time founders: deciding what to build, launching the first version and growing it after launch.</p>
              </div>
              <a href="mailto:wole@24group.com.ng" className="mt-6 inline-block rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold hover:border-signal hover:text-signal">wole@24group.com.ng</a>
              <blockquote className="mt-8 border-l-4 border-launch pl-5 text-xl font-bold leading-snug md:text-2xl">
                “Your first version should prove your idea. My job is to help you build that version well, and stay with you after it launches.”
              </blockquote>
              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-slate-300 pt-8 sm:grid-cols-4">
                {facts.map(([v, l]) => (
                  <div key={v}>
                    <dt className="font-display text-xl font-extrabold">{v}</dt>
                    <dd className="mt-1 text-sm text-slate-600">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Section>
      </section>

      <Section>
        <Eyebrow>What we believe</Eyebrow>
        <H2>How we work with founders</H2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {beliefs.map(([t, d], i) => (
            <div key={t} className="rounded-2xl border border-slate-200 p-7">
              <p className="text-sm font-bold tracking-widest text-signal">0{i + 1}</p>
              <h3 className="mt-3 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-cloud">
        <Section>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>Products we have built</Eyebrow>
              <H2>From first idea to live product</H2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">Startups, music, ordering and hospitality. Each one built from scratch for its own users.</p>
              <Link href="/our-work" className="mt-5 inline-block font-semibold text-signal hover:underline">See our work →</Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {built.map((b) => <li key={b} className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-lg font-bold">{b}</li>)}
            </ul>
          </div>
        </Section>
      </section>

      <CtaBand />
    </main>
  );
}
