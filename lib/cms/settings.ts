import "server-only";
import { sql } from "./db";

type Day = { enabled: boolean; start: string; end: string };
type Link = { label: string; url: string };

export type Settings = {
  site: { name: string; tagline: string; email: string; phone: string; address: string; registeredName: string; rcNumber: string; tin: string };
  navigation: Link[];
  navButton: { label: string; url: string };
  footer: { text: string; links: Link[]; social: { linkedin: string; x: string; instagram: string } };
  seoDefaults: { titleSuffix: string; defaultDescription: string; ogImage: string };
  availability: {
    timezone: string; slotMinutes: number; bufferMinutes: number; minNoticeHours: number; maxDaysAhead: number; alertEmail: string;
    days: Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", Day>;
  };
  /** Where messages from the website's contact form are emailed. */
  messages: { alertEmail: string };
  integrations: {
    googleCalendar: { enabled: boolean; calendarId: string };
    googleAnalytics: { measurementId: string };
    searchConsole: { verification: string };
    newsletter: { provider: string; listId: string };
  };
};

const day = (enabled: boolean): Day => ({ enabled, start: "12:00", end: "18:00" });

export const DEFAULT_SETTINGS: Settings = {
  // The street address is left blank on purpose: the business asked for it to be removed from the website.
  site: { name: "24 Design Co.", tagline: "Bring your tech ideas to life.", email: "info@24group.com.ng", phone: "+234 70445 44455", address: "", registeredName: "24 Discovery Limited", rcNumber: "1733408", tin: "23738513-0001" },
  navigation: [
    { label: "Services", url: "/services" }, { label: "How We Work", url: "/how-we-work" }, { label: "Our Work", url: "/our-work" },
    { label: "Blog", url: "/blog" }, { label: "About", url: "/about" },
  ],
  navButton: { label: "Book a free idea review", url: "/contact" },
  footer: { text: "24 Design Co. is a trading name of 24 Discovery Limited, RC 1733408.", links: [{ label: "Contact", url: "/contact" }, { label: "Privacy", url: "/privacy" }], social: { linkedin: "", x: "", instagram: "" } },
  seoDefaults: { titleSuffix: " | 24 Design Co.", defaultDescription: "We help founders in Lagos turn ideas into launched mobile and web products, and stay on as their technical partner.", ogImage: "" },
  availability: {
    timezone: "Africa/Lagos", slotMinutes: 30, bufferMinutes: 15, minNoticeHours: 12, maxDaysAhead: 42, alertEmail: "wole@24group.com.ng",
    days: { mon: day(true), tue: day(true), wed: day(true), thu: day(true), fri: day(true), sat: day(false), sun: day(false) },
  },
  messages: { alertEmail: "wole@24group.com.ng" },
  integrations: { googleCalendar: { enabled: false, calendarId: "" }, googleAnalytics: { measurementId: "" }, searchConsole: { verification: "" }, newsletter: { provider: "", listId: "" } },
};

function merge<T>(base: T, over: unknown): T {
  if (Array.isArray(base) || typeof base !== "object" || base === null) return (over === undefined || over === null ? base : over) as T;
  const o = (over && typeof over === "object" ? over : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(base as object)) out[k] = merge((base as Record<string, unknown>)[k], o[k]);
  return out as T;
}

/** All site settings, with defaults filled in for anything not yet saved. */
export async function getSettings(): Promise<Settings> {
  const [row] = await sql`select data from cms_settings where singleton = 'site'`;
  return merge(DEFAULT_SETTINGS, row?.data);
}

export async function saveSettings(next: Settings) {
  await sql`insert into cms_settings (singleton, data, updated_at) values ('site', ${sql.json(next as never)}, now())
    on conflict (singleton) do update set data = excluded.data, updated_at = now()`;
}
