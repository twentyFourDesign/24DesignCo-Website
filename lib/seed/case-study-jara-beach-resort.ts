import type { CaseStudyData } from "@/components/CaseStudy";

export const meta = { title: "Jara Beach Resort Case Study: Booking System | 24 Design Co.", description: "How we took Jara Beach Resort from an idea to one booking system for overnight stays, day passes, retreats and live events." };

export const data: CaseStudyData = {
  name: "Jara Beach Resort",
  eyebrow: "Case study · Hospitality · Web app",
  title: "Jara Beach Resort: every way to the beach, booked online, from idea to launch",
  url: "booking.jarabeachresort.com",
  hero: "/work/jara-hero.jpg",
  intro: "We took Jara Beach Resort from an idea to one booking system for overnight stays, day passes, retreats and live events. That meant the guest booking flow, the back office behind it, the build, and running it after launch.",
  meta: [["Client", "Jara Beach Resort"], ["Platforms", "Web: guest booking and back office"], ["Services", "Discovery, UI/UX, web app build, launch, CTO as a Service"], ["Live at", "booking.jarabeachresort.com"]],
  stats: [["4", "Ways to book: overnight, day pass, retreats and live events"], ["13", "Back-office modules, from guests and staff to payments and Club 100"], ["12", "Weeks from the old booking system to a new property management system"]],
  idea: {
    title: "A beach resort sells far more than rooms",
    paras: [
      "Jara Beach Resort, a Lagos beach resort since 2019, offers overnight stays across room types from studios to ocean deluxe, day passes for a few hours on the sand, wellness retreats, and live music nights like Mádé Kuti at the Beach.",
      "Each one used to need its own enquiry. The resort wanted guests to book any of them online, and wanted management to see revenue, occupancy and every guest's history in one place.",
    ],
    brief: "One booking system for every way guests come to Jara, and a back office that knows each guest by name.",
    who: "Couples and families planning a beach weekend · Day visitors and retreat groups · Fans booking a concert night · The front desk and management running the resort",
  },
  challenge: {
    title: "Four things an off-the-shelf hotel booking engine would get wrong",
    items: [
      ["Four products, one checkout", "A night's stay, a day pass, a retreat and a concert ticket each work differently, but guests expect to book all of them the same way."],
      ["Prices that change with the week", "Weeknights are 10% cheaper and weekends 10% dearer. Holiday dates, vouchers, multi-night discounts and 12.5% VAT all have to land in one correct total."],
      ["Payments that don't always go through", "When a card payment fails halfway, the team needs to see it, follow up with the guest and close it off, not find out at the front desk."],
      ["Guests who come back", "Regulars expect to be remembered: their usual spa slot, a birthday on this visit, how they like to be contacted. And the team needs a way to flag the few guests it won't host again."],
    ],
  },
  stages: [
    { no: "01", name: "Discovery", title: "Shape the idea", points: ["Workshop with management", "Every product the resort sells", "Rate, discount and tax rules", "First-version scope"] },
    { no: "02", name: "Design", title: "Design every step", points: ["Four ways in, one flow", "Pending reservation panel", "Back-office dashboard", "Built on the Jara brand"] },
    { no: "03", name: "Build", title: "Build the system", points: ["MERN stack", "Peak and off-peak pricing", "Payments and booking logs", "Guest profiles and notes"] },
    { no: "04", name: "Launch", title: "Go live", points: ["Tests with real bookings", "booking.jarabeachresort.com live", "Staff training", "Launch date [date]"] },
    { no: "05", name: "Run", title: "Keep it growing", points: ["CTO as a Service retainer", "Hosting and support", "New products and events", "Reporting for management"] },
  ],
  look: {
    title: "Sea glass, sky and a clear next step",
    body: "The booking site takes its colours from the resort's own brand: a soft sea-glass green across the page, a lagoon blue for the step you're on, and near-black for what's done. The back office keeps the same calm palette, with an ocean blue for charts.",
    tagline: "Indulgent Escapes",
    swatches: [["Sea glass", "#9DD4D3"], ["Lagoon", "#75A9BF"], ["Mist", "#EBF9FF"], ["Ocean", "#6188C0", "charts"], ["Ink", "#111111"]],
  },
  design: {
    eyebrow: "Stage 03 · The booking flow",
    title: "What we designed, and why",
    body: "Guests pick how they're coming, then move through five clear steps. A booking panel follows them the whole way, so they always know what they've chosen and what it costs.",
    steps: [["Step 1", "Guests", "Who's coming, with children's ages to set the price and which rooms fit."], ["Step 2", "Dates and room", "Available dates first, then the rooms free for them."], ["Step 3", "Food and drinks", "Meal and drinks packages added before arrival."], ["Step 4", "Extras", "Spa, experiences and activities, each with a day and time."], ["Step 5", "Your details", "Contact details and a photo ID, to speed up check-in."]],
    gallery: {
      title: "The guest side, screen by screen",
      shots: [
        ["Home: four ways to book", "/work/jara/home.jpg"],
        ["Overnight stay: who's coming", "/work/jara/guests.jpg"],
        ["Day pass: date, rates and extras", "/work/jara/day-pass-date-extras.jpg"],
        ["Extras: a day and time for each", "/work/jara/extras.jpg"],
        ["Your details: photo ID before arrival", "/work/jara/day-pass-details.jpg"],
      ],
    },
    features: [
      { eyebrow: "Dates and rooms", title: "Weekday deals the guest can see", body: ["A “See available dates” button shows open dates before a guest tries to pick, so nobody gets stuck on a full weekend.", "The reservation panel counts off-peak nights (Sunday to Thursday, 10% off) and peak nights (Friday and Saturday, 10% more) as the dates change, so the price never needs explaining."], shot: "/work/jara/rooms.jpg" },
      { eyebrow: "The back office", title: "The whole resort, run from one dashboard", body: ["Thirteen modules cover bookings, booking logs, guests, blacklisted guests, staff, tasks, vouchers and discounts, payments, the Club 100 membership, settings and an admin audit log."], shot: "[Back-office dashboard screenshot]" },
      { eyebrow: "Dashboard", title: "The numbers a hotel manager actually uses", body: ["Beyond bookings and revenue, the dashboard tracks average daily rate, GOPPAR and TRevPAR, occupancy against cancellations, average length of stay and how far ahead guests book.", "Occupancy is broken down by room type, and day passes, retreats and manual bookings each get their own count."], shot: "[Dashboard metrics screenshot]" },
      { eyebrow: "Guest record", title: "Every guest, remembered", body: ["Each booking opens into one page: who the guest is, how they found Jara, how they like to be contacted, the full cost breakdown and the payment.", "Staff add special-occasion notes and “The Usual”, like a 2 pm spa session on day one, so a returning guest is looked after without asking twice.", "Check-in, check-out and post-stay feedback all happen from the same screen."], shot: "[Guest record screenshot]" },
    ],
  },
  extra: {
    eyebrow: "Staying in control",
    title: "Resolved by staff, set by the resort",
    body: ["Booking logs catch every failed or pending payment, and staff mark each one resolved once it's sorted.", "Rooms, extras, holiday dates and blocked dates are all set by the resort team, with no developer needed."],
    shots: ["[Booking logs screenshot]", "[Settings screenshot]"],
  },
  run: {
    title: "Built for this resort, and still looked after",
    paras: [
      "We built the system from scratch on the MERN stack: MongoDB, Express, React and Node.js. One backend serves the guest booking site and the back office, so a room or day pass sold online is counted everywhere at once.",
      "After launch we stayed on as Jara's technology team on a CTO-as-a-Service retainer, keeping the platform running and adding new products and events as the resort grows.",
    ],
    liveTitle: "booking.jarabeachresort.com",
    liveBody: "Overnight stays, day passes, retreats and live events, all booked and paid for online.",
    stack: ["MongoDB", "Express", "React", "Node.js", "Paystack", "Squadco", "Back office"],
    note: { label: "Help, one tap away", text: "A WhatsApp “Need Help?” button sits on every page, so a guest with a question reaches the resort without leaving the booking." },
  },
  resultTitle: "Live, and filling the beach",
  results: [],
  quote: "[Quote from the Jara Beach Resort team about working with 24 Design Co.]",
  quoteBy: "[Name], [role], Jara Beach Resort",
  next: { title: "Lufasi Lodges: a night in the forest, booked online", href: "/our-work/lufasi-lodges" },
};
