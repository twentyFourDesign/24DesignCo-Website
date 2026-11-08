import Link from "next/link";
import { Footer } from "@/components/ui";

const CTA = "Book a free idea review";

function PrimaryBtn({ className = "" }: { className?: string }) {
  return (
    <Link href="/contact" className={`inline-block rounded-lg bg-signal px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-blue-700 ${className}`}>
      {CTA}
    </Link>
  );
}

const steps = [
  { n: "1", t: "Discovery Sprint", d: "1 to 2 weeks", c: "bg-signal", long: "A clickable prototype, a defined first version and a fixed quote.", short: "1 to 2 weeks. Prototype, scope, fixed quote." },
  { n: "2", t: "MVP Build", d: "8 to 12 weeks", c: "bg-signal", long: "Design, build, test and launch, with a working demo every two weeks.", short: "8 to 12 weeks. Launch with fortnightly demos." },
  { n: "3", t: "CTO Partner", d: "Monthly, after launch", c: "bg-launch", long: "Roadmap, engineering oversight, security and hiring advice, monthly.", short: "Monthly leadership after launch." },
];

const work = [
  { imgs: ["/work/nexuss-hero.jpg"], href: "/our-work/nexuss", tag: "HERITAGE PLATFORM · MOBILE AND WEB", name: "Nexuss", d: "One home for Nigeria’s family stories. 165 screens, live on iOS, Android and web." },
  { imgs: ["/work/jara-hero.jpg", "/work/lufasi-hero.jpg"], href: "/our-work", tag: "BOOKING PLATFORMS · ONGOING CTO SUPPORT", name: "Jara Beach Resort and Lufasi Lodges", d: "Built from scratch, supported ever since. [With permission.]" },
  { label: "[Sharporders screenshot]", href: "/our-work/sharporders", tag: "MOBILE APP · MVP", name: "Sharporders", d: "[One line on what it does.] Live on both app stores." },
  { label: "[Napollo Music screenshot]", href: "/our-work", tag: "[TYPE] · MVP", name: "Napollo Music", d: "[One line on what it does.] [Result.]" },
];

export default function Home() {
  return (
    <div id="top">
      
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300 md:text-sm">
              <span className="md:hidden">App development · Lagos</span>
              <span className="hidden md:inline">Mobile and web app development · Lagos</span>
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[64px]">
              Bring your tech ideas to life.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-300">
              We help founders turn ideas into working mobile and web apps, then stay on as their technical partner. Fixed scope, fortnightly demos, one accountable team.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <PrimaryBtn />
              <Link href="/our-work" className="inline-block rounded-lg border border-white/40 px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-white/10">
                See our work
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-300">Free 30-minute call. No obligation.</p>
          </div>

          <div className="hidden rounded-3xl bg-navy-2 p-8 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Your path to launch</p>
            <ol className="mt-7 space-y-6">
              {steps.map((s) => (
                <li key={s.n} className="flex items-center gap-5">
                  <span className={`font-display grid h-12 w-12 place-items-center rounded-full text-lg font-bold ${s.c} ${s.c === "bg-launch" ? "text-navy" : "text-white"}`}>{s.n}</span>
                  <div>
                    <p className="font-display text-lg font-semibold">{s.t}</p>
                    <p className="text-sm text-slate-300">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-cloud">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-6 text-[15px] font-semibold md:flex-row md:justify-between md:px-8">
          <span>Live on the App Store and Google Play</span>
          <span>Building products and software in Lagos since 2008</span>
          <span className="hidden md:inline">Founders in [markets served]</span>
        </div>
      </section>

      {/* Three steps */}
      <section id="services" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-20 md:px-8 md:pt-28">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          <span className="md:hidden">Three steps to launch</span>
          <span className="hidden md:inline">Three steps from first idea to launch</span>
        </h2>
        <p className="mt-5 hidden max-w-2xl text-lg leading-relaxed text-slate-600 md:block">
          Plan before you build, launch the smallest version that proves your idea, then keep growing with a technical partner.
        </p>
        <div id="how-we-work" className="mt-10 grid scroll-mt-24 gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <article key={s.n} className="rounded-2xl border border-slate-200 p-8">
              <p className="text-sm font-bold uppercase tracking-wider text-signal">Step {s.n}</p>
              <h3 className="mt-2 text-xl font-bold">{s.t}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                <span className="md:hidden">{s.short}</span>
                <span className="hidden md:inline">{s.long}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Work */}
      <section id="our-work" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          <span className="md:hidden">Our work</span>
          <span className="hidden md:inline">Products we have taken from idea to launch</span>
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {work.map((w, i) => (
            <Link key={w.name} href={w.href} className={`group ${i > 0 ? "hidden md:block" : ""}`}>
              {w.imgs ? (
                <div className="flex aspect-[16/10] items-center justify-center gap-3 overflow-hidden rounded-2xl bg-navy p-4 md:p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {w.imgs.map((src) => <img key={src} src={src} alt={`${w.name} screenshot`} className={`h-auto rounded-lg shadow-lg ${w.imgs.length > 1 ? "w-1/2" : "max-h-full w-auto max-w-full"}`} />)}
                </div>
              ) : (
                <div className="grid aspect-[16/10] place-items-center rounded-2xl bg-slate-200 px-4 text-center text-slate-600">{w.label}</div>
              )}
              <p className="mt-5 text-xs font-bold uppercase tracking-wide text-signal">{w.tag}</p>
              <h3 className="mt-1 text-xl font-bold group-hover:text-signal">{w.name}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{w.d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTO band */}
      <section id="about" className="scroll-mt-20 bg-signal text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center md:px-8 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">A technical co-founder without the equity conversation</h2>
            <p className="mt-4 text-lg text-blue-50">Launching is the start. We plan your roadmap, oversee engineering and keep your product secure and online.</p>
          </div>
          <Link href="/services/cto-as-a-service" className="shrink-0 rounded-lg bg-white px-7 py-4 font-semibold text-signal transition hover:bg-blue-50">
            Talk to us about CTO support
          </Link>
        </div>
      </section>

      {/* Final CTA + footer */}
      <section className="bg-navy text-center text-white">
        <div className="mx-auto max-w-[1200px] px-5 pt-20 md:px-8 md:pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">Let’s work together</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">Got an idea you want to build?</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            In a free 30-minute call, we will tell you honestly what it would take to build, and whether we are the right team.
          </p>
          <PrimaryBtn className="mt-9" />
          <p className="mt-5 pb-16 text-sm text-slate-300">Prefer WhatsApp? Message us on [number].</p>
        </div>
        <Footer />
      </section>

    </div>
  );
}
