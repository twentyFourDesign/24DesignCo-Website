export const ROLES = ["author", "editor", "admin", "owner"] as const;
export type Role = (typeof ROLES)[number];
export const rank = (r: string | undefined | null) => ROLES.indexOf(r as Role);
export const atLeast = (r: string | undefined | null, min: Role) => rank(r) >= rank(min);
export const can = atLeast;
export const ROLE_INFO: Record<Role, string> = {
  owner: "Everything, including users.",
  admin: "All content, settings and users (except admins).",
  editor: "Pages, blog, Our Work, team, media and bookings.",
  author: "Writes blog drafts and sends them for review.",
};
