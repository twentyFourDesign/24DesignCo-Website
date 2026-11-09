import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, Eyebrow, H2, PrimaryBtn, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Services | 24 Design Co.",
  description: "Everything you need to launch and grow your product: Discovery Sprint, MVP development, CTO as a Service and more.",
};

const IMG = "/services";

const starts = [
  { img: "start-idea.jpg", eyebrow: "Launch your idea", title: "You have an idea", body: "Turn it into a clear plan, a prototype and a fixed quote before you spend on code.", items: [["Discovery Sprint", "/services/discovery-sprint"], ["MVP Development", "/services/mvp-development"], ["UI/UX Design", null]] },
  { img: "start-build.jpg", eyebrow: "Build your product", title: "You are ready to build", body: "Get a working mobile or web app your first users can download and use.", items: [["Mobile apps (iOS, Android, Flutter)", null], ["Web apps", null], ["Admin dashboards", null]] },
  { img: "start-live.jpg", eyebrow: "Keep it growing", title: "Your product is live", body: "Keep it fast, secure and improving with a technical partner on your side.", items: [["CTO as a Service", "/services/cto-as-a-service"], ["DevOps and cloud", null], ["QA and testing", null], ["Dedicated team", null], ["Legacy software modernization", null]] },
] as const;

type IconName = "search" | "rocket" | "user" | "design" | "phone" | "code" | "cloud" | "shield" | "team" | "refresh" | "doc" | "card" | "play" | "lock";

const PATHS: Record<IconName, string[]> = {
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m21 21-4.3-4.3"],
  rocket: ["M12 3c3 2 5 5 5 9l-2 3H9l-2-3c0-4 2-7 5-9Z", "M12 11a1.5 1.5 0 1 0 0-.01", "M9 15l-2 4M15 15l2 4"],
  user: ["M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M5 21a7 7 0 0 1 14 0"],
  design: ["M3 4h18v12H3z", "M8 20h8M12 16v4"],
  phone: ["M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z", "M11 18h2"],
  code: ["M3 5h18v14H3z", "m9 10-2 2 2 2M15 10l2 2-2 2"],
  cloud: ["M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9.5 4 4 0 0 1 17 18", "M12 12v7m0 0-3-3m3 3 3-3"],
  shield: ["M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z", "m9 12 2 2 4-4"],
  team: ["M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M3 20a6 6 0 0 1 12 0", "M16 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 3 6"],
  refresh: ["M20 12a8 8 0 1 1-3-6.2", "M20 4v4h-4"],
  doc: ["M6 3h9l4 4v14H6z", "M9 11h7M9 15h7M9 19h4"],
  card: ["M3 6h18v12H3z", "M3 10h18M7 15h4"],
  play: ["M3 5h18v12H3z", "m10 8 5 3-5 3z", "M8 21h8"],
  lock: ["M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z", "M10 12h4v3h-4zM11 12v-1a1 1 0 0 1 2 0v1"],
};

function Icon({ name, tone = "blue" }: { name: IconName; tone?: "blue" | "gold" }) {
  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone === "gold" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-signal"}`}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {PATHS[name].map((d) => <path key={d} d={d} />)}
      </svg>
    </span>
  );
}

const core = [
  { icon: "search", img: "core-discovery.jpg", tag: "Discovery Sprint", time: "1 to 2 weeks", title: "Know exactly what to build before you build it", body: "We turn your idea into a clickable prototype, a prioritised feature list and a fixed quote, so you start the build with no surprises.", get: ["A clickable prototype of the key screens", "User flows and a prioritised feature list", "A timeline and a fixed quote for the MVP", "Technical recommendations for your stack"], href: "/services/discovery-sprint" },
  { icon: "rocket", img: "core-mvp.jpg", tag: "MVP Development", time: "8 to 12 weeks", title: "Launch the first version people can actually use", body: "We design, build and launch the smallest version of your product that proves the idea, with a working demo every two weeks.", get: ["Mobile app, web app or both", "Admin dashboard to run the business", "Payments, maps or other key integrations", "App Store and Google Play launch"], href: "/services/mvp-development" },
  { icon: "user", img: "core-cto.jpg", tag: "CTO as a Service", time: "Monthly", title: "A technical partner for the long run", body: "After launch, we stay on as your technical team: planning the roadmap, keeping the product secure and stable, and shipping improvements.", get: ["Roadmap and release planning", "Monitoring, security and backups", "Ongoing features and fixes", "Help hiring and managing developers"], href: "/services/cto-as-a-service" },
] as const;

const all: { icon: IconName; t: string; d: string; href?: string }[] = [
  { icon: "design", t: "UI/UX Design", d: "Flows, screens and prototypes your users understand at a glance." },
  { icon: "phone", t: "Mobile Apps", d: "Native iOS and Android, or one Flutter codebase for both." },
  { icon: "code", t: "Web Apps", d: "Customer portals, marketplaces, booking and admin systems." },
  { icon: "cloud", t: "DevOps and Cloud", d: "Hosting, deployments, monitoring and backups that just work." },
  { icon: "shield", t: "QA and Testing", d: "Manual and automated testing before every release." },
  { icon: "team", t: "Dedicated Team", d: "Designers and engineers who work as part of your team." },
  { icon: "refresh", t: "Legacy Modernization", d: "Rebuild or upgrade older software without losing your data." },
  { icon: "search", t: "Discovery Sprint", d: "A prototype, scope and fixed quote in 1 to 2 weeks.", href: "/services/discovery-sprint" },
  { icon: "user", t: "CTO as a Service", d: "Senior technical leadership, without a full-time hire.", href: "/services/cto-as-a-service" },
];

const steps = [
  ["Free idea review", "A 30-minute call to understand your idea and goals."],
  ["Discovery Sprint", "Prototype, scope and a fixed quote."],
  ["Build", "Fortnightly demos of working software."],
  ["Launch and grow", "Go live, then improve with your CTO partner."],
];

const every: [IconName, string, string][] = [
  ["doc", "Fixed scope", "You know exactly what you are paying for."],
  ["card", "Milestone payments", "Payments tied to working deliverables."],
  ["play", "Fortnightly demos", "See working progress every two weeks."],
  ["lock", "You own the code", "Full source code transferred on final payment."],
];

const tools = ["Flutter", "iOS", "Android", "React", "Node.js", "MongoDB", "Firebase", "Cloud hosting"];

const faqs = [
  ["I only have an idea. Where do I start?", "Book a free idea review. We will talk through your idea and recommend whether a Discovery Sprint is the right first step."],
  ["Do I own the code?", "Yes. The full source code and accounts are transferred to you on final payment."],
  ["Can you take over an app someone else built?", "Yes. We review the existing code first, then recommend whether to improve it or rebuild parts of it."],
  ["What happens after launch?", "You can continue with CTO as a Service for ongoing support, improvements and technical leadership."],
];

const link = "font-semibold text-signal hover:underline";

export default function Services() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-16 pt-14 md:px-8 md:pb-20 md:pt-20 lg:grid-cols-2">
          <div>
            <Eyebrow light>Services</Eyebrow>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">Everything you need to launch and grow your product</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">Choose where you are: a rough idea, a first build, or a live product that needs a technical partner.</p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <PrimaryBtn />
              <a href="#start" className="inline-block rounded-lg border border-white/40 px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-white/10">Find your starting point</a>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG}/hero.jpg`} alt="A product dashboard and mobile app, live on both stores" className="mx-auto hidden w-full max-w-[520px] rounded-2xl lg:block" />
        </div>
      </section>

      {/* Starting point */}
      <Section id="start" className="scroll-mt-20">
        <Eyebrow>Where are you now?</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Pick your starting point</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {starts.map((s) => (
            <article key={s.title} className="overflow-hidden rounded-2xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/${s.img}`} alt="" className="h-auto w-full" />
              <div className="p-7">
                <Eyebrow>{s.eyebrow}</Eyebrow>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{s.body}</p>
                <ul className="mt-5 space-y-2.5">
                  {s.items.map(([name, href]) => (
                    <li key={name} className="flex gap-3 text-slate-700">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-launch" />
                      {href ? <Link href={href} className={`${link} underline`}>{name}</Link> : name}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Core services */}
      <section className="bg-cloud">
        <Section>
          <Eyebrow>Our core services</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">From idea to launch, and beyond</h2>
          <div className="mt-12 space-y-16 md:space-y-20">
            {core.map((c, i) => (
              <div key={c.tag} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${IMG}/${c.img}`} alt="" className={`h-auto w-full rounded-3xl ${i % 2 ? "lg:order-2" : ""}`} />
                <div>
                  <div className="flex items-center gap-4">
                    <Icon name={c.icon} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">{c.tag}</p>
                      <span className="mt-1 inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold">{c.time}</span>
                    </div>
                  </div>
                  <h3 className="mt-5 text-2xl font-extrabold tracking-tight md:text-3xl">{c.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-slate-600">{c.body}</p>
                  <p className="mt-6 font-bold">What you get</p>
                  <ul className="mt-3 space-y-2.5">
                    {c.get.map((g) => (
                      <li key={g} className="flex gap-3 text-slate-700"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-launch" />{g}</li>
                    ))}
                  </ul>
                  <Link href={c.href} className={`${link} mt-6 inline-block`}>Learn more →</Link>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* All services */}
      <Section>
        <Eyebrow>All services</Eyebrow>
        <H2>Everything we do</H2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {all.map((a) => (
            <div key={a.t} className="flex gap-5 rounded-2xl border border-slate-200 p-6">
              <Icon name={a.icon} />
              <div>
                <h3 className="font-bold">{a.href ? <Link href={a.href} className={`${link} underline`}>{a.t}</Link> : a.t}</h3>
                <p className="mt-1.5 text-slate-600">{a.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <section className="bg-navy text-white">
        <Section>
          <Eyebrow light>How it works</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Four steps from idea to live product</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-4">
            {steps.map(([t, d], i) => (
              <li key={t}>
                <span className={`font-display grid h-14 w-14 place-items-center rounded-full text-xl font-bold ${i === 3 ? "bg-launch text-navy" : "bg-signal text-white"}`}>{i + 1}</span>
                <h3 className="mt-5 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-slate-300">{d}</p>
              </li>
            ))}
          </ol>
        </Section>
      </section>

      {/* Every engagement */}
      <section className="bg-cloud">
        <Section>
          <Eyebrow>Every engagement includes</Eyebrow>
          <H2>No surprises, from day one</H2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {every.map(([icon, t, d]) => (
              <div key={t} className="rounded-2xl bg-white p-7">
                <Icon name={icon} tone="gold" />
                <h3 className="mt-5 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* Tools + FAQ */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Tools we build with</Eyebrow>
            <H2>Proven technology, chosen for your product</H2>
            <ul className="mt-8 flex flex-wrap gap-3">
              {tools.map((t) => <li key={t} className="rounded-full bg-cloud px-5 py-2.5 font-semibold">{t}</li>)}
            </ul>
          </div>
          <div>
            <Eyebrow>Questions</Eyebrow>
            <H2>Common questions</H2>
            <div className="mt-8 divide-y divide-slate-200 border-b border-slate-200">
              {faqs.map(([q, a], i) => (
                <details key={q} className="group py-4" open={i === 0}>
                  <summary className="cursor-pointer list-none text-lg font-bold marker:hidden [&::-webkit-details-marker]:hidden">
                    <span className="mr-3 inline-block text-xs transition group-open:rotate-90">▶</span>{q}
                  </summary>
                  <p className="mt-3 pl-7 leading-relaxed text-slate-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </Section>
      <CtaBand />
    </main>
  );
}
