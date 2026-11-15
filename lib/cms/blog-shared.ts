// Constants and helpers for the blog and media screens that are safe to import from client components (no database access).
import { tzOffsetMinutes } from "./time";

export const CATEGORIES = ["Costs", "MVP", "How to build", "Hiring", "After launch", "Case studies"] as const;
/** Largest file the admin accepts. Vercel caps a request body at 4.5 MB, so files are sent one at a time and kept under 4 MB. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4 MB";
export const FOLDERS = ["Logos", "Blog images", "Illustrations", "Team photos", "Client logos", "Icons", "Other"] as const;
export const POST_STATUSES = ["draft", "review", "scheduled", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
export const STATUS_LABEL: Record<string, string> = { draft: "Draft", review: "In review", scheduled: "Scheduled", published: "Published" };

export const BLOG_ZONE = "Africa/Lagos";
export const SEO_SUFFIX = " | 24 Design Co.";

export const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
export const readingMinutes = (words: number) => Math.max(1, Math.ceil(words / 220));

/** An instant as "YYYY-MM-DDTHH:mm" in Lagos time, for a datetime-local input. */
export function toLagosInput(iso: string | Date | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: BLOG_ZONE, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** "YYYY-MM-DDTHH:mm" typed in Lagos time -> ISO instant (or "" if empty or invalid). */
export function fromLagosInput(v: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v);
  if (!m) return "";
  const guess = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  return new Date(guess.getTime() - tzOffsetMinutes(guess, BLOG_ZONE) * 60000).toISOString();
}

export const mediaUrl = (m: { id: string; filename: string }) => `/media/${m.id}/${m.filename}`;
export const fmtBytes = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);

export type MediaItem = {
  id: string; filename: string; originalName: string; mimeType: string; size: number; width: number | null; height: number | null;
  alt: string; folder: string; createdAt: string; url: string;
};
export type MediaUsage = { kind: string; title: string; link: string };

export function slugify(s = "") {
  return String(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}
