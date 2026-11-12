import { cacheLife, cacheTag } from "next/cache";
import { getSettings, DEFAULT_SETTINGS } from "./settings";
import { dbConfigured } from "./db";
import { TAGS } from "./revalidate";

/** The parts of the settings the public site needs (menu, footer, contact, analytics). Cached; refreshed when settings are saved. */
export async function getPublicSite() {
  "use cache";
  cacheLife({ revalidate: 300, expire: 3600 });
  cacheTag(TAGS.settings);
  const s = await getSettings();
  return {
    name: s.site.name, email: s.site.email, phone: s.site.phone,
    navigation: s.navigation, navButton: s.navButton,
    footer: s.footer, seo: s.seoDefaults,
    gaId: s.integrations.googleAnalytics.measurementId, searchConsole: s.integrations.searchConsole.verification,
  };
}

/** getPublicSite(), but if the database is unreachable the built-in defaults keep the website working. */
export async function getSiteSafe() {
  try {
    if (dbConfigured()) return await getPublicSite();
  } catch (e) {
    console.error("Could not load site settings:", (e as Error).message);
  }
  const d = DEFAULT_SETTINGS;
  return { name: d.site.name, email: d.site.email, phone: d.site.phone, navigation: d.navigation, navButton: d.navButton, footer: d.footer, seo: d.seoDefaults, gaId: "", searchConsole: "" };
}
