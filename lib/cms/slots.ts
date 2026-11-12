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

/** Free slots for one date (YYYY-MM-DD in the business time zone). `av` may be passed to avoid re-reading settings. */
export async function freeSlots(dateStr: string, opts: { now?: Date; excludeId?: string; av?: Availability } = {}): Promise<Slot[]> {
  const now = opts.now ?? new Date();
  const av = opts.av ?? (await getSettings()).availability;
  const today = zonedDateStr(now, av.timezone);
  if (dateStr < today || dateStr > addDays(today, av.maxDaysAhead)) return [];

  const starts = candidateStarts(dateStr, av);
  if (!starts.length) return [];
  const len = av.slotMinutes * 60000;
  const buffer = av.bufferMinutes * 60000;
  const dayStart = starts[0];
  const dayEnd = new Date(starts[starts.length - 1].getTime() + len);

  const taken = opts.excludeId
    ? await sql`select start_at, end_at from cms_bookings where status in ('pending','confirmed') and id <> ${opts.excludeId} and start_at < ${new Date(dayEnd.getTime() + buffer)} and end_at > ${new Date(dayStart.getTime() - buffer)}`
    : await sql`select start_at, end_at from cms_bookings where status in ('pending','confirmed') and start_at < ${new Date(dayEnd.getTime() + buffer)} and end_at > ${new Date(dayStart.getTime() - buffer)}`;
  const busy = await googleBusy(dayStart, dayEnd).catch(() => []);
  const blocks: Block[] = [...taken.map((t) => ({ start: t.startAt as Date, end: t.endAt as Date })), ...busy];
  const earliest = now.getTime() + av.minNoticeHours * 3600000;

  return starts
    .filter((s) => s.getTime() >= earliest)
    .filter((s) => !blocks.some((b) => overlaps(s.getTime() - buffer, s.getTime() + len + buffer, new Date(b.start).getTime(), new Date(b.end).getTime())))
    .map((s) => ({ start: s.toISOString(), end: new Date(s.getTime() + len).toISOString() }));
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
