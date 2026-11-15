import { cacheLife, cacheTag } from "next/cache";
import { sql } from "./db";
import { TAGS } from "./revalidate";

export type TeamMember = {
  id: string; name: string; role: string; shortBio: string; bio: string; researchArea: string; photo: string; photoAlt: string;
  links: { linkedin?: string; x?: string; email?: string }; isFounder: boolean; visible: boolean; sortOrder: number;
};

/** Visible team members for the public site, in order. The founder has isFounder = true. Cached; refreshed when the admin saves (TAGS.team). */
export async function getTeam(): Promise<TeamMember[]> {
  "use cache";
  cacheLife({ revalidate: 60, expire: 3600 });
  cacheTag(TAGS.team);
  const rows = await sql`select * from cms_team where visible = true order by sort_order, created_at`;
  return rows as unknown as TeamMember[];
}
