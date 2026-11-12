import { api } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { listActivity } from "@/lib/cms/activity-feed";

export const GET = api(async (req: Request) => {
  await requireApi("author");
  const q = new URL(req.url).searchParams;
  return listActivity({ kind: q.get("kind") ?? "", page: Number(q.get("page")) || 1 });
});
