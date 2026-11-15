/**
 * Section model for CMS pages. Safe to import from client and server code (no database access here).
 * A page is an ordered list of sections: { key, type, label, visible, fields }. The admin editor builds its form from the
 * shape of `fields`, so keep fields flat: strings, booleans, lists of strings, lists of flat objects.
 */

export type Fields = Record<string, unknown>;
export type Section = { key: string; type: SectionType; label: string; visible: boolean; fields: Fields };
export type Seo = { metaTitle?: string; metaDescription?: string; ogImage?: string; noIndex?: boolean };

export const SECTION_TYPE_IDS = [
  "hero", "richText", "cards", "steps", "imageText", "logos", "faq", "cta", "projects", "posts", "team", "bookingForm", "contactForm",
] as const;
export type SectionType = (typeof SECTION_TYPE_IDS)[number];

// ── Small built-in icon set (the icons used on the Services page) ──
export const ICON_PATHS = {
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m21 21-4.3-4.3"],
  rocket: ["M12 3c3 2 5 5 5 9l-2 3H9l-2-3c0-4 2-7 5-9Z", "M12 11a1.5 1.5 0 1 0 0-.01", "M9 15l-2 4M15 15l2 4"],
  user: ["M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M5 21a7 7 0 0 1 14 0"],
  design: ["M3 4h18v12H3z", "M8 20h8M12 16v4"],
  phone: ["M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z", "M11 18h2"],
  code: ["M3 5h18v14H3z", "m9 10-2 2 2 2M15 10l2 2-2 2"],
  cloud: ["M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9.5 4 4 0 0 1 17 18", "M12 12v7m0 0-3-3m3 3 3-3"],
  shield: ["M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z", "m9 12 2 2 4-4"],
  team: ["M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M3 20a6 6 0 0 1 12 0", "M16 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 3 6"],
  refresh: ["M20 12a8 8 0 1 1-3-6.2", "M20 4v4h-4"],
  doc: ["M6 3h9l4 4v14H6z", "M9 11h7M9 15h7M9 19h4"],
  card: ["M3 6h18v12H3z", "M3 10h18M7 15h4"],
  play: ["M3 5h18v12H3z", "m10 8 5 3-5 3z", "M8 21h8"],
  lock: ["M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z", "M10 12h4v3h-4zM11 12v-1a1 1 0 0 1 2 0v1"],
} as const;
export type IconName = keyof typeof ICON_PATHS;
export const ICON_NAMES = Object.keys(ICON_PATHS) as IconName[];

const item = {
  card: { label: "", title: "", text: "", textShort: "", image: "", imageAlt: "", icon: "", time: "", bullets: [] as string[], link: "", linkText: "", highlight: false },
};

type TypeDef = { label: string; description: string; fields: Fields };

export const SECTION_TYPES: Record<SectionType, TypeDef> = {
  hero: {
    label: "Hero", description: "The big banner at the top of a page.",
    fields: {
      eyebrow: "", eyebrowShort: "", heading: "", text: "",
      primaryButtonText: "Book a free idea review", primaryButtonLink: "/contact", secondaryButtonText: "", secondaryButtonLink: "", note: "",
      image: "", imageAlt: "", panelTitle: "", panelItems: [{ title: "", text: "" }], accentLast: true,
    },
  },
  richText: { label: "Text block", description: "A heading and paragraphs.", fields: { eyebrow: "", heading: "", headingSize: "normal", body: "", align: "left", background: "white", spacing: "normal" } },
  cards: {
    label: "Cards", description: "A grid of cards: steps, features, prices, services.",
    fields: { eyebrow: "", heading: "", headingShort: "", headingSize: "normal", intro: "", hideIntroOnMobile: false, background: "white", spacing: "normal", variant: "bordered", columns: "3", titleSize: "xl", footnote: "", items: [item.card] },
  },
  steps: { label: "Steps", description: "Numbered steps in circles.", fields: { eyebrow: "", heading: "", headingSize: "normal", background: "navy", accentLast: true, spacing: "normal", items: [{ title: "", text: "" }] } },
  imageText: {
    label: "Image and text", description: "A picture beside a heading and text.",
    fields: {
      variant: "story", eyebrow: "", heading: "", body: "", image: "", imageAlt: "", imagePosition: "right", background: "white", spacing: "normal",
      tag: "", time: "", icon: "", bulletsTitle: "", bullets: [""], linkText: "", link: "", chips: [""],
    },
  },
  logos: { label: "Logos", description: "Client or partner logos.", fields: { eyebrow: "", heading: "", background: "white", spacing: "normal", items: [{ name: "", logo: "", link: "" }] } },
  faq: {
    label: "Questions", description: "Frequently asked questions, optionally with a tag list beside them.",
    fields: { eyebrow: "", heading: "Common questions", layout: "accordion", background: "white", spacing: "normal", openFirst: true, items: [{ question: "", answer: "" }], asideEyebrow: "", asideHeading: "", asideTags: [""] },
  },
  cta: { label: "Call to action", description: "A closing banner with one button.", fields: { style: "dark", eyebrow: "Let’s work together", heading: "Got an idea you want to build?", text: "Free 30-minute call. No obligation.", buttonText: "Book a free idea review", buttonLink: "/contact", note: "" } },
  projects: {
    label: "Projects list", description: "Cards from Our Work (managed under Our Work).",
    fields: { eyebrow: "", heading: "", headingShort: "", headingSize: "normal", intro: "", show: "featured", layout: "cards", columns: "3", background: "white", spacing: "normal", mobileCount: "3", linkText: "", linkUrl: "" },
  },
  posts: { label: "Blog posts list", description: "Latest blog posts.", fields: { eyebrow: "", heading: "", count: "3", category: "", background: "white", spacing: "normal" } },
  team: { label: "Team", description: "The team, or the founder profile (from Team).", fields: { eyebrow: "", heading: "", show: "founder", background: "cloud", spacing: "normal", quote: "", facts: [{ value: "", label: "" }] } },
  bookingForm: { label: "Booking form", description: "The idea-review booking form.", fields: { heading: "", text: "" } },
  contactForm: { label: "Contact details and form", description: "Phone and email from Settings, plus the contact form.", fields: { heading: "Prefer to write?", text: "", replyNote: "within one business day", background: "cloud", spacing: "normal" } },
};

/** Select fields: `type.field` wins over `field`. */
const opt = (...v: string[]) => v.map((x) => ({ value: x, label: x === "" ? "None" : x.charAt(0).toUpperCase() + x.slice(1).replace(/([A-Z])/g, " $1").toLowerCase().replace(/^./, (c) => c.toUpperCase()) }));
export const FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  background: opt("white", "cloud", "navy"),
  spacing: [{ value: "normal", label: "Normal" }, { value: "large", label: "Large (home page)" }, { value: "top", label: "Large, top only" }],
  "steps.background": opt("navy", "white", "cloud"),
  headingSize: opt("normal", "large"),
  align: opt("left", "center"),
  columns: opt("1", "2", "3", "4"),
  titleSize: opt("lg", "xl", "2xl"),
  "cards.variant": [
    { value: "bordered", label: "Bordered card (logo, label, title, text)" }, { value: "tinted", label: "White tile for grey bands (label, title, text)" },
    { value: "detail", label: "Detail card (label, title, checklist or text)" }, { value: "image", label: "Image on top" },
    { value: "icon", label: "Icon beside text" }, { value: "iconTop", label: "Icon on top (white tile)" },
    { value: "numbered", label: "Numbered 01, 02 …" }, { value: "feature", label: "Large rows with image (alternating)" },
  ],
  "imageText.variant": [{ value: "story", label: "Story (heading, paragraphs)" }, { value: "feature", label: "Feature row (icon, tag, time, checklist)" }],
  imagePosition: opt("right", "left"),
  "projects.show": [{ value: "featured", label: "Featured projects" }, { value: "all", label: "All projects" }, { value: "case-study", label: "Case studies only" }, { value: "partnership", label: "Ongoing partnerships only" }],
  "projects.layout": [{ value: "cards", label: "Cards with a screenshot" }, { value: "partners", label: "Partnership cards (logo, checklist, stats)" }],
  mobileCount: opt("1", "2", "3", "all"),
  "team.show": [{ value: "founder", label: "Founder profile" }, { value: "all", label: "Everyone" }],
  "faq.layout": [{ value: "accordion", label: "Open and close list" }, { value: "cards", label: "Cards" }],
  "cta.style": [{ value: "dark", label: "Dark, centred" }, { value: "band", label: "Blue band, button on the right" }],
  icon: [{ value: "", label: "None" }, ...ICON_NAMES.map((n) => ({ value: n, label: n.charAt(0).toUpperCase() + n.slice(1) }))],
};
export const optionsFor = (type: string, field: string) => FIELD_OPTIONS[`${type}.${field}`] ?? FIELD_OPTIONS[field];

/** Which item fields matter for each card variant (the editor hides the rest). */
export const CARD_ITEM_FIELDS: Record<string, string[]> = {
  bordered: ["image", "imageAlt", "label", "title", "text", "textShort", "link", "linkText"],
  tinted: ["label", "title", "text"],
  detail: ["label", "title", "bullets", "text", "highlight", "link", "linkText"],
  image: ["image", "imageAlt", "label", "title", "text", "bullets"],
  icon: ["icon", "title", "text", "link", "linkText"],
  iconTop: ["icon", "title", "text"],
  numbered: ["title", "text"],
  feature: ["image", "imageAlt", "icon", "label", "time", "title", "text", "bullets", "link", "linkText"],
};

/** Fields shown only for some values of another field, per type: field -> predicate on the section's fields. */
export function fieldShown(type: string, fields: Fields, field: string): boolean {
  const v = fields.variant;
  if (type === "imageText") {
    if (["tag", "time", "icon", "bulletsTitle"].includes(field)) return v === "feature";
    if (field === "chips") return v !== "feature";
  }
  if (type === "cards" && field === "titleSize") return v === "tinted";
  if (type === "projects") {
    if (field === "linkText" || field === "linkUrl") return fields.layout === "partners";
    if (field === "columns") return fields.layout !== "partners";
  }
  if (type === "team" && ["quote", "facts"].includes(field)) return fields.show === "founder";
  if (type === "faq" && ["asideEyebrow", "asideHeading", "asideTags"].includes(field)) return fields.layout !== "cards";
  return true;
}

export const FIELD_HINTS: Record<string, string> = {
  eyebrow: "Small uppercase line above the heading.",
  eyebrowShort: "Optional shorter version shown on phones.",
  headingShort: "Optional shorter heading shown on phones.",
  headingSize: "Large is used for the big headings on the home page.",
  text: "A short paragraph.",
  body: "Paragraphs separated by a blank line. Wrap words in **double stars** for bold.",
  note: "Small line under the buttons.",
  image: "Pick from the media library.",
  panelTitle: "Shows a numbered panel beside the heading on large screens.",
  panelItems: "Rows in the panel.",
  accentLast: "Colour the last number gold.",
  bullets: "One per line item. Add a link with “Text | /path”.",
  textShort: "Optional shorter text shown on phones.",
  highlight: "Grey background to make the card stand out.",
  link: "A page path (/services) or full address.",
  chips: "Short names shown in boxes beside the text.",
  asideTags: "Chips shown beside the questions, for example tools.",
  mobileCount: "How many cards to show on phones.",
  count: "How many posts to show.",
  footnote: "A line of text under the cards.",
  spacing: "Space above and below the section.",
  anchor: "Lets a button link to this section, for example #start.",
  category: "Leave empty for all categories.",
  facts: "Short numbers or facts under the founder profile.",
  quote: "A pull quote under the founder's bio.",
  hideIntroOnMobile: "Hide the intro paragraph on phones.",
  replyNote: "Shown as “Replies: …”.",
  titleSize: "Size of the card title.",
  show: "What to list.",
  time: "A small chip, for example “1 to 2 weeks”.",
};

const rand = () => Math.random().toString(36).slice(2, 8);

export function newSection(type: SectionType, label?: string, patch: Fields = {}): Section {
  const t = SECTION_TYPES[type];
  return { key: `${type}-${rand()}`, type, label: label || t.label, visible: true, fields: { ...structuredClone(t.fields), ...patch } };
}

/** Template for a new list entry, for lists that are currently empty. */
export function itemTemplate(type: string, field: string): unknown {
  const sample = (SECTION_TYPES as Record<string, TypeDef>)[type]?.fields[field];
  if (Array.isArray(sample) && sample.length) return structuredClone(sample[0]);
  return "";
}

export const STARTERS: { id: string; label: string; description: string; build: (title: string) => Section[] }[] = [
  { id: "blank", label: "Blank", description: "A heading banner and a closing call to action.", build: (t) => [newSection("hero", "Hero", { heading: t, primaryButtonText: "", primaryButtonLink: "" }), newSection("cta")] },
  {
    id: "service", label: "Service page", description: "Banner, three detail cards, plans and a call to action.",
    build: (t) => [
      newSection("hero", "Hero", { heading: t, eyebrow: t }),
      newSection("cards", "Details", { variant: "detail", columns: "3", items: [{ ...item.card, label: "What you get", title: "Deliverables", bullets: ["First item", "Second item"] }, { ...item.card, label: "Who it is for", title: "Founders who", bullets: ["First item", "Second item"] }, { ...item.card, label: "Price", title: "Starting from …", text: "Describe the price.", highlight: true }] }),
      newSection("cta"),
    ],
  },
  {
    id: "landing", label: "Landing page", description: "Banner, text, cards, questions and a call to action.",
    build: (t) => [
      newSection("hero", "Hero", { heading: t }),
      newSection("richText", "Introduction", { heading: "A heading", body: "Write a short introduction." }),
      newSection("cards", "Cards", { heading: "Three things to know", variant: "bordered", items: [{ ...item.card, label: "One", title: "First", text: "Text" }, { ...item.card, label: "Two", title: "Second", text: "Text" }, { ...item.card, label: "Three", title: "Third", text: "Text" }] }),
      newSection("faq", "Questions", { items: [{ question: "A question?", answer: "An answer." }] }),
      newSection("cta"),
    ],
  },
];

// ── Paths ──
/** Pages that exist in code-level routes (seeded). They can be edited and unpublished but not deleted or moved. */
export const BUILT_IN_PATHS = ["/", "/services", "/services/discovery-sprint", "/services/mvp-development", "/services/cto-as-a-service", "/how-we-work", "/about", "/contact", "/our-work"];
export const RESERVED_ROOTS = ["admin", "api", "media", "_next", "blog", "our-work"];
export function cleanPath(p: unknown): string {
  let s = String(p ?? "").trim().toLowerCase();
  if (!s.startsWith("/")) s = `/${s}`;
  s = s.replace(/[^a-z0-9/_-]/g, "-").replace(/\/+/g, "/").replace(/-+/g, "-");
  return s.length > 1 ? s.replace(/\/$/, "") : s;
}
/** Paths the public site already serves in code; CMS pages may not use them unless they are the seeded page itself. */
export function pathProblem(path: string): string | null {
  const root = path.split("/")[1] ?? "";
  if (RESERVED_ROOTS.includes(root) && path !== "/our-work") return `“/${root}” is used by another part of the website. Choose a different path.`;
  return null;
}

// ── Validation (used by the API) ──
export class SectionError extends Error {}

export function validateSections(sections: unknown): Section[] {
  if (!Array.isArray(sections)) throw new SectionError("Sections must be a list");
  if (sections.length > 60) throw new SectionError("A page can have at most 60 sections");
  const keys = new Set<string>();
  const out = sections.map((s, i) => {
    if (!s || typeof s !== "object" || Array.isArray(s)) throw new SectionError(`Section ${i + 1} is not valid`);
    const o = s as Record<string, unknown>;
    const type = o.type as SectionType;
    if (!SECTION_TYPE_IDS.includes(type)) throw new SectionError(`Unknown section type “${String(o.type)}”`);
    const key = String(o.key || `${type}-${i}`).slice(0, 60);
    if (keys.has(key)) throw new SectionError(`Two sections share the key “${key}”`);
    keys.add(key);
    if (o.fields !== undefined && (typeof o.fields !== "object" || o.fields === null || Array.isArray(o.fields))) throw new SectionError(`Section “${key}” has invalid fields`);
    return { key, type, label: String(o.label || SECTION_TYPES[type].label).slice(0, 120), visible: o.visible !== false, fields: (o.fields as Fields) ?? {} };
  });
  if (JSON.stringify(out).length > 600_000) throw new SectionError("This page is too large to save");
  return out;
}

export function cleanSeo(seo: unknown): Seo {
  const o = (seo && typeof seo === "object" ? seo : {}) as Record<string, unknown>;
  return {
    metaTitle: String(o.metaTitle ?? "").slice(0, 200), metaDescription: String(o.metaDescription ?? "").slice(0, 400),
    ogImage: String(o.ogImage ?? "").slice(0, 500), noIndex: o.noIndex === true,
  };
}
