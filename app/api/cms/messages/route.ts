import { api } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { listMessages, messageCounts, parseMessageScope } from "@/lib/cms/messages";

export const GET = api(async (req: Request) => {
  await requireApi("editor");
  const q = new URL(req.url).searchParams;
  const [messages, counts] = await Promise.all([listMessages(parseMessageScope(q.get("scope")), (q.get("q") ?? "").trim()), messageCounts()]);
  return { messages, counts };
});
