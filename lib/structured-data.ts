import { SITE_NAME, SITE_URL } from "@/lib/site";

/** The business, referenced by @id from every other block so search engines join them up. */
export const ORG_ID = `${SITE_URL}/#business`;

export function businessData(s: { email: string; phone: string; seo: { defaultDescription: string }; footer: { social?: Record<string, string> } }) {
  const sameAs = Object.values(s.footer.social ?? {}).filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u));
  // No street address: the business asked for it to be kept off the website.
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: "24 Design Company",
    legalName: "24 Discovery Limited",
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-512.png`,
    image: `${SITE_URL}/og-default.png`,
    description: s.seo.defaultDescription,
    ...(s.email ? { email: s.email } : {}),
    ...(s.phone ? { telephone: s.phone } : {}),
    address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
    areaServed: ["NG", "Worldwide"],
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function breadcrumbData(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path === "/" ? "/" : t.path}`,
    })),
  };
}

/** Plain text from Markdown, for answers inside structured data. */
export function plain(md: string) {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
