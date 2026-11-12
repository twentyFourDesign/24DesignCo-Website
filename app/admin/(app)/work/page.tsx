import { requireUser } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { PageHeader } from "@/components/cms/ui/layout";
import WorkList, { type WorkRow } from "./WorkList";

export default async function WorkPage() {
  await requireUser("editor");
  const rows = (await sql`select id, slug, name, type, tag, summary, cover_image, logo, featured, status from cms_projects order by sort_order, created_at`) as unknown as WorkRow[];
  return (
    <>
      <PageHeader title="Our Work" description="Case studies and ongoing partnerships shown on the website. Drag the order with the arrows; choose which appear on the home page." />
      <WorkList initial={rows} />
    </>
  );
}
