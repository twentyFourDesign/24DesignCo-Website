import type { Metadata } from "next";
import { CtaBand, PageHero, Section } from "@/components/ui";
import BlogList from "./BlogList";

export const metadata: Metadata = { title: "Blog | 24 Design Co." };

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="Blog" title="Practical advice for founders building their first product">
        Costs, MVP scope, choosing a team and what to do after launch.
      </PageHero>
      <Section><BlogList /></Section>
      <section className="bg-cloud">
        <Section>
          <h2 className="text-2xl font-extrabold md:text-3xl">One practical tip a month</h2>
          <form className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row" action="#">
            <label htmlFor="sub" className="sr-only">Email</label>
            <input id="sub" type="email" required placeholder="Email" className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3" />
            <button type="submit" className="rounded-lg bg-signal px-6 py-3 font-semibold text-white hover:bg-blue-700">Subscribe</button>
          </form>
        </Section>
      </section>
      <CtaBand />
    </main>
  );
}
