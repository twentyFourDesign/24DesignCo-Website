import "server-only";
import { sql } from "./db";

export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled", "no-show"] as const;
export type BookingScope = "upcoming" | "past" | "cancelled";
export const parseScope = (v: unknown): BookingScope => (v === "past" || v === "cancelled" ? v : "upcoming");

export type BookingRow = {
  id: string; name: string; email: string; phone: string; company: string; idea: string; stage: string; budget: string; source: string;
  startAt: Date; endAt: Date; status: string; notes: string; meetLink: string; calendarEventId: string; createdAt: Date; updatedAt: Date;
};

/** SQL condition for one tab. Upcoming includes a call that started in the last hour. */
const scopeWhere = (scope: BookingScope) =>
  scope === "past" ? sql`start_at < now() and status <> 'cancelled'`
  : scope === "cancelled" ? sql`status = 'cancelled'`
  : sql`start_at >= now() - interval '60 minutes' and status in ('pending','confirmed')`;

export async function listBookings(scope: BookingScope, q = "") {
  const like = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const search = q ? sql`and (name ilike ${like} or email ilike ${like} or company ilike ${like} or idea ilike ${like} or phone ilike ${like})` : sql``;
  const order = scope === "upcoming" ? sql`start_at asc` : sql`start_at desc`;
  return (await sql`select * from cms_bookings where ${scopeWhere(scope)} ${search} order by ${order} limit 300`) as unknown as BookingRow[];
}

export async function bookingCounts() {
  const [r] = await sql`select
    count(*) filter (where start_at >= now() - interval '60 minutes' and status in ('pending','confirmed'))::int as upcoming,
    count(*) filter (where start_at < now() and status <> 'cancelled')::int as past,
    count(*) filter (where status = 'cancelled')::int as cancelled
    from cms_bookings`;
  return r as unknown as Record<BookingScope, number>;
}
