import { api } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { listActivity } from "@/lib/cms/activity-feed";
import { atLeast } from "@/lib/cms/roles";

export const GET = api(async (req: Request) => {
  const me = await requireApi("author");
  const q = new URL(req.url).searchParams;
  return listActivity({ kind: q.get("kind") ?? "", page: Number(q.get("page")) || 1, contentOnly: !atLeast(me.role, "editor") });
});
