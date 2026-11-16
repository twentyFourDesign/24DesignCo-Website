import JsonLd from "@/components/blog/JsonLd";
import { ORG_ID, breadcrumbData, plain } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/site";
import { notFound } from "next/navigation";
import { getPublishedPage, type PublicPage } from "@/lib/cms/pages";
import { getSiteSafe } from "@/lib/cms/site";
import { getProjects } from "@/lib/cms/projects";
import { getTeam } from "@/lib/cms/team";
import { getAllPosts } from "@/lib/blog";
import type { Section } from "@/lib/cms/sections";
import Sections, { EMPTY_DATA, type SectionData } from "./Sections";
import { Footer } from "@/components/ui";
import type { Contact } from "./Forms";

async function getContact(): Promise<Contact> {
  // The street address is never shown on the website (client requirement), so only phone and email are read.
  const s = await getSiteSafe();
  return { email: s.email, phone: s.phone, footerText: s.footer.text };
}

/** Loads only the data the given sections need (projects, posts, team, contact details). */
export async function loadSectionData(sections: Pick<Section, "type">[]): Promise<SectionData> {
  const t = new Set(sections.map((s) => s.type));
  const [projects, posts, team, contact] = await Promise.all([
    t.has("projects") ? getProjects() : Promise.resolve(EMPTY_DATA.projects),
    t.has("posts") ? getAllPosts() : Promise.resolve(EMPTY_DATA.posts),
    t.has("team") ? getTeam() : Promise.resolve(EMPTY_DATA.team),
    getContact(),
  ]);
  return { projects, posts, team, contact };
}

/** A public page rendered from the database. Calls notFound() when there is no published page at `path`. */
/** Structured data for a CMS page: breadcrumbs, the service on service pages, and its visible questions and answers. */
function pageData(path: string, page: PublicPage) {
  if (path === "/") return [];
  const blocks: Record<string, unknown>[] = [];
  const trail = path.startsWith("/services/") ? [{ name: "Services", path: "/services" }, { name: page.title, path }] : [{ name: page.title, path }];
  blocks.push(breadcrumbData(trail));
  if (path.startsWith("/services/")) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.title,
      serviceType: page.title,
      ...(page.seo.metaDescription ? { description: page.seo.metaDescription } : {}),
      url: `${SITE_URL}${path}`,
      areaServed: ["NG", "Worldwide"],
      provider: { "@id": ORG_ID },
    });
  }
  const qa = page.sections
    .filter((s) => s.type === "faq" && s.visible !== false)
    .flatMap((s) => (Array.isArray(s.fields.items) ? (s.fields.items as { question?: string; answer?: string }[]) : []))
    .filter((q) => q.question && q.answer);
  if (qa.length) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: qa.map((q) => ({ "@type": "Question", name: plain(q.question!), acceptedAnswer: { "@type": "Answer", text: plain(q.answer!) } })),
    });
  }
  return blocks;
}

export default async function CmsPage({ path }: { path: string }) {
  const page = await getPublishedPage(path);
  if (!page) notFound();
  const data = await loadSectionData(page.sections);
  return (
    <main>
      {pageData(path, page).map((d, i) => <JsonLd key={i} data={d} />)}
      <Sections sections={page.sections} data={data} />
      <Footer />
    </main>
  );
}
