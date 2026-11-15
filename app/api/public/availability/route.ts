import { api, badRequest } from "@/lib/cms/http";
import { getSettings } from "@/lib/cms/settings";
import { freeSlots, freeSlotsRange, summarize } from "@/lib/cms/slots";
import { addDays, isDateStr, zonedDateStr } from "@/lib/cms/time";

// GET /api/public/availability?date=YYYY-MM-DD for one day, or ?from=YYYY-MM-DD&days=14 for a range (at most 42 days).
export const GET = api(async (req: Request) => {
  const q = new URL(req.url).searchParams;
  const { availability: av } = await getSettings();
  const base = { timezone: av.timezone, slotMinutes: av.slotMinutes, summary: summarize(av) };
  const date = q.get("date");
  if (date) {
    if (!isDateStr(date)) throw badRequest("Use date=YYYY-MM-DD");
    return { ...base, days: [{ date, slots: await freeSlots(date, { av }) }] };
  }
  const fromParam = q.get("from");
  if (fromParam && !isDateStr(fromParam)) throw badRequest("Use from=YYYY-MM-DD");
  const from = fromParam ?? zonedDateStr(new Date(), av.timezone);
  const n = Math.min(Math.max(Number(q.get("days")) || 14, 1), 42);
  const dates = Array.from({ length: n }, (_, i) => addDays(from, i));
  const slots = await freeSlotsRange(dates, { av });
  const days = dates.map((date) => ({ date, slots: slots[date] }));
  return { ...base, days };
});
