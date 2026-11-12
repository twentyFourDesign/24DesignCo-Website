// Time helpers that work in the business's time zone (Africa/Lagos by default).
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

/** Minutes the zone is ahead of UTC at a given instant. */
export function tzOffsetMinutes(date: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** "2026-11-09" + "12:00" in the zone -> the UTC instant. */
export function zonedTime(dateStr: string, hhmm: string, timeZone: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, h, min));
  return new Date(guess.getTime() - tzOffsetMinutes(guess, timeZone) * 60000);
}

/** A Date as "YYYY-MM-DD" in the zone. */
export const zonedDateStr = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

export function dayKey(dateStr: string): DayKey {
  const [y, m, d] = dateStr.split("-").map(Number);
  return DAY_KEYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
export function addDays(dateStr: string, n: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
export const isDateStr = (s: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(String(s ?? ""));
