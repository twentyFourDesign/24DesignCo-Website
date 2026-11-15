import { after, NextResponse } from "next/server";
import { api, badRequest, HttpError, isEmail, readJson, requireFields } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { allow, clientIp } from "@/lib/cms/rate";
import { CONTACT_STAGES } from "@/lib/cms/messages";
import { sendMessageEmail } from "@/lib/cms/mail";
import { logActivity } from "@/lib/cms/activity";

// POST /api/public/contact: the website's "Prefer to write?" form. Saved to the admin (Messages) and emailed to the alert address.
export const POST = api(async (req: Request) => {
  if (!(await allow(`contact:${clientIp(req)}`, 5, 3600))) throw new HttpError(429, "Too many messages from your connection. Please try again later, or email us directly.");
  const b = await readJson(req);
  if (b.website) throw badRequest("Invalid request"); // honeypot field, hidden from people
  requireFields(b, ["name", "email", "message"]);
  const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const email = text(b.email, 200).toLowerCase();
  if (!isEmail(email)) throw badRequest("Enter a valid email address");
  if (String(b.message).length > 4000 || String(b.name).length > 120) throw badRequest("Please keep your message shorter");
  const m = {
    name: text(b.name, 120), email, whatsapp: text(b.whatsapp, 40), message: text(b.message, 4000),
    stage: CONTACT_STAGES.includes(String(b.stage)) ? String(b.stage) : "", page: text(b.page, 200),
  };
  const [row] = await sql`insert into cms_messages (name, email, whatsapp, message, stage, page)
    values (${m.name}, ${m.email}, ${m.whatsapp}, ${m.message}, ${m.stage}, ${m.page}) returning id`;
  after(() => sendMessageEmail(m).catch((e) => console.warn("Message email failed:", (e as Error).message)));
  await logActivity(null, "message", "sent a message", m.name, "/admin/messages");
  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
});
