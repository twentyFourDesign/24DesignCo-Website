import "server-only";
import { SITE_URL } from "@/lib/site";
import nodemailer, { type Transporter } from "nodemailer";
import { getSettings } from "./settings";

// Optional email: a booking alert to the team and a confirmation to the founder. Set SMTP_URL (e.g. smtps://user:pass@smtp.zoho.com:465)
// and MAIL_FROM to turn it on. Without SMTP_URL nothing is sent and nothing fails.
let transport: Transporter | null = null;
function getTransport() {
  if (!process.env.SMTP_URL) return null;
  return (transport ??= nodemailer.createTransport(process.env.SMTP_URL));
}

/** "Lagos time" for Africa/Lagos, otherwise the zone's own city name. */
const zoneLabel = (tz: string) => `${(tz.split("/").pop() ?? tz).replace(/_/g, " ")} time`;

const fmt = (d: Date, tz: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(d);

export type MailBooking = { name: string; email: string; phone: string; idea: string; stage: string; budget: string; source: string; startAt: Date; meetLink: string };

export async function sendBookingEmails(b: MailBooking) {
  const t = getTransport();
  if (!t) return;
  const s = await getSettings();
  const from = process.env.MAIL_FROM || `${s.site.name} <${s.site.email}>`;
  const when = `${fmt(b.startAt, s.availability.timezone)} (${zoneLabel(s.availability.timezone)})`;
  const meet = b.meetLink ? `\nJoin with Google Meet: ${b.meetLink}` : "";
  await Promise.all([
    s.availability.alertEmail &&
      t.sendMail({
        from, to: s.availability.alertEmail, replyTo: b.email,
        subject: `New idea review: ${b.name}, ${when}`,
        text: `${b.name} (${b.email}${b.phone ? `, ${b.phone}` : ""}) booked a free idea review for ${when}.\n\nIdea: ${b.idea}\nStage: ${b.stage}\nBudget: ${b.budget}\nFound us: ${b.source || "-"}${meet}\n\nOpen in the admin: ${SITE_URL}/admin/bookings`,
      }),
    t.sendMail({
      from, to: b.email, replyTo: s.site.email,
      subject: "Your free idea review with 24 Design Co. is booked",
      text: `Hi ${b.name.split(" ")[0]},\n\nThanks for booking a free idea review. We will talk on ${when}.${meet}\n\nIf you need to change the time, reply to this email.\n\n${s.site.name}\n${s.site.phone}`,
    }),
  ]);
}

export type MailMessage = { name: string; email: string; whatsapp: string; message: string; stage: string; page: string };

/** Emails a contact-form message to the alert address set in the admin (Messages). Reply goes straight to the sender. */
export async function sendMessageEmail(m: MailMessage) {
  const t = getTransport();
  if (!t) return false;
  const s = await getSettings();
  const to = s.messages.alertEmail;
  if (!to) return false;
  const from = process.env.MAIL_FROM || `${s.site.name} <${s.site.email}>`;
  await t.sendMail({
    from, to, replyTo: m.email,
    subject: `New message from ${m.name} (website)`,
    text: `${m.name} sent a message from the website${m.page ? ` (${m.page})` : ""}.\n\nEmail: ${m.email}\nWhatsApp: ${m.whatsapp || "-"}\nStage: ${m.stage || "-"}\n\nWhat they are building:\n${m.message}\n\nReply to this email to answer them, or open the admin: ${SITE_URL}/admin/messages`,
  });
  return true;
}
