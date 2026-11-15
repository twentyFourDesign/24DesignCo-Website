import "server-only";
import { sql } from "./db";
import { getSettings, type Settings } from "./settings";
import { addDays, dayKey, zonedDateStr, zonedTime } from "./time";
import { googleBusy } from "./googleCalendar";

type Availability = Settings["availability"];
type Block = { start: Date | string; end: Date | string };

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fromMin = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/** Candidate start times for one day, before looking at existing bookings. */
export function candidateStarts(dateStr: string, av: Availability): Date[] {
  const day = av.days[dayKey(dateStr)];
  if (!day?.enabled) return [];
  const out: Date[] = [];
  for (let t = toMin(day.start); t + av.slotMinutes <= toMin(day.end); t += av.slotMinutes) out.push(zonedTime(dateStr, fromMin(t), av.timezone));
  return out;
}

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && bStart < aEnd;

export type Slot = { start: string; end: string };

/**
 * Free slots for each day in a range (dates are YYYY-MM-DD in the business time zone). One database query and one Google
 * Calendar call cover the whole range, so a 6-week calendar costs two round trips instead of one (or two) per day.
 */
export async function freeSlotsRange(dates: string[], opts: { now?: Date; excludeId?: string; av?: Availability } = {}): Promise<Record<string, Slot[]>> {
  const now = opts.now ?? new Date();
  const av = opts.av ?? (await getSettings()).availability;
  const today = zonedDateStr(now, av.timezone);
  const lastDay = addDays(today, av.maxDaysAhead);
  const len = av.slotMinutes * 60000;
  const buffer = av.bufferMinutes * 60000;
  const out: Record<string, Slot[]> = {};
  const days = dates.map((d) => ({ d, starts: d < today || d > lastDay ? [] : candidateStarts(d, av) }));
  for (const { d } of days) out[d] = [];
  const all = days.flatMap((x) => x.starts);
  if (!all.length) return out;

  const rangeStart = new Date(Math.min(...all.map((x) => x.getTime())) - buffer);
  const rangeEnd = new Date(Math.max(...all.map((x) => x.getTime())) + len + buffer);
  const taken = opts.excludeId
    ? await sql`select start_at, end_at from cms_bookings where status in ('pending','confirmed') and id <> ${opts.excludeId} and start_at < ${rangeEnd} and end_at > ${rangeStart}`
    : await sql`select start_at, end_at from cms_bookings where status in ('pending','confirmed') and start_at < ${rangeEnd} and end_at > ${rangeStart}`;
  const busy = await googleBusy(rangeStart, rangeEnd).catch(() => []);
  const blocks = [...taken.map((t) => ({ start: t.startAt as Date, end: t.endAt as Date })), ...busy]
    .map((b: Block) => [new Date(b.start).getTime(), new Date(b.end).getTime()] as const);
  const earliest = now.getTime() + av.minNoticeHours * 3600000;

  for (const { d, starts } of days) {
    out[d] = starts
      .filter((st) => st.getTime() >= earliest)
      .filter((st) => !blocks.some(([bs, be]) => overlaps(st.getTime() - buffer, st.getTime() + len + buffer, bs, be)))
      .map((st) => ({ start: st.toISOString(), end: new Date(st.getTime() + len).toISOString() }));
  }
  return out;
}

/** Free slots for one date (YYYY-MM-DD in the business time zone). `av` may be passed to avoid re-reading settings. */
export async function freeSlots(dateStr: string, opts: { now?: Date; excludeId?: string; av?: Availability } = {}): Promise<Slot[]> {
  return (await freeSlotsRange([dateStr], opts))[dateStr] ?? [];
}

export async function isSlotFree(start: Date, av?: Availability) {
  const a = av ?? (await getSettings()).availability;
  const slots = await freeSlots(zonedDateStr(start, a.timezone), { av: a });
  return slots.some((s) => s.start === start.toISOString());
}

const DAY_NAMES = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" } as const;
const ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** A short description of the opening hours for the public booking page: "Monday to Friday", "12:00 to 18:00", last start time. */
export function summarize(av: Availability) {
  const open = ORDER.filter((d) => av.days[d].enabled);
  const idx = open.map((d) => ORDER.indexOf(d));
  const contiguous = open.length > 1 && idx[idx.length - 1] - idx[0] === open.length - 1;
  const daysLabel = !open.length ? "Closed" : open.length === 1 ? DAY_NAMES[open[0]] : contiguous ? `${DAY_NAMES[open[0]]} to ${DAY_NAMES[open[open.length - 1]]}` : open.map((d) => DAY_NAMES[d].slice(0, 3)).join(", ");
  const hours = new Set(open.map((d) => `${av.days[d].start}-${av.days[d].end}`));
  const first = open.length ? av.days[open[0]] : null;
  const uniform = hours.size === 1 && first;
  const lastStart = Math.max(0, ...open.map((d) => toMin(av.days[d].end) - av.slotMinutes));
  return {
    daysLabel,
    hoursLabel: uniform && first ? `${first.start} to ${first.end}` : null,
    lastCall: uniform ? fromMin(lastStart) : null,
    openDays: open.map((d) => (ORDER.indexOf(d) + 1) % 7), // 0 = Sunday ... 6 = Saturday, as Date#getUTCDay
    maxDaysAhead: av.maxDaysAhead,
  };
}

/** A booking that overlaps (with buffer) is already there. Used inside the booking transaction. */
export const BOOKING_LOCK = 724100124;
