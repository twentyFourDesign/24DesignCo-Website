import { NextResponse } from "next/server";
import { api, badRequest, HttpError, isEmail, readJson } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { allow, clientIp } from "@/lib/cms/rate";
import { logActivity } from "@/lib/cms/activity";

const NEWSLETTER_STAGE = "Newsletter";

// POST /api/public/subscribe: "One practical tip a month" on the blog. Saved to the admin (Messages) as a newsletter sign-up.
export const POST = api(async (req: Request) => {
  if (!(await allow(`subscribe:${clientIp(req)}`, 5, 3600))) throw new HttpError(429, "Too many sign-ups from your connection. Please try again later.");
  const b = await readJson(req);
  if (b.website) throw badRequest("Invalid request"); // honeypot field, hidden from people
  const email = String(b.email ?? "").trim().toLowerCase().slice(0, 200);
  if (!isEmail(email)) throw badRequest("Enter a valid email address");
  const [existing] = await sql`select id from cms_messages where email = ${email} and stage = ${NEWSLETTER_STAGE} limit 1`;
  if (!existing) {
    await sql`insert into cms_messages (name, email, message, stage, page)
      values ('Newsletter sign-up', ${email}, 'Please send me one practical tip a month.', ${NEWSLETTER_STAGE}, ${String(b.page ?? "").slice(0, 200)})`;
    await logActivity(null, "message", "signed up for the newsletter", email, "/admin/messages");
  }
  return NextResponse.json({ ok: true }, { status: 201 });
});
