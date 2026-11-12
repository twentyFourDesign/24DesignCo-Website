import { api, badRequest, readJson } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { getSettings, saveSettings } from "@/lib/cms/settings";
import { googleCalendarConfigured } from "@/lib/cms/googleCalendar";
import { logActivity } from "@/lib/cms/activity";
import { isEmail } from "@/lib/cms/http";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const GET = api(async () => {
  await requireApi("editor");
  const s = await getSettings();
  return { availability: s.availability, googleCalendar: { configured: googleCalendarConfigured(), enabled: s.integrations.googleCalendar.enabled } };
});

export const PUT = api(async (req: Request) => {
  const me = await requireApi("editor");
  const s = await getSettings();
  const a = (await readJson(req)) as Record<string, unknown> & { days?: Record<string, { enabled?: boolean; start?: string; end?: string }> };
  const av = s.availability;
  for (const d of DAYS) {
    const v = a.days?.[d];
    if (!v) continue;
    if (!HHMM.test(String(v.start)) || !HHMM.test(String(v.end)) || String(v.start) >= String(v.end)) throw badRequest(`Check the hours for ${d}: the end must be after the start`);
    av.days[d] = { enabled: Boolean(v.enabled), start: String(v.start), end: String(v.end) };
  }
  for (const [k, min, max] of [["slotMinutes", 15, 120], ["bufferMinutes", 0, 120], ["minNoticeHours", 0, 168], ["maxDaysAhead", 1, 180]] as const) {
    if (a[k] === undefined) continue;
    const n = Number(a[k]);
    if (!Number.isInteger(n) || n < min || n > max) throw badRequest(`${k} must be a whole number between ${min} and ${max}`);
    av[k] = n;
  }
  if (a.timezone !== undefined) {
    const tz = String(a.timezone).trim();
    try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); } catch { throw badRequest("That time zone is not recognised (for example Africa/Lagos)"); }
    av.timezone = tz;
  }
  if (a.alertEmail !== undefined) {
    const e = String(a.alertEmail).trim();
    if (e && !isEmail(e)) throw badRequest("Enter a valid alert email address, or leave it empty");
    av.alertEmail = e;
  }
  await saveSettings(s);
  await logActivity(me, "booking", "updated", "Idea review availability", "/admin/bookings?scope=availability");
  return { availability: av };
});
