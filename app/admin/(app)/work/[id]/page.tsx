import { notFound } from "next/navigation";
import { requireUser } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { uuid } from "@/lib/cms/http";
import { PageHeader } from "@/components/cms/ui/layout";
import WorkEditor from "./WorkEditor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("editor");
  const id = uuid((await params).id);
  const [p] = id ? await sql`select * from cms_projects where id = ${id}` : [];
  if (!p) notFound();
  return (
    <>
      <PageHeader title={p.name} crumbs={[{ label: "Our Work", href: "/admin/work" }, { label: p.name }]} description="Changes go live when you save and the project is published." />
      <WorkEditor project={JSON.parse(JSON.stringify(p))} />
    </>
  );
}
