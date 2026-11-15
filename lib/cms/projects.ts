import { cacheLife, cacheTag } from "next/cache";
import { sql } from "./db";
import { TAGS } from "./revalidate";
import type { CaseStudyData } from "@/components/CaseStudy";

export type ProjectStat = { value: string; label: string };
export type Project = {
  id: string; slug: string; name: string; type: "case-study" | "partnership";
  tag: string; summary: string; services: string[]; logo: string; coverImage: string; body: string;
  links: { website?: string; appStore?: string; googlePlay?: string };
  stats: ProjectStat[]; caseStudy: CaseStudyData | null; seo: { metaTitle?: string; metaDescription?: string };
  featured: boolean; status: "draft" | "published"; sortOrder: number;
};

const toProject = (r: Record<string, unknown>): Project => r as unknown as Project;

/** Published projects for the public site, in the order set in the admin. Cached; refreshed when the admin saves (TAGS.work). */
export async function getProjects(opts: { featured?: boolean; type?: "case-study" | "partnership" } = {}): Promise<Project[]> {
  "use cache";
  cacheLife({ revalidate: 60, expire: 3600 });
  cacheTag(TAGS.work);
  const rows = await sql`select * from cms_projects where status = 'published'
    ${opts.featured ? sql`and featured = true` : sql``} ${opts.type ? sql`and type = ${opts.type}` : sql``}
    order by sort_order, created_at`;
  return rows.map(toProject);
}

export async function getProject(slug: string): Promise<Project | null> {
  "use cache";
  cacheLife({ revalidate: 60, expire: 3600 });
  cacheTag(TAGS.work);
  const [r] = await sql`select * from cms_projects where slug = ${slug} and status = 'published'`;
  return r ? toProject(r) : null;
}
