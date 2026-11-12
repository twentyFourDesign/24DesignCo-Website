/**
 * The website's public address, used for canonical links, the sitemap and share previews.
 * Order: SITE_URL (set it once the real domain is connected) → the Vercel production domain (automatic, so it follows the
 * domain you attach in Vercel) → localhost for development.
 */
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
export const SITE_URL = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || fromVercel || "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "24 Design Co.";
export const SITE_TAGLINE = "Mobile and web app development in Lagos";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
