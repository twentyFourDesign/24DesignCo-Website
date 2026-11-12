import { notFound } from "next/navigation";
import { getPublishedPage } from "@/lib/cms/pages";
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
export default async function CmsPage({ path }: { path: string }) {
  const page = await getPublishedPage(path);
  if (!page) notFound();
  const data = await loadSectionData(page.sections);
  return (
    <main>
      <Sections sections={page.sections} data={data} />
      <Footer />
    </main>
  );
}
