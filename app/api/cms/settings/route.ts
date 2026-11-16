import { api, badRequest, readJson } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { DEFAULT_SETTINGS, getSettings, saveSettings, type Settings } from "@/lib/cms/settings";
import { googleCalendarConfigured } from "@/lib/cms/googleCalendar";
import { logActivity } from "@/lib/cms/activity";
import { bust, TAGS } from "@/lib/cms/revalidate";

const str = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
const SECTIONS = ["site", "navigation", "navButton", "footer", "seoDefaults", "integrations"] as const;

function links(v: unknown, name: string) {
  if (!Array.isArray(v)) throw badRequest(`${name} must be a list`);
  return v.map((l) => {
    const label = str(l?.label, 80), url = str(l?.url, 500);
    if (!label || !url) throw badRequest(`Each ${name} link needs a label and a web address`);
    if (!/^(\/|https?:\/\/|mailto:|tel:|#)/i.test(url)) throw badRequest(`"${url}" is not a valid link. Start with / or https://`);
    return { label, url };
  });
}
const obj = (v: unknown, name: string) => {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw badRequest(`${name} has the wrong shape`);
  return v as Record<string, unknown>;
};

export const GET = api(async () => {
  await requireApi("admin");
  return { settings: await getSettings(), status: { googleCalendarConfigured: googleCalendarConfigured() } };
});

// PATCH any of: site, navigation, navButton, footer, seoDefaults, integrations. Only known fields are kept.
export const PATCH = api(async (req: Request) => {
  const me = await requireApi("admin");
  const b = await readJson(req);
  const s: Settings = await getSettings();
  const changed: string[] = [];
  for (const key of SECTIONS) {
    if (b[key] === undefined) continue;
    const v = b[key];
    if (key === "navigation") s.navigation = links(v, "menu");
    else if (key === "navButton") {
      const o = obj(v, key);
      const [link] = links([{ label: o.label, url: o.url }], "menu button");
      s.navButton = link;
    }
    else if (key === "site") {
      const o = obj(v, key), cur = s.site;
      for (const k of Object.keys(DEFAULT_SETTINGS.site) as (keyof Settings["site"])[]) if (o[k] !== undefined) cur[k] = str(o[k], k === "tagline" ? 200 : 300);
    } else if (key === "footer") {
      const o = obj(v, key);
      if (o.text !== undefined) s.footer.text = str(o.text, 600);
      if (o.links !== undefined) s.footer.links = links(o.links, "footer");
      if (o.social !== undefined) { const so = obj(o.social, "social"); for (const k of ["linkedin", "x", "instagram"] as const) if (so[k] !== undefined) s.footer.social[k] = str(so[k]); }
    } else if (key === "seoDefaults") {
      const o = obj(v, key);
      if (o.titleSuffix !== undefined) s.seoDefaults.titleSuffix = String(o.titleSuffix).slice(0, 80);
      if (o.defaultDescription !== undefined) s.seoDefaults.defaultDescription = str(o.defaultDescription, 400);
      if (o.ogImage !== undefined) s.seoDefaults.ogImage = str(o.ogImage);
    } else {
      const o = obj(v, key), i = s.integrations;
      if (o.googleCalendar) { const g = obj(o.googleCalendar, "googleCalendar"); if (g.enabled !== undefined) i.googleCalendar.enabled = Boolean(g.enabled); if (g.calendarId !== undefined) i.googleCalendar.calendarId = str(g.calendarId, 200); }
      if (o.googleAnalytics) { const g = obj(o.googleAnalytics, "googleAnalytics"); if (g.measurementId !== undefined) { const id = str(g.measurementId, 40); if (id && !/^[A-Za-z0-9-]+$/.test(id)) throw badRequest("The Google Analytics id looks wrong, for example G-XXXXXXXXXX"); i.googleAnalytics.measurementId = id; } }
      if (o.searchConsole) { const g = obj(o.searchConsole, "searchConsole"); if (g.verification !== undefined) { const raw = str(g.verification, 300).trim(); i.searchConsole.verification = (raw.match(/content\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? raw.replace(/^google-site-verification=/i, "")).replace(/["'<>\s]/g, "").slice(0, 200); } }
      if (o.newsletter) { const g = obj(o.newsletter, "newsletter"); if (g.provider !== undefined) i.newsletter.provider = str(g.provider, 60); if (g.listId !== undefined) i.newsletter.listId = str(g.listId, 120); }
    }
    changed.push(key);
  }
  if (changed.length) {
    await saveSettings(s);
    bust(TAGS.settings);
    await logActivity(me, "settings", "updated", `Settings (${changed.join(", ")})`, "/admin/settings");
  }
  return { settings: s };
});
