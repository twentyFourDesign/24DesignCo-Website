import CmsPage from "@/components/sections/CmsPage";
import JsonLd from "@/components/blog/JsonLd";
import { pageMetadata } from "@/lib/cms/pages";
import { getSiteSafe } from "@/lib/cms/site";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const generateMetadata = () => pageMetadata("/");

/** Tells Google who the business is (name, logo, contact, city and social profiles) for its knowledge panel and results. */
async function BusinessData() {
  const s = await getSiteSafe();
  const sameAs = Object.values(s.footer.social ?? {}).filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u));
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#business`,
        name: SITE_NAME,
        legalName: "24 Discovery Limited",
        url: SITE_URL,
        logo: `${SITE_URL}/android-chrome-512.png`,
        image: `${SITE_URL}/og-default.png`,
        description: s.seo.defaultDescription,
        ...(s.email ? { email: s.email } : {}),
        ...(s.phone ? { telephone: s.phone } : {}),
        address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
        areaServed: "NG",
        ...(sameAs.length ? { sameAs } : {}),
      }}
    />
  );
}

export default function Page() {
  return (
    <>
      <BusinessData />
      <CmsPage path="/" />
    </>
  );
}
