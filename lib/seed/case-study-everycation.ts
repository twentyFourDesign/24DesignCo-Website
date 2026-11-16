import type { CaseStudyData } from "@/components/CaseStudy";

export const meta = { title: "EveryCation Case Study: Travel App to MVP | 24 Design Co.", description: "How we took EveryCation, a travel app, from a logo to a working MVP in 12 weeks: the brand, 45 app screens, an admin console and the platform behind them." };

export const data: CaseStudyData = {
  name: "EveryCation",
  eyebrow: "Case study · Travel · Branding, mobile app and platform",
  title: "EveryCation: a travel app taken from a logo to a working MVP",
  hero: "/work/everycation/hero.jpg",
  intro: "EveryCation started as a logo and an idea: one app where travellers learn from people who have been, plan the trip, save for it and buy what they need. We built the brand, designed the app and the console behind it, and developed the whole platform to MVP.",
  meta: [["Client", "EveryCation"], ["Platforms", "iOS and Android app, web admin console"], ["Services", "Branding, product spec, UI/UX, app and platform build"]],
  stats: [
    ["45", "App screens, from sign-up and travel tips to the wallet and the shop"],
    ["13", "Admin console pages for moderation, money, the marketplace and settings"],
    ["53", "Automated tests on the platform, wallet ledger included"],
    ["12", "Weeks from first sketch to MVP"],
  ],
  idea: {
    title: "Everything a trip needs, in one place",
    paras: [
      "Planning a trip from Nigeria means a dozen tabs: blogs for tips, WhatsApp groups for visa advice, a spreadsheet for the itinerary, a savings app, and a separate shop for travel essentials. Much of the advice comes from people who never made the trip.",
      "EveryCation brings it together in one app built for Nigerian travellers: tips and advice from people who have made the trip, tools to plan it, a way to save for it, and a shop for the essentials.",
    ],
    brief: "Help travellers learn from people who have been, plan the trip, save for it and pay for it, all in one app.",
    who: "Travellers planning their next trip · Travellers sharing what they learned · Creators and influencers selling their itineraries · The team moderating content and handling money",
  },
  challenge: {
    title: "Four products in one app, and every one has to be trusted",
    items: [
      ["Advice people can rely on", "Anyone can post, but advice on visas, money and safety has to come from someone who made the trip, and travellers need to know which is which."],
      ["Real money in a wallet", "Saving and spending in the app means holding customers' money, so every naira has to be accounted for and protected."],
      ["A fair marketplace for plans", "Travellers can earn from the itineraries they create, and that has to be fair to the people who buy them and the people who make them."],
      ["A team that can run it without a developer", "Moderation, finance, shop operations and support each need their own tools, the right level of access, and a record of every action taken."],
    ],
  },
  stagesTitle: "From a logo to an MVP in five stages",
  stages: [
    { no: "01", name: "Brand", title: "Build the brand", points: ["Brand manual from the logo", "Colour, type and voice", "Logo suite and app icon", "Starter UI components"] },
    { no: "02", name: "Design", title: "Design every screen", points: ["Key user journeys", "Mobile app screens", "Admin console", "Design handover"] },
    { no: "03", name: "Specify", title: "Write the rules", points: ["Product spec", "Technical requirements", "Security and data model", "The technology stack"] },
    { no: "04", name: "Build", title: "Build the platform", points: ["iOS and Android app", "Web admin console", "API and wallet ledger", "Maps, calendar and sign-in"] },
    { no: "05", name: "Launch", title: "Test and go live", points: ["Hosting and email", "Testing on real phones", "Payments partner", "App Store and Play Store"] },
  ],
  look: {
    eyebrow: "Stage 01 · The brand",
    title: "Gold for the destination, blues for the journey",
    body: "EveryCation came to us with a logo: a hexagon in two strokes, one gold, one blue. We turned it into a full brand manual, with every colour lifted from the mark, one typeface, a logo suite for every size and surface, and the rules that keep the app consistent as it grows.",
    image: "/work/everycation/logo-suite.jpg",
    swatches: [
      ["Horizon Gold", "#FFC502", "actions"],
      ["Voyage Navy", "#002C82", "brand blocks"],
      ["Open Water", "#004A9B", "icons"],
      ["Atlas Blue", "#1071B8", "links"],
      ["Sky", "#008DD2", "routes"],
      ["Lagoon", "#00B3F1", "map pins"],
      ["Ink", "#262626", "text"],
    ],
    fonts: [["Typeface · Poppins", "Where to next? Reach Ulun Danu before the tour buses."]],
    aside: { label: "Why gold is rare", text: "Gold makes up about 5% of any screen, and each screen gets one gold button, so whatever a traveller should do next is always the first thing they see. The only gradient is the logo's own; big, bright destination photography brings the colour to the rest of the app." },
  },
  design: {
    eyebrow: "Stage 02 · The app",
    title: "What we designed, and why",
    body: "The app is built around three things a traveller does: learn from people who have been, plan the trip, and pay for it. Here is a first look; there is more to see at launch.",
    features: [
      { eyebrow: "Learn", title: "Tips and advice from people who made the trip", body: ["Travellers share what they learned with photos, video and voice, and advice is checked by the moderation team before it is marked Verified."], shot: "/work/everycation/learn.jpg" },
      { eyebrow: "Plan", title: "Every trip in one place, and plans to share", body: ["Trips, bucket lists and calendars live in one timeline, and travellers can share the itineraries they create with others."], shot: "/work/everycation/plan.jpg" },
      { eyebrow: "Save and spend", title: "A travel wallet that saves for the trip", body: ["A travel wallet helps travellers save towards each trip, and the travel shop sells the essentials in naira."], shot: "/work/everycation/save-and-spend.jpg" },
    ],
  },
  extra: {
    eyebrow: "The admin console",
    title: "The whole platform, run from the browser",
    body: ["The console gives the EveryCation team what it needs to moderate content, manage money, run the shop and support travellers. Each role sees only what its job needs, and every action is recorded."],
    shots: [["The EveryCation admin console overview", "/work/everycation/admin-overview.jpg"]],
    caption: "The overview opens on what needs the team's attention today.",
  },
  run: {
    eyebrow: "Stages 03 and 04 · Specify and build",
    title: "One codebase, one source of truth for the money",
    paras: [
      "Before writing code we wrote the product spec and technical requirements: every screen, every money rule and the stack to build it on. The app, the console and the API then went into one TypeScript codebase, sharing the brand's colours and the same validation rules, so the app and the console never disagree.",
      "The wallet runs on a double-entry ledger, so every naira is accounted for and a repeated tap can never charge twice.",
    ],
    stack: ["React Native (Expo)", "TypeScript", "Next.js", "NestJS", "PostgreSQL", "Drizzle ORM", "MapLibre and OpenStreetMap", "Google Calendar", "Google and Apple sign-in", "Tailwind CSS"],
    note: { label: "Changed without a developer", text: "Content, prices and messages to travellers are all managed by the team from the console." },
  },
  resultTitle: "An MVP ready for its first travellers",
  results: [
    ["Brand", "Brand manual", "Logo suite, colour, type, voice and starter components"],
    ["Product", "App and console", "iOS and Android app, web admin console and the API behind them"],
  ],
  quote: "We started with a logo and a long list of ideas. Twelve weeks later we had a brand people recognise, an app that feels like it was made for Nigerian travellers, and a platform our team can run with confidence. Every decision, from the colour of a button to how the wallet keeps money safe, was made with our travellers in mind.",
  quoteBy: "Oluwole Olarewaju, Founder, EveryCation",
  next: { title: "Jara Beach Resort: every way to the beach, booked online", href: "/our-work/jara-beach-resort" },
};
