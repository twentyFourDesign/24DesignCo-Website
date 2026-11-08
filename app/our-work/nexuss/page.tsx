import type { Metadata } from "next";
import CaseStudy, { type CaseStudyData } from "@/components/CaseStudy";

export const metadata: Metadata = {
  title: "Nexuss case study | 24 Design Co.",
  description: "How we took Nexuss from a founder's idea to a live heritage platform: brand, 165 screens, the build and the launch campaign.",
};

const data: CaseStudyData = {
  name: "Nexuss",
  eyebrow: "Case study · Heritage platform · Mobile and web",
  title: "Nexuss: one home for Nigeria's family stories, from idea to launch",
  url: "nexussapp.com",
  intro: "We took Nexuss from a founder's idea to a live product. That meant the brand, 165 screens across mobile and web, the build, and the launch campaign.",
  meta: [["Client", "Nexuss"], ["Platforms", "iOS, Android, web"], ["Services", "Discovery, brand, UI/UX, MVP build, launch"], ["Live at", "nexussapp.com"]],
  stats: [["165", "Screens designed: 113 for the mobile app and 52 for the web app"], ["5", "Stages from first workshop to public launch"], ["[X]", "Weeks from idea to launch"], ["[N]", "Families signed up in the first [period]"]],
  idea: {
    title: "Family history in Nigeria lives in people, not records",
    paras: [
      "Most families keep their history in an elder's memory, a photo album and a few certificates. When an elder dies, the stories often go too. The founder wanted one place to map a family's lineage, the places it moved between, and the national events it lived through.",
      "Nexuss puts all three side by side. A family can see that three of their people lived through Independence Day, then read and add what they remember of it.",
    ],
    brief: "Map family lineage, where families moved, and the history around them, in one app.",
    who: "Families in Nigeria building their tree together · Nigerians abroad reconnecting with home · Elders whose stories need recording",
  },
  challenge: {
    title: "Four problems a genealogy app from abroad would miss",
    items: [
      ["Privacy of the living", "Family trees name real, living people. Every public post hides their names by default, and each family controls who sees what."],
      ["Trust in public history", "Country history had to be accurate. Anyone can suggest an entry, but nothing goes public until an admin checks its sources."],
      ["Data costs and patchy networks", "The app keeps working offline, saves recordings on the phone, and waits for Wi-Fi before uploading large files."],
      ["Two currencies, one family", "Pricing is in Naira first, with pounds and dollars for relatives abroad, so one person can pay for the whole family plan."],
    ],
  },
  stages: [
    { no: "01", name: "Discovery", title: "Shape the idea", points: ["Founder workshop", "Who it is for and why", "First-version scope", "UI specification"] },
    { no: "02", name: "Brand", title: "Give it a face", points: ["Logo and lockups", "Colour and type", "Brand manual", "Sizes for web and mobile"] },
    { no: "03", name: "Design", title: "Design every screen", points: ["113 mobile screens", "52 web screens", "Admin review tools", "Light and dark modes"] },
    { no: "04", name: "Build", title: "Build the MVP", points: ["React Native for iOS and Android", "Web app", "Supabase backend", "Offline sync"] },
    { no: "05", name: "Launch", title: "Put it in people's hands", points: ["nexussapp.com live", "Independence 66 campaign", "Launch merchandise", "App store release [date]"] },
  ],
  look: {
    title: "Roots and branches, woven around one family",
    body: "The mark weaves bronze roots and branches around a green core. It reads as a family tree from any side. Emerald comes from the Nigerian flag, bronze from heirlooms and old photographs, and parchment from the paper records families keep.",
    tagline: "Connecting Nigeria's Stories",
    swatches: [["Emerald", "#0E793C"], ["Bronze", "#B08D57"], ["Parchment", "#F9F8F6"], ["Faded bronze", "#E5DECF"], ["Slate", "#1A1C19"]],
    fonts: [["Outfit, for the interface", "Lineage. Culture. Milestone. History."], ["Lora, for the stories", "Lineage. Culture. Milestone. History."]],
  },
  design: {
    eyebrow: "Stage 03 · Product design",
    title: "What we designed, and why",
    body: "We designed the whole product before writing code, so the build team had an answer for every screen. Here are the parts that matter most.",
    features: [
      { eyebrow: "Family tree", title: "A tree the whole family builds together", body: ["Relatives join by invite, claim their own profile and add who they know. Editors and viewers have separate roles, so the tree grows without anyone losing control of it.", "Weekly hints suggest matches from census, church and family records, each with a confidence score."], shot: "[Family tree screenshot]" },
      { eyebrow: "Oral history", title: "Stories kept in the voice that told them", body: ["Families record elders straight from the app, with guided questions to start the conversation. Recordings are saved on the phone first and upload later, so a weak signal never loses a story.", "Each recording is tagged with its language, including Pidgin and Yoruba."], shot: "[Oral history screenshot]" },
      { eyebrow: "Public timeline and country history", title: "Family memories next to national history", body: ["Families can share a story to the public Timeline. Country history is a separate, admin-run section for news, dates, events, government, politics and people.", "Users can suggest entries with a source. An admin checks each one before it goes public, and every verified entry links to the families who remember it."], shot: "[Timeline and country history screenshot]" },
      { eyebrow: "Built for Nigeria", title: "Works offline, priced in Naira", body: ["The tree is saved on the phone and changes sync when a connection returns. A data saver mode waits for Wi-Fi before uploading photos and video.", "The store turns a family tree into things to hold: posters, family books, and printed programmes for funerals, weddings and naming ceremonies."], shot: "[Offline and store screenshot]" },
    ],
  },
  extra: {
    eyebrow: "The web app",
    title: "The same family, on a bigger screen",
    body: ["Most family research happens at a desk. The web app has every mobile feature, plus a desktop dashboard for the admins who check Country history."],
    shots: ["[nexussapp.com/tree screenshot]", "[nexussapp.com/history screenshot]", "[nexussapp.com/admin/review screenshot]"],
  },
  run: {
    title: "Built lean, launched on a date that matters",
    paras: [
      "We built the first version with React Native for iOS and Android, a web app, and a Supabase backend for accounts, data and media. One backend serves every platform.",
      "The launch was tied to Nigeria's 66th Independence anniversary. The Independence 66 campaign invited families to add what their parents and grandparents remembered of 1 October 1960.",
    ],
    liveTitle: "Independence 66",
    liveBody: "A launch campaign built around the one date every Nigerian family has a story about.",
    stack: ["React Native", "Web app", "Supabase", "Offline sync", "Admin dashboard"],
    note: { label: "Launch merchandise", text: "A white tee with the mark and a family-tree graphic on the front. The back carries a QR code to nexussapp.com and the line Made to Preserve. Lineage. Culture. Milestone. History." },
  },
  resultTitle: "Live, and growing family by family",
  results: [["Families", "[N]", "Families with a tree in the first [period]"], ["Stories", "[N]", "Stories and recordings saved"], ["History", "[N]", "Verified Country history entries"], ["Abroad", "[N]%", "Of users outside Nigeria"]],
  quote: "[Quote from the Nexuss team about working with 24 Design Co.]",
  quoteBy: "[Name], [role], Nexuss",
  next: { title: "Sharporders: from idea to App Store and Google Play", href: "/our-work/sharporders" },
};

export default function Page() {
  return <CaseStudy d={data} />;
}
