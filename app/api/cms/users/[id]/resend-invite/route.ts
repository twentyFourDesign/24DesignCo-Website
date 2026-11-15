import { api, badRequest, forbidden, notFound, uuid } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { canManage, createInvite, inviteUrl } from "@/lib/cms/users";

// Makes a new invite link (the old one stops working) and returns it once.
export const POST = api(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const me = await requireApi("admin");
  const id = uuid((await params).id);
  const [u] = id ? await sql`select id, email, role, status from cms_users where id = ${id}` : [];
  if (!u) throw notFound("User");
  if (!canManage(me, u.role)) throw forbidden("You cannot manage this person");
  if (u.status !== "invited") throw badRequest("This person has already joined");
  const token = await createInvite(u.id);
  await logActivity(me, "user", "sent a new invite to", u.email, "/admin/settings?tab=users");
  return { inviteUrl: inviteUrl(req, token) };
});
