import { api, badRequest, isEmail, readJson } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { getSettings, saveSettings } from "@/lib/cms/settings";
import { logActivity } from "@/lib/cms/activity";

export const GET = api(async () => {
  await requireApi("editor");
  const s = await getSettings();
  return { alertEmail: s.messages.alertEmail, emailConfigured: Boolean(process.env.SMTP_URL) };
});

// Only admins change where messages are emailed.
export const PUT = api(async (req: Request) => {
  const me = await requireApi("admin");
  const b = await readJson(req);
  const e = String(b.alertEmail ?? "").trim();
  if (e && !isEmail(e)) throw badRequest("Enter a valid email address, or leave it empty to stop emails");
  const s = await getSettings();
  s.messages.alertEmail = e;
  await saveSettings(s);
  await logActivity(me, "settings", "updated", "Where website messages are emailed", "/admin/messages");
  return { alertEmail: e };
});
