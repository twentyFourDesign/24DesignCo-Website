import { api, badRequest, notFound, readJson, uuid } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { cancelCalendarEvent } from "@/lib/cms/googleCalendar";
import { BOOKING_STATUSES } from "@/lib/cms/bookings";

type Ctx = { params: Promise<{ id: string }> };

export const GET = api(async (_req: Request, { params }: Ctx) => {
  await requireApi("editor");
  const id = uuid((await params).id);
  const [booking] = id ? await sql`select * from cms_bookings where id = ${id}` : [];
  if (!booking) throw notFound("Booking");
  return { booking };
});

export const PATCH = api(async (req: Request, { params }: Ctx) => {
  const me = await requireApi("editor");
  const id = uuid((await params).id);
  const [b] = id ? await sql`select * from cms_bookings where id = ${id}` : [];
  if (!b) throw notFound("Booking");
  const body = await readJson(req);
  let { status, notes, meetLink, calendarEventId } = b as Record<string, string>;
  const was = status;
  if (body.notes !== undefined) notes = String(body.notes).slice(0, 5000);
  if (body.meetLink !== undefined) {
    meetLink = String(body.meetLink).trim().slice(0, 500);
    if (meetLink && !/^https?:\/\//i.test(meetLink)) throw badRequest("The meeting link must start with http:// or https://");
  }
  if (body.status !== undefined) {
    if (!(BOOKING_STATUSES as readonly string[]).includes(String(body.status))) throw badRequest("Invalid status");
    status = String(body.status);
    // Cancelling also removes the Google Calendar event (and tells the guest). A failure here never blocks the cancel.
    if (status === "cancelled" && was !== "cancelled" && calendarEventId) {
      await cancelCalendarEvent(calendarEventId).then(() => { calendarEventId = ""; }).catch((e) => console.warn("Calendar cancel failed:", (e as Error).message));
    }
  }
  const [booking] = await sql`update cms_bookings set status = ${status}, notes = ${notes}, meet_link = ${meetLink}, calendar_event_id = ${calendarEventId}, updated_at = now() where id = ${b.id} returning *`;
  await logActivity(me, "booking", status !== was ? `marked ${status}` : "updated", `Idea review: ${b.name}`, "/admin/bookings");
  return { booking };
});
