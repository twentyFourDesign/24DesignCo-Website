import { notFound } from "next/navigation";
import { requireUser } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { uuid } from "@/lib/cms/http";
import { PageHeader } from "@/components/cms/ui/layout";
import TeamEditor from "./TeamEditor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("editor");
  const id = uuid((await params).id);
  const [m] = id ? await sql`select * from cms_team where id = ${id}` : [];
  if (!m) notFound();
  return (
    <>
      <PageHeader title={m.name || "New team member"} crumbs={[{ label: "Team", href: "/admin/team" }, { label: m.name || "New member" }]} />
      <TeamEditor member={JSON.parse(JSON.stringify(m))} />
    </>
  );
}
