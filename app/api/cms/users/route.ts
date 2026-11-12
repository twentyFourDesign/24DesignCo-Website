import { api, badRequest, HttpError, isEmail, readJson, requireFields } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { assertCanAssign, createInvite, inviteUrl, USER_COLUMNS } from "@/lib/cms/users";

export const GET = api(async () => {
  await requireApi("admin");
  return { users: await sql`select ${USER_COLUMNS} from cms_users order by created_at asc` };
});

// Invite someone: creates an `invited` user and returns the invite link once (only a hash of it is stored).
export const POST = api(async (req: Request) => {
  const me = await requireApi("admin");
  const b = await readJson(req);
  requireFields(b, ["email", "role"]);
  const email = String(b.email).trim().toLowerCase();
  const role = String(b.role);
  if (!isEmail(email)) throw badRequest("Enter a valid email address");
  assertCanAssign(me, role);
  const [exists] = await sql`select status from cms_users where lower(email) = ${email}`;
  if (exists) throw new HttpError(409, exists.status === "invited" ? "That person has already been invited. Use Resend invite to get a new link." : "That email already has an account");
  const [user] = await sql`insert into cms_users (email, role, name, status) values (${email}, ${role}, ${String(b.name ?? "").trim()}, 'invited') returning ${USER_COLUMNS}`;
  const token = await createInvite(user.id);
  await logActivity(me, "user", `invited to the admin as ${role}`, email, "/admin/settings?tab=users");
  return Response.json({ user, inviteUrl: inviteUrl(req, token) }, { status: 201 });
});
