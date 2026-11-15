import { requireUser } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { PageHeader } from "@/components/cms/ui/layout";
import TeamList, { type TeamRow } from "./TeamList";

export default async function TeamPage() {
  await requireUser("editor");
  const rows = (await sql`select id, name, role, short_bio, photo, is_founder, visible from cms_team order by sort_order, created_at`) as unknown as TeamRow[];
  return (
    <>
      <PageHeader title="Team" description="People shown on the website. The founder has a full bio on the About page." />
      <TeamList initial={rows} />
    </>
  );
}
