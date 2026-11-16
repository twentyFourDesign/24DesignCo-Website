import "./env";
import postgres from "postgres";
import { newSection, type Fields, type Section, type SectionType } from "../lib/cms/sections";

// Turns every hand-coded marketing page into section data and stores it as published. Existing pages are left alone
// (so editors' work is never overwritten); run with --force to reset the seeded pages to the original content.

let n = 0;
const S = (type: SectionType, label: string, fields: Fields): Section => {
  const s = newSection(type, label, fields);
  s.key = `${type}-${++n}`;
  return s;
};
const item = (o: Record<string, unknown>) => ({ label: "", title: "", text: "", textShort: "", image: "", imageAlt: "", icon: "", time: "", bullets: [], link: "", linkText: "", highlight: false, ...o });
const CTA = () => S("cta", "Call to action", { style: "dark", eyebrow: "Let’s work together", heading: "Got an idea you want to build?", text: "Free 30-minute call. No obligation.", buttonText: "Book a free idea review", buttonLink: "/contact" });
const hero = (eyebrow: string, heading: string, text: string) => S("hero", "Hero", { eyebrow, heading, text, primaryButtonText: "", primaryButtonLink: "" });

const steps3 = [
  ["Step 1", "Discovery Sprint", "A clickable prototype, a defined first version and a fixed quote.", "1 to 2 weeks. Prototype, scope, fixed quote."],
  ["Step 2", "MVP Build", "Design, build, test and launch, with a working demo every two weeks.", "8 to 12 weeks. Launch with fortnightly demos."],
  ["Step 3", "CTO Partner", "Roadmap, engineering oversight, security and hiring advice, monthly.", "Monthly leadership after launch."],
];

type Seed = { path: string; title: string; seo: { metaTitle: string; metaDescription: string }; sections: Section[] };
const pages: Seed[] = [];

// ── Home ──
pages.push({
  path: "/", title: "Home",
  seo: { metaTitle: "24 Design Co. | Mobile and web app development in Lagos", metaDescription: "We help founders turn ideas into working mobile and web apps, then stay on as their technical partner. Book a free idea review." },
  sections: [
    S("hero", "Hero", {
      eyebrow: "Mobile and web app development · Lagos", eyebrowShort: "App development · Lagos", heading: "Bring your tech ideas to life.",
      text: "We help founders turn ideas into working mobile and web apps, then stay on as their technical partner. Fixed scope, fortnightly demos, one accountable team.",
      primaryButtonText: "Book a free idea review", primaryButtonLink: "/contact", secondaryButtonText: "See our work", secondaryButtonLink: "/our-work", note: "Free 30-minute call. No obligation.",
      panelTitle: "Your path to launch", panelItems: [{ title: "Discovery Sprint", text: "1 to 2 weeks" }, { title: "MVP Build", text: "8 to 12 weeks" }, { title: "CTO Partner", text: "Monthly, after launch" }], accentLast: true,
    }),
    S("cards", "Three steps", {
      anchor: "services", spacing: "top", heading: "Three steps from first idea to launch", headingShort: "Three steps to launch", headingSize: "large",
      intro: "Plan before you build, launch the smallest version that proves your idea, then keep growing with a technical partner.", hideIntroOnMobile: true,
      variant: "bordered", columns: "3", items: steps3.map(([label, title, text, textShort]) => item({ label, title, text, textShort })),
    }),
    S("projects", "Our work", { anchor: "our-work", spacing: "large", heading: "Products we have taken from idea to launch", headingShort: "Our work", headingSize: "large", show: "featured", layout: "cards", columns: "3", mobileCount: "1" }),
    S("cta", "CTO band", { style: "band", anchor: "about", eyebrow: "", heading: "A technical co-founder without the equity conversation", text: "Launching is the start. We plan your roadmap, oversee engineering and keep your product secure and online.", buttonText: "Talk to us about CTO support", buttonLink: "/services/cto-as-a-service" }),
    S("cta", "Final call to action", { style: "dark", eyebrow: "Let’s work together", heading: "Got an idea you want to build?", text: "In a free 30-minute call, we will tell you honestly what it would take to build, and whether we are the right team.", buttonText: "Book a free idea review", buttonLink: "/contact" }),
  ],
});

// ── Services ──
const IMG = "/services";
pages.push({
  path: "/services", title: "Services",
  seo: { metaTitle: "App Development Services for Startups | 24 Design Co.", metaDescription: "Everything you need to launch and grow your product: Discovery Sprint, MVP development, CTO as a Service and more." },
  sections: [
    S("hero", "Hero", { eyebrow: "Services", heading: "Everything you need to launch and grow your product", text: "Choose where you are: a rough idea, a first build, or a live product that needs a technical partner.", primaryButtonText: "Book a free idea review", primaryButtonLink: "/contact", secondaryButtonText: "Find your starting point", secondaryButtonLink: "#start", image: `${IMG}/hero.jpg`, imageAlt: "A product dashboard and mobile app, live on both stores" }),
    S("cards", "Pick your starting point", {
      anchor: "start", eyebrow: "Where are you now?", heading: "Pick your starting point", variant: "image", columns: "3",
      items: [
        item({ image: `${IMG}/start-idea.jpg`, label: "Launch your idea", title: "You have an idea", text: "Turn it into a clear plan, a prototype and a fixed quote before you spend on code.", bullets: ["Discovery Sprint | /services/discovery-sprint", "MVP Development | /services/mvp-development", "UI/UX Design"] }),
        item({ image: `${IMG}/start-build.jpg`, label: "Build your product", title: "You are ready to build", text: "Get a working mobile or web app your first users can download and use.", bullets: ["Mobile apps (iOS, Android, Flutter)", "Web apps", "Admin dashboards"] }),
        item({ image: `${IMG}/start-live.jpg`, label: "Keep it growing", title: "Your product is live", text: "Keep it fast, secure and improving with a technical partner on your side.", bullets: ["CTO as a Service | /services/cto-as-a-service", "DevOps and cloud", "QA and testing", "Dedicated team", "Legacy software modernization"] }),
      ],
    }),
    S("cards", "Core services", {
      background: "cloud", eyebrow: "Our core services", heading: "From idea to launch, and beyond", variant: "feature",
      items: [
        item({ icon: "search", image: `${IMG}/core-discovery.jpg`, label: "Discovery Sprint", time: "1 to 2 weeks", title: "Know exactly what to build before you build it", text: "We turn your idea into a clickable prototype, a prioritised feature list and a fixed quote, so you start the build with no surprises.", bullets: ["A clickable prototype of the key screens", "User flows and a prioritised feature list", "A timeline and a fixed quote for the MVP", "Technical recommendations for your stack"], link: "/services/discovery-sprint", linkText: "Learn more →" }),
        item({ icon: "rocket", image: `${IMG}/core-mvp.jpg`, label: "MVP Development", time: "8 to 12 weeks", title: "Launch the first version people can actually use", text: "We design, build and launch the smallest version of your product that proves the idea, with a working demo every two weeks.", bullets: ["Mobile app, web app or both", "Admin dashboard to run the business", "Payments, maps or other key integrations", "App Store and Google Play launch"], link: "/services/mvp-development", linkText: "Learn more →" }),
        item({ icon: "user", image: `${IMG}/core-cto.jpg`, label: "CTO as a Service", time: "Monthly", title: "A technical partner for the long run", text: "After launch, we stay on as your technical team: planning the roadmap, keeping the product secure and stable, and shipping improvements.", bullets: ["Roadmap and release planning", "Monitoring, security and backups", "Ongoing features and fixes", "Help hiring and managing developers"], link: "/services/cto-as-a-service", linkText: "Learn more →" }),
      ],
    }),
    S("cards", "All services", {
      eyebrow: "All services", heading: "Everything we do", variant: "icon", columns: "3",
      items: [
        item({ icon: "design", title: "UI/UX Design", text: "Flows, screens and prototypes your users understand at a glance." }),
        item({ icon: "phone", title: "Mobile Apps", text: "Native iOS and Android, or one Flutter codebase for both." }),
        item({ icon: "code", title: "Web Apps", text: "Customer portals, marketplaces, booking and admin systems." }),
        item({ icon: "cloud", title: "DevOps and Cloud", text: "Hosting, deployments, monitoring and backups that just work." }),
        item({ icon: "shield", title: "QA and Testing", text: "Manual and automated testing before every release." }),
        item({ icon: "team", title: "Dedicated Team", text: "Designers and engineers who work as part of your team." }),
        item({ icon: "refresh", title: "Legacy Modernization", text: "Rebuild or upgrade older software without losing your data." }),
        item({ icon: "search", title: "Discovery Sprint", text: "A prototype, scope and fixed quote in 1 to 2 weeks.", link: "/services/discovery-sprint" }),
        item({ icon: "user", title: "CTO as a Service", text: "Senior technical leadership, without a full-time hire.", link: "/services/cto-as-a-service" }),
      ],
    }),
    S("steps", "How it works", { background: "navy", eyebrow: "How it works", heading: "Four steps from idea to live product", accentLast: true, items: [
      { title: "Free idea review", text: "A 30-minute call to understand your idea and goals." }, { title: "Discovery Sprint", text: "Prototype, scope and a fixed quote." },
      { title: "Build", text: "Fortnightly demos of working software." }, { title: "Launch and grow", text: "Go live, then improve with your CTO partner." },
    ] }),
    S("cards", "Every engagement includes", {
      background: "cloud", eyebrow: "Every engagement includes", heading: "No surprises, from day one", variant: "iconTop", columns: "4",
      items: [
        item({ icon: "doc", title: "Fixed scope", text: "You know exactly what you are paying for." }), item({ icon: "card", title: "Milestone payments", text: "Payments tied to working deliverables." }),
        item({ icon: "play", title: "Fortnightly demos", text: "See working progress every two weeks." }), item({ icon: "lock", title: "You own the code", text: "Full source code transferred on final payment." }),
      ],
    }),
    S("faq", "Tools and questions", {
      asideEyebrow: "Tools we build with", asideHeading: "Proven technology, chosen for your product", asideTags: ["Flutter", "iOS", "Android", "React", "Node.js", "MongoDB", "Firebase", "Cloud hosting"],
      eyebrow: "Questions", heading: "Common questions", openFirst: true, items: [
        { question: "I only have an idea. Where do I start?", answer: "Book a free idea review. We will talk through your idea and recommend whether a Discovery Sprint is the right first step." },
        { question: "Do I own the code?", answer: "Yes. The full source code and accounts are transferred to you on final payment." },
        { question: "Can you take over an app someone else built?", answer: "Yes. We review the existing code first, then recommend whether to improve it or rebuild parts of it." },
        { question: "What happens after launch?", answer: "You can continue with CTO as a Service for ongoing support, improvements and technical leadership." },
      ],
    }),
    CTA(),
  ],
});

// ── Service detail pages ──
const PRICE_TEXT = "Tell us your budget on the free idea review. We shape the sprint to fit it and agree a fixed price before we start, credited toward your build if you go ahead with us.";
const detail = (label: string, title: string, bullets: string[], extra: Record<string, unknown> = {}) => item({ label, title, bullets, ...extra });
pages.push({
  path: "/services/discovery-sprint", title: "Discovery Sprint", seo: { metaTitle: "Discovery Sprint for Startups in Lagos | 24 Design Co.", metaDescription: "A 1 to 2 week Discovery Sprint turns your app idea into a clickable prototype, a clear feature list and a fixed quote before you build." },
  sections: [
    hero("Discovery Sprint", "Turn your idea into a clear plan", "In one to two weeks, we shape your idea into a scoped, costed plan you can build with us, fund, or hand to any team."),
    S("cards", "Details", { variant: "detail", columns: "3", items: [
      detail("What you get", "Deliverables", ["Founder workshop", "User flows and clickable prototype", "Prioritized feature list", "Technical approach in plain language", "Timeline and fixed quote"]),
      detail("Who it is for", "Founders who", ["Have an idea but no clear scope", "Need a prototype for investors", "Have quotes they cannot compare"]),
      detail("Price", "Sized to your budget", [], { text: PRICE_TEXT, highlight: true }),
    ] }),
    S("cards", "How it works", { background: "cloud", heading: "How it works", variant: "tinted", columns: "3", titleSize: "xl", items: [item({ label: "Days 1 to 2", title: "Workshop", text: "Users, problem and priorities." }), item({ label: "Days 3 to 7", title: "Design", text: "User journeys and the prototype." }), item({ label: "Week 2", title: "Plan and quote", text: "Scope, approach and fixed quote, presented to you." })] }),
    CTA(),
  ],
});
pages.push({
  path: "/services/mvp-development", title: "MVP Development", seo: { metaTitle: "MVP Development in Lagos for Startups | 24 Design Co.", metaDescription: "Launch the first version of your app in 8 to 12 weeks: design, build, testing and app store launch, with a working demo every two weeks." },
  sections: [
    hero("MVP Development", "Launch your first version in 8 to 12 weeks", "The smallest version of your idea that real users can use, designed, built, tested and launched."),
    S("cards", "Details", { variant: "detail", columns: "3", items: [
      detail("Included", "What is included", ["UI and UX design", "Mobile and web development", "Testing before launch", "App Store and Google Play submission", "Analytics and monitoring", "30 days of post-launch fixes"]),
      detail("Timeline", "8 to 12 weeks", ["Weeks 1 to 2: design and setup", "Weeks 3 to 8: build in two-week cycles", "Weeks 9 to 10: testing", "Weeks 11 to 12: launch"]),
      detail("Payment", "Milestone payments", [], { text: "Tied to working deliverables. You own the code on final payment.", highlight: true }),
    ] }),
    S("cards", "What it costs", { background: "cloud", heading: "What it costs", variant: "tinted", columns: "3", titleSize: "2xl", items: [
      item({ label: "Lean", title: "Sized to your budget", text: "One platform, one main user type, basic admin." }), item({ label: "Standard", title: "Sized to your budget", text: "Mobile app plus admin dashboard, accounts, payments or one integration." }), item({ label: "Advanced", title: "Sized to your budget", text: "Marketplace, several user roles, multiple integrations." }),
    ] }),
    S("cards", "Proof", { variant: "detail", columns: "1", items: [detail("Proof", "Nexuss", [], { text: "From idea to a working MVP on iOS, Android and web in 14 weeks, with 165 screens designed and built.", link: "/our-work/nexuss", linkText: "Read the story →" })] }),
    CTA(),
  ],
});
pages.push({
  path: "/services/cto-as-a-service", title: "CTO as a Service", seo: { metaTitle: "CTO as a Service for Startups in Nigeria | 24 Design Co.", metaDescription: "Senior technical leadership without a full-time CTO: roadmap, engineering oversight, security and hiring support for growing startups." },
  sections: [
    hero("CTO as a Service", "Senior technical leadership without the full-time salary", "A technical partner who owns the technology side of your business, so you can focus on customers and growth."),
    S("cards", "Details", { variant: "detail", columns: "2", items: [
      detail("What your CTO partner does", "Every month", ["Plans your roadmap", "Oversees engineering", "Keeps your product secure and online", "Advises on hiring and vendors", "Prepares you for investor due diligence"]),
      detail("Who it is for", "Founders who", ["Need someone to make technical decisions with them", "Have a launched product that needs oversight", "Want to manage developers with confidence"]),
    ] }),
    S("cards", "Plans", { background: "cloud", heading: "Plans", variant: "tinted", columns: "3", titleSize: "2xl", footnote: "6 month minimum. 30 days notice to end. We agree the monthly fee with you on the free idea review.", items: [
      item({ label: "Maintain", title: "Sized to your budget", text: "Hosting oversight, security updates, bug fixes, monitoring, monthly check-in." }),
      item({ label: "Grow", title: "Sized to your budget", text: "Everything in Maintain, plus 10 development hours a month and roadmap planning." }),
      item({ label: "Lead", title: "Sized to your budget", text: "Everything in Grow, plus senior engineering time and hiring support." }),
    ] }),
    CTA(),
  ],
});

// ── How we work ──
pages.push({
  path: "/how-we-work", title: "How We Work", seo: { metaTitle: "How We Work: Idea to Launch Process | 24 Design Co.", metaDescription: "How we take founders from idea to launch: a free idea review, a Discovery Sprint, the MVP build and ongoing CTO support, with no surprises." },
  sections: [
    hero("How we work", "How we take you from idea to launch", "No surprises: what happens, what it costs and what we need from you."),
    S("cards", "Steps", { variant: "bordered", columns: "4", items: [
      item({ label: "Step 1", title: "Free idea review", text: "30 minutes. We learn your idea, stage, budget and timeline." }), item({ label: "Step 2", title: "Discovery Sprint", text: "1 to 2 weeks. Prototype, scope and a fixed quote." }),
      item({ label: "Step 3", title: "MVP Build", text: "8 to 12 weeks. Design, build, test and launch, with a demo every two weeks." }), item({ label: "Step 4", title: "CTO Partner", text: "Monthly. Ongoing leadership, maintenance and growth." }),
    ] }),
    S("cards", "Communication, payment, ownership", { background: "cloud", variant: "detail", columns: "3", items: [
      detail("Communication", "How we communicate", ["One point of contact", "A demo every two weeks", "A shared project board", "A weekly update"]),
      detail("Payment", "How you pay", ["Discovery: upfront", "MVP: milestone payments", "CTO Partner: monthly", "USD or GBP invoicing available"]),
      detail("Ownership", "What you own", [], { text: "Code, designs and documentation, transferred on final payment." }),
    ] }),
    S("faq", "Frequently asked questions", { heading: "Frequently asked questions", layout: "cards", items: [
      { question: "Will you sign an NDA?", answer: "Yes, before we discuss your idea in detail." }, { question: "Can you work with my existing developers?", answer: "Yes, where it makes sense." }, { question: "What if I run out of budget?", answer: "We plan in stages so you can stop at a clean point." },
    ] }),
    CTA(),
  ],
});

// ── About ──
pages.push({
  path: "/about", title: "About",
  seo: { metaTitle: "About 24 Design Co. | Lagos Software and CTO Partner", metaDescription: "We help founders turn ideas into products, and stay on as their technical team. Meet the founder behind 24 Design Co." },
  sections: [
    hero("About", "We help founders turn ideas into products, and stay on as their technical team.", "Building products and software in Lagos since 2008."),
    S("imageText", "Our story", { variant: "story", eyebrow: "Our story", heading: "A technical partner from the idea stage", body: "Products succeed when a technical partner is involved from the idea stage, not only at the coding stage. So that is how we work: we help you decide what to build, build the first version, and stay with you as it grows.\n\n**Our mission:** to help founders turn ideas into products people use, and to stay on as their technical partner.", image: `${IMG}/about-team.jpg`, imageAlt: "Illustration of the 24 Design Co. team at work", imagePosition: "right" }),
    S("team", "Meet the founder", { show: "founder", background: "cloud", eyebrow: "Meet the founder", quote: "“Your first version should prove your idea. My job is to help you build that version well, and stay with you after it launches.”", facts: [
      { value: "Since 2008", label: "Building digital products" }, { value: "MIT, UNILAG", label: "Master of Information Technology" }, { value: "PhD research", label: "Currently exploring" }, { value: "CTO partner", label: "To growing businesses" },
    ] }),
    S("cards", "What we believe", { eyebrow: "What we believe", heading: "How we work with founders", variant: "numbered", columns: "4", items: [
      item({ title: "Clarity before code", text: "A clear scope saves more than clever engineering." }), item({ title: "Launch small, learn fast", text: "The first version should prove your idea, not hold every feature." }),
      item({ title: "Honest estimates", text: "What it costs, how long it takes and what we would cut." }), item({ title: "We stay", text: "Launch is the start of the work, not the end of it." }),
    ] }),
    S("imageText", "Products we have built", { variant: "story", background: "cloud", eyebrow: "Products we have built", heading: "From first idea to live product", body: "Heritage, hospitality and startups. Each one built from scratch for its own users.", link: "/our-work", linkText: "See our work →", chips: ["Nexuss", "Jara Beach Resort", "Lufasi Lodges"] }),
    CTA(),
  ],
});

// ── Contact ──
pages.push({
  path: "/contact", title: "Contact",
  seo: { metaTitle: "Book a Free Idea Review for Your App | 24 Design Co.", metaDescription: "Pick a free 30-minute slot, tell us what you are building, and we will come prepared with honest advice on what it would take." },
  sections: [
    hero("Book a free idea review", "Let’s talk about your idea.", "Pick a 30-minute slot, tell us a little about what you are building, and we will come prepared with honest advice."),
    S("bookingForm", "Booking form", { heading: "", text: "" }),
    S("contactForm", "Contact details and form", { heading: "Prefer to write?", replyNote: "within one business day", background: "cloud" }),
  ],
});

// ── Our work ──
const BRANDS = [
  { label: "BRAND AND WEBSITE", title: "Ileri Labs", image: "/work/brands/ileri-labs.svg", imageAlt: "Ileri Labs logo", text: "Brand identity and website for Nigeria’s pioneering organic private label manufacturer, which formulates and packages natural skincare and haircare for beauty brands." },
  { label: "BRAND, WEBSITE AND ORDERING", title: "Grillz & Moore", image: "/work/brands/grillz-and-moore.jpg", imageAlt: "Grillz & Moore logo", text: "Brand identity and a website with an online food ordering system for this grill restaurant." },
  { label: "BRAND, WEBSITE AND APP", title: "EveryCation", image: "/work/brands/everycation.svg", imageAlt: "EveryCation logo", text: "Taken from idea to MVP: brand identity, website and mobile app.", link: "/our-work/everycation", linkText: "Read the case study →" },
];
pages.push({
  path: "/our-work", title: "Our Work", seo: { metaTitle: "Our Work: Apps From Idea to Launch | 24 Design Co.", metaDescription: "Products we have taken from idea to launch, from the Nexuss family history platform to booking systems for Jara Beach Resort and Lufasi Lodges." },
  sections: [
    hero("Our work", "Products we have taken from idea to launch", "From the first idea to a live product, and in many cases beyond launch as the technical partner."),
    S("projects", "Startups", { heading: "Startups: idea to launch", show: "case-study", layout: "cards", columns: "2", mobileCount: "all" }),
    S("projects", "Ongoing partnerships", { background: "cloud", eyebrow: "Long-term clients", heading: "Ongoing partnerships", intro: "We built these products from scratch, and we are still their technical partner today.", show: "partnership", layout: "partners", linkText: "Talk to us about CTO support →", linkUrl: "/services/cto-as-a-service" }),
    S("cards", "Brand and design work", { heading: "Brand and design work", variant: "bordered", columns: "3", items: BRANDS.map((b) => item(b)) }),
    CTA(),
  ],
});

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  const force = process.argv.includes("--force");
  let i = 0;
  for (const p of pages) {
    const sections = sql.json(p.sections as never), seo = sql.json(p.seo as never);
    const [ex] = await sql`select id from cms_pages where path = ${p.path}`;
    if (ex && !force) { console.log(`skip ${p.path} (exists)`); i++; continue; }
    await sql`insert into cms_pages (title, path, status, sections, published_sections, seo, published_seo, has_unpublished_changes, published_at, sort_order)
      values (${p.title}, ${p.path}, 'published', ${sections}, ${sections}, ${seo}, ${seo}, false, now(), ${i})
      on conflict (path) do update set title = excluded.title, status = 'published', sections = excluded.sections, published_sections = excluded.published_sections,
        seo = excluded.seo, published_seo = excluded.published_seo, has_unpublished_changes = false, published_at = now(), updated_at = now()`;
    console.log(`${ex ? "reset" : "added"} ${p.path} (${p.sections.length} sections)`);
    i++;
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
