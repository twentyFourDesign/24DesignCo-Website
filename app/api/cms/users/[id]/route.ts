import { api, badRequest, forbidden, notFound, readJson, uuid } from "@/lib/cms/http";
import { endSessions, requireApi } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { logActivity } from "@/lib/cms/activity";
import { assertCanAssign, canManage, ownerCount, USER_COLUMNS } from "@/lib/cms/users";

type Ctx = { params: Promise<{ id: string }> };

async function target(id: string | null) {
  const [u] = id ? await sql`select id, name, email, role, status from cms_users where id = ${id}` : [];
  if (!u) throw notFound("User");
  return u;
}

export const PATCH = api(async (req: Request, { params }: Ctx) => {
  const me = await requireApi("admin");
  const u = await target(uuid((await params).id));
  if (u.id === me.id) throw badRequest("Use your profile to change your own account");
  if (!canManage(me, u.role)) throw forbidden("You cannot manage this person");
  const b = await readJson(req);
  let { role, status, name } = u as Record<string, string>;
  if (b.role !== undefined) {
    role = String(b.role);
    assertCanAssign(me, role);
  }
  if (b.status !== undefined) {
    status = String(b.status);
    if (!["active", "disabled"].includes(status)) throw badRequest("Invalid status");
    if (u.status === "invited") throw badRequest("Invited people become active when they accept");
  }
  if (b.name !== undefined) name = String(b.name).trim();
  // The last active owner can be neither demoted nor disabled, so someone always keeps full access.
  if (u.role === "owner" && (role !== "owner" || status !== "active") && (await ownerCount()) <= 1) throw badRequest("You cannot change the last owner");
  const [user] = await sql`update cms_users set role = ${role}, status = ${status}, name = ${name}, updated_at = now() where id = ${u.id} returning ${USER_COLUMNS()}`;
  if (status === "disabled" && u.status !== "disabled") await endSessions(u.id);
  await logActivity(me, "user", role !== u.role ? `changed role to ${role} for` : status !== u.status ? `${status === "disabled" ? "disabled" : "re-enabled"}` : "updated", u.email, "/admin/settings?tab=users");
  return { user };
});

export const DELETE = api(async (_req: Request, { params }: Ctx) => {
  const me = await requireApi("admin");
  const u = await target(uuid((await params).id));
  if (u.id === me.id) throw badRequest("You cannot remove yourself");
  if (!canManage(me, u.role)) throw forbidden("You cannot manage this person");
  if (u.role === "owner" && u.status === "active" && (await ownerCount()) <= 1) throw badRequest("You cannot remove the last owner");
  await sql`delete from cms_users where id = ${u.id}`;
  await logActivity(me, "user", "removed", u.email, "/admin/settings?tab=users");
  return { ok: true };
});
