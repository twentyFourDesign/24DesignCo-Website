import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CaseStudy from "@/components/CaseStudy";
import MarkdownContent from "@/components/blog/MarkdownContent";
import { CtaBand, Eyebrow, PageHero, Section } from "@/components/ui";
import { getProject, getProjects } from "@/lib/cms/projects";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return { title: "Not found" };
  return {
    title: p.seo?.metaTitle || `${p.name} case study | 24 Design Co.`,
    description: p.seo?.metaDescription || p.summary,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) notFound();
  // Projects with the full designed case study use the rich template; projects added from the admin form get a simpler page.
  if (p.caseStudy) return <CaseStudy d={p.caseStudy} />;
  return (
    <main>
      <PageHero eyebrow={p.tag || "Case study"} title={p.name}>{p.summary}</PageHero>
      <Section>
        {p.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.coverImage} alt={`${p.name} screenshot`} className="mb-10 h-auto w-full rounded-2xl" />
        )}
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <div className="max-w-none">{p.body ? <MarkdownContent content={p.body} /> : <p className="text-slate-600">{p.summary}</p>}</div>
          <aside className="space-y-6">
            {p.services.length > 0 && (
              <div><Eyebrow>What we did</Eyebrow><ul className="mt-3 space-y-2 text-slate-700">{p.services.map((s) => <li key={s}>{s}</li>)}</ul></div>
            )}
            {(p.links.website || p.links.appStore || p.links.googlePlay) && (
              <div className="space-y-2 font-semibold text-signal">
                {p.links.website && <a href={p.links.website} target="_blank" rel="noreferrer" className="block hover:underline">Visit the website →</a>}
                {p.links.appStore && <a href={p.links.appStore} target="_blank" rel="noreferrer" className="block hover:underline">App Store →</a>}
                {p.links.googlePlay && <a href={p.links.googlePlay} target="_blank" rel="noreferrer" className="block hover:underline">Google Play →</a>}
              </div>
            )}
            <Link href="/our-work" className="inline-block font-semibold text-signal hover:underline">← All our work</Link>
          </aside>
        </div>
      </Section>
      <CtaBand />
    </main>
  );
}
