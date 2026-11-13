import Link from "next/link";
import { PageHero, PrimaryBtn, Section } from "@/components/ui";

export const metadata = { title: "Page not found | 24 Design Co.", robots: { index: false } };

/** Shown for any address that does not exist (the proxy also sends a real 404 status). */
export default function NotFound() {
  return (
    <>
      <PageHero eyebrow="404" title="We could not find that page">
        It may have moved, or the link may have a typo. These are good places to start.
      </PageHero>
      <Section>
        <div className="flex flex-wrap items-center gap-4">
          <PrimaryBtn />
          <Link href="/" className="rounded-lg border border-slate-300 px-6 py-4 font-semibold text-navy hover:bg-slate-50">Go to the home page</Link>
          <Link href="/services" className="rounded-lg border border-slate-300 px-6 py-4 font-semibold text-navy hover:bg-slate-50">See our services</Link>
          <Link href="/blog" className="rounded-lg border border-slate-300 px-6 py-4 font-semibold text-navy hover:bg-slate-50">Read the blog</Link>
        </div>
      </Section>
    </>
  );
}
