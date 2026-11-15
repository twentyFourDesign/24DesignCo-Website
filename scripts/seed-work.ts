import "./env";
import postgres from "postgres";
import { data as jara, meta as jaraMeta } from "../lib/seed/case-study-jara-beach-resort";
import { data as lufasi, meta as lufasiMeta } from "../lib/seed/case-study-lufasi-lodges";
import { data as nexuss, meta as nexussMeta } from "../lib/seed/case-study-nexuss";
import { data as everycation, meta as everycationMeta } from "../lib/seed/case-study-everycation";

// Starting content for Our Work and the founder. Safe to re-run: existing rows (matched by slug / the founder flag) are left alone.
const partnerServices = ["Booking system built from scratch", "Maintenance, security monitoring and backups", "Ongoing CTO support and roadmap"];
// "since YYYY-MM" values show a counter that updates every month (see lib/stat-value.ts).
const partnerStats = (since: string) => [{ value: `since ${since}`, label: "As their technology partner" }, { value: "99%", label: "Uptime" }];

const projects = [
  { slug: "nexuss", name: "Nexuss", type: "case-study", tag: "HERITAGE PLATFORM · MOBILE AND WEB", summary: "One home for Nigeria’s family stories. 165 screens and a working MVP for iOS, Android and web.", services: [], logo: "", coverImage: "/work/nexuss-hero.jpg", links: { website: "https://nexussapp.com" }, stats: [], caseStudy: nexuss, meta: nexussMeta, featured: true },
  { slug: "everycation", name: "EveryCation", type: "case-study", tag: "TRAVEL APP · BRAND, MOBILE AND WEB", summary: "A travel app taken from a logo to a working MVP in 12 weeks: the brand, 45 app screens and the console behind them.", services: [], logo: "/work/brands/everycation.svg", coverImage: "/work/everycation/hero.jpg", links: {}, stats: [], caseStudy: everycation, meta: everycationMeta, featured: false },
  { slug: "jara-beach-resort", name: "Jara Beach Resort", type: "partnership", tag: "BOOKING PLATFORM · ONGOING CTO SUPPORT", summary: "A custom booking system for a beach resort, designed around how the resort actually runs, and supported by us since launch.", services: partnerServices, logo: "/work/logo-jara.jpg", coverImage: "/work/jara-hero.jpg", links: { website: "https://booking.jarabeachresort.com" }, stats: partnerStats("2022-02"), caseStudy: jara, meta: jaraMeta, featured: true },
  { slug: "lufasi-lodges", name: "Lufasi Lodges", type: "partnership", tag: "BOOKING PLATFORM · ONGOING CTO SUPPORT", summary: "A custom booking system built from scratch for Lufasi Lodges, and supported by us since launch.", services: partnerServices, logo: "/work/logo-lufasi.jpg", coverImage: "/work/lufasi-hero.jpg", links: { website: "https://booking.lufasilodges.com" }, stats: partnerStats("2026-04"), caseStudy: lufasi, meta: lufasiMeta, featured: true },
];

const founder = {
  name: "Oluwole Olarewaju", role: "Founder and CEO, 24 Design Co.",
  shortBio: "Leads every product from idea review to launch, and stays on as CTO partner.",
  bio: [
    "Oluwole Olarewaju (Wole) is the founder and CEO of 24 Design Co. He has been building digital products since 2008, starting out in project management and media operations, and has led 24 Discovery Limited, the Lagos technology company behind 24 Design Co., since 2012.",
    "Over the years he has taken startup ideas from a first conversation to products live on the App Store and Google Play, designed and built custom booking platforms from scratch, and served as a long-term CTO partner to growing businesses.",
    "Wole holds a Master of Information Technology from the University of Lagos and is currently exploring PhD research in Developing a Socio-technical System for Digitizing Field Data and Modeling Radicalization Pathways to Strengthen Counterterrorism in Sub-Saharan Africa. Today he leads the studio’s work with startups and first-time founders: deciding what to build, launching the first version and growing it after launch.",
  ].join("\n\n"),
  researchArea: "Developing a Socio-technical System for Digitizing Field Data and Modeling Radicalization Pathways to Strengthen Counterterrorism in Sub-Saharan Africa",
  photo: "/services/founder.jpg", photoAlt: "Oluwole Olarewaju", links: { email: "wole@24group.com.ng" },
};

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  let order = 0;
  for (const p of projects) {
    const [exists] = await sql`select 1 from cms_projects where slug = ${p.slug}`;
    if (exists) { order++; continue; }
    await sql`insert into cms_projects (name, slug, type, tag, summary, services, logo, cover_image, links, stats, case_study, seo, featured, status, sort_order)
      values (${p.name}, ${p.slug}, ${p.type}, ${p.tag}, ${p.summary}, ${p.services}, ${p.logo}, ${p.coverImage}, ${sql.json(p.links)}, ${sql.json(p.stats)}, ${sql.json(p.caseStudy as never)},
        ${sql.json({ metaTitle: p.meta.title, metaDescription: p.meta.description })}, ${p.featured}, 'published', ${order++})`;
    console.log("added project", p.name);
  }
  const [f] = await sql`select 1 from cms_team where is_founder = true`;
  if (!f) {
    await sql`insert into cms_team (name, role, short_bio, bio, research_area, photo, photo_alt, links, is_founder, visible, sort_order)
      values (${founder.name}, ${founder.role}, ${founder.shortBio}, ${founder.bio}, ${founder.researchArea}, ${founder.photo}, ${founder.photoAlt}, ${sql.json(founder.links)}, true, true, 0)`;
    console.log("added founder");
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
