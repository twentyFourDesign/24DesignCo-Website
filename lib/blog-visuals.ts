/** How each blog category looks on cards and article headers: a coloured tile with a short glyph. Safe for client and server. */
export type CategoryLook = { bg: string; glyph: string; topic: string; blurb: string };

const LOOKS: Record<string, CategoryLook> = {
  Costs: { bg: "#0F172A", glyph: "₦", topic: "Costs and planning", blurb: "What it costs, how quotes differ and how to plan your budget." },
  MVP: { bg: "#2563EB", glyph: "MVP", topic: "MVP and discovery", blurb: "Scope the smallest version of your idea, and plan before you build." },
  "How to build": { bg: "#1E3A8A", glyph: "</>", topic: "How to build", blurb: "Features, risks and the MVP for ridesharing, fitness, streaming and CRM products." },
  Hiring: { bg: "#1D4ED8", glyph: "+1", topic: "Hiring", blurb: "Freelancer, agency or in-house: who to hire and what to ask them." },
  "After launch": { bg: "#334155", glyph: "↗", topic: "After launch", blurb: "Growth, maintenance and what to build next once real users arrive." },
  "Case studies": { bg: "#0F172A", glyph: "24", topic: "Case studies", blurb: "How products we built went from idea to launch." },
};

export function categoryLook(category: string): CategoryLook {
  return LOOKS[category] ?? { bg: "#1E3A8A", glyph: "</>", topic: category, blurb: `Guides about ${category.toLowerCase()}.` };
}

/** Topic order on the blog: the admin's category order, then anything else. */
export const TOPIC_ORDER = Object.keys(LOOKS);

export function formatBlogDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
