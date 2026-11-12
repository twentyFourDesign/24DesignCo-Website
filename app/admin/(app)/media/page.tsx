import { requireUser } from "@/lib/cms/auth";
import { PageHeader } from "@/components/cms/ui/layout";
import { listMedia } from "@/lib/cms/media-server";
import MediaLibrary from "./MediaLibrary";

export default async function MediaPage() {
  await requireUser("editor");
  const initial = await listMedia();
  return (
    <>
      <PageHeader title="Media library" description="Images and PDFs used across the website. PNG, JPG, WEBP, GIF, SVG or PDF, up to 10 MB each." />
      <MediaLibrary initial={initial} />
    </>
  );
}
