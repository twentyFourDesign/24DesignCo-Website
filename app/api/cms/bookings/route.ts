import { api } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { bookingCounts, listBookings, parseScope } from "@/lib/cms/bookings";

export const GET = api(async (req: Request) => {
  await requireApi("editor");
  const q = new URL(req.url).searchParams;
  const scope = parseScope(q.get("scope"));
  const [bookings, counts] = await Promise.all([listBookings(scope, (q.get("q") ?? "").trim()), bookingCounts()]);
  return { bookings, counts };
});
