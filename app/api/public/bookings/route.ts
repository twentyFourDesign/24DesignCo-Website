import { after, NextResponse } from "next/server";
import { api, badRequest, HttpError, isEmail, readJson, requireFields } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { allow, clientIp } from "@/lib/cms/rate";
import { getSettings } from "@/lib/cms/settings";
import { BOOKING_LOCK, isSlotFree } from "@/lib/cms/slots";
import { createCalendarEvent } from "@/lib/cms/googleCalendar";
import { sendBookingEmails } from "@/lib/cms/mail";
import { logActivity } from "@/lib/cms/activity";

const STAGES = ["Just an idea", "Have designs", "Have a prototype", "App already live"];
const TAKEN = "Sorry, that time was just taken. Please choose another.";

// POST /api/public/bookings: the website's free idea review form. No sign-in; rate limited per IP.
export const POST = api(async (req: Request) => {
  if (!(await allow(`booking:${clientIp(req)}`, 10, 3600))) throw new HttpError(429, "Too many booking attempts. Please try again later.");
  const b = await readJson(req);
  if (b.website) throw badRequest("Invalid request"); // honeypot field, hidden from people
  requireFields(b, ["name", "email", "idea", "start"]);
  const email = String(b.email).trim().toLowerCase();
  if (!isEmail(email)) throw badRequest("Enter a valid email address");
  if (String(b.idea).length > 2000 || String(b.name).length > 120) throw badRequest("Please keep your answers shorter");
  const start = new Date(String(b.start));
  if (Number.isNaN(start.getTime())) throw badRequest("Choose a time");

  const { availability: av } = await getSettings();
  if (!(await isSlotFree(start, av))) throw new HttpError(409, TAKEN);
  const end = new Date(start.getTime() + av.slotMinutes * 60000);
  const buffer = av.bufferMinutes * 60000;
  const text = (v: unknown, max: number, fallback = "") => String(v ?? fallback).trim().slice(0, max);

  // The check above is fast but not race-safe on its own. Inside a transaction guarded by an advisory lock, look again for an
  // overlapping booking (with the buffer) so two people choosing the same time cannot both succeed.
  const booking = await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(${BOOKING_LOCK})`;
    const [clash] = await tx`select 1 as x from cms_bookings where status in ('pending','confirmed')
      and start_at < ${new Date(end.getTime() + buffer)} and end_at > ${new Date(start.getTime() - buffer)} limit 1`;
    if (clash) throw new HttpError(409, TAKEN);
    const [row] = await tx`insert into cms_bookings (name, email, phone, company, idea, stage, budget, source, start_at, end_at, status)
      values (${text(b.name, 120)}, ${email}, ${text(b.phone, 60)}, ${text(b.company, 160)}, ${text(b.idea, 2000)}, ${STAGES.includes(String(b.stage)) ? String(b.stage) : "Just an idea"},
        ${text(b.budget, 120, "Not sure yet") || "Not sure yet"}, ${text(b.source, 200)}, ${start}, ${end}, 'confirmed')
      returning id, name, email, phone, idea, stage, budget, source, start_at, end_at`;
    return row;
  });

  let meetLink = "";
  try {
    const ev = await createCalendarEvent({ id: booking.id, name: booking.name, email: booking.email, phone: booking.phone, idea: booking.idea, stage: booking.stage, budget: booking.budget, source: booking.source, startAt: booking.startAt, endAt: booking.endAt });
    if (ev) {
      meetLink = ev.meetLink;
      await sql`update cms_bookings set calendar_event_id = ${ev.id}, meet_link = ${ev.meetLink}, updated_at = now() where id = ${booking.id}`;
    }
  } catch (e) {
    console.warn("Google Calendar event failed:", (e as Error).message);
  }
  after(() => sendBookingEmails({ ...booking, startAt: booking.startAt, meetLink } as Parameters<typeof sendBookingEmails>[0]).catch((e) => console.warn("Booking email failed:", (e as Error).message)));
  await logActivity(null, "booking", "booked an idea review", booking.name, "/admin/bookings");
  return NextResponse.json({ id: booking.id, start: booking.startAt, end: booking.endAt, meetLink, timezone: av.timezone }, { status: 201 });
});
