import "server-only";
import type { calendar_v3 } from "googleapis";
import { getSettings } from "./settings";

// Optional Google Calendar sync. Works when GOOGLE_SERVICE_ACCOUNT_JSON and a calendar id are configured and the integration is switched
// on in Settings. Without them, bookings are still saved; they are just not pushed to Google. Every call here is failure-tolerant for callers.
let clientPromise: Promise<calendar_v3.Calendar> | null = null;

async function getCalendar() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  const s = await getSettings();
  if (!s.integrations.googleCalendar.enabled) return null;
  const calendarId = s.integrations.googleCalendar.calendarId || process.env.GOOGLE_CALENDAR_ID || "";
  if (!calendarId) return null;
  clientPromise ??= (async () => {
    const { google } = await import("googleapis");
    const creds = JSON.parse(raw);
    const auth = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar"],
      subject: process.env.GOOGLE_IMPERSONATE_USER || undefined, // needed for Meet links on Workspace
    });
    return google.calendar({ version: "v3", auth });
  })();
  return { cal: await clientPromise, calendarId };
}

export const googleCalendarConfigured = () => Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

export async function googleBusy(timeMin: Date, timeMax: Date): Promise<{ start: string; end: string }[]> {
  const g = await getCalendar();
  if (!g) return [];
  const r = await g.cal.freebusy.query({ requestBody: { timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), items: [{ id: g.calendarId }] } });
  return (r.data.calendars?.[g.calendarId]?.busy ?? []).flatMap((b) => (b.start && b.end ? [{ start: b.start, end: b.end }] : []));
}

export type EventBooking = { id: string; name: string; email: string; phone: string; idea: string; stage: string; budget: string; source: string; startAt: Date; endAt: Date };

export async function createCalendarEvent(b: EventBooking): Promise<{ id: string; meetLink: string } | null> {
  const g = await getCalendar();
  if (!g) return null;
  const r = await g.cal.events.insert({
    calendarId: g.calendarId,
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: `Idea review: ${b.name}`,
      description: `Idea: ${b.idea}\nStage: ${b.stage}\nBudget: ${b.budget}\nPhone: ${b.phone}\nFound us: ${b.source}`,
      start: { dateTime: b.startAt.toISOString() },
      end: { dateTime: b.endAt.toISOString() },
      attendees: [{ email: b.email, displayName: b.name }],
      conferenceData: { createRequest: { requestId: b.id, conferenceSolutionKey: { type: "hangoutsMeet" } } },
    },
  });
  return { id: r.data.id ?? "", meetLink: r.data.hangoutLink ?? "" };
}

export async function cancelCalendarEvent(eventId: string) {
  const g = await getCalendar();
  if (!g || !eventId) return;
  await g.cal.events.delete({ calendarId: g.calendarId, eventId, sendUpdates: "all" });
}
