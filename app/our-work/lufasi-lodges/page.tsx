import type { Metadata } from "next";
import CaseStudy, { type CaseStudyData } from "@/components/CaseStudy";

export const metadata: Metadata = {
  title: "Lufasi Lodges case study | 24 Design Co.",
  description: "How we took Lufasi Lodges from an idea to a live booking system for named geo-domes, extras and day hire.",
};

const data: CaseStudyData = {
  name: "Lufasi Lodges",
  eyebrow: "Case study · Hospitality · Web app",
  title: "Lufasi Lodges: a night in the forest, booked online, from idea to launch",
  url: "booking.lufasilodges.com",
  intro: "We took Lufasi Lodges from an idea to a live booking system. That meant the guest booking flow, the admin dashboard behind it, the build, and running it after launch.",
  meta: [["Client", "Lufasi Lodges"], ["Platforms", "Web: guest booking and admin"], ["Services", "Discovery, UI/UX, web app build, launch, CTO as a Service"], ["Live at", "booking.lufasilodges.com"]],
  stats: [["6", "Steps from picking dates to a confirmed booking"], ["9", "Admin modules, from bookings and pricing to vouchers and reports"], ["[X]", "Weeks from idea to launch"], ["[N]", "Bookings taken online since launch"]],
  idea: {
    title: "A forest stay deserves more than a phone call to book",
    paras: [
      "Lufasi Lodges is a glamping camp of geo-domes beside Lufasi Nature Park on the Lekki–Epe Expressway. Each dome has its own name, an en-suite, a skylight shower and a private plunge pool. Guests come for a night away, or just for the day.",
      "The owners wanted guests to see which domes were free, choose one, add the extras that make a stay special, and pay, all without waiting on a reply. They also wanted the team to run every booking from one place.",
    ],
    brief: "Let guests book a named dome, extras included, in minutes, and give the lodge one dashboard to run it all.",
    who: "Couples and friends planning a nature getaway · Day visitors hiring a dome for a few hours · The front-desk team managing arrivals, rooms and payments",
  },
  challenge: {
    title: "Four things a standard hotel booking widget would get wrong",
    items: [
      ["A camp, not a hotel", "Guests book a specific dome by name and position, not a room type. And a stay can be overnight or a day dome hire, each with its own rules."],
      ["House rules, shown up front", "Check-in times, how many domes a group needs, and the age policy for children all have to appear before a guest pays, not after."],
      ["Prices with every charge in", "Meal plans, extras, discounts, 12.5% consumption tax and VAT, and a 2.5% service charge all add up live, so the total is never a surprise."],
      ["A small team running every booking", "With a handful of domes, one double booking is a real loss. Staff needed to see arrivals, assign domes, take payments and change rates without calling a developer."],
    ],
  },
  stages: [
    { no: "01", name: "Discovery", title: "Shape the idea", points: ["Workshop with the owners", "How bookings ran before", "Dome, rate and tax rules", "First-version scope"] },
    { no: "02", name: "Design", title: "Design every step", points: ["Six-step booking flow", "Live price summary", "Admin dashboard", "Built on the Lufasi brand"] },
    { no: "03", name: "Build", title: "Build the system", points: ["Availability by dome", "Checkout and payments", "Booking references and emails", "Nine admin modules"] },
    { no: "04", name: "Launch", title: "Go live", points: ["Tests with real bookings", "booking.lufasilodges.com live", "Front-desk training", "Launch date [date]"] },
    { no: "05", name: "Run", title: "Keep it growing", points: ["CTO as a Service retainer", "Hosting and support", "New features", "Channel manager link"] },
  ],
  look: {
    title: "Calm colours from the forest floor",
    body: "The booking flow uses the lodge's own forest green for every action, so the next step is always clear. Warm sand and cream keep the screens soft, and a pale aqua marks helpful tips and the booking reference.",
    tagline: "Wake Up Wild",
    swatches: [["Forest", "#0E472F"], ["Aqua", "#B7FFFF"], ["Sand", "#ECEAE0"], ["Cream", "#FAF8F5"], ["Charcoal", "#333333", "admin"]],
  },
  design: {
    eyebrow: "Stage 03 · The booking flow",
    title: "What we designed, and why",
    body: "Six steps take a guest from dates to a confirmed stay. A price summary sits beside every step, so the total is always in view. Here are the parts that matter most.",
    features: [
      { eyebrow: "Choose your dome", title: "Every dome has a name and a place", body: ["Guests don't pick “a room”. They pick Mara, Serengeti or Manyara, and see where each sits in the camp: park side, by the garden, in the middle.", "Live status shows which domes are free or taken for the chosen dates, and the price summary adds tax and service charge as soon as a dome is picked."], shot: "[Choose your dome screenshot]" },
      { eyebrow: "Guests and extras", title: "House rules in plain sight, and extras that sell themselves", body: ["Guests count adults, teenagers and infants separately, and the age policy appears right where they enter children, so no one is turned away at the gate.", "The extras step offers room decor, a sunset picnic, drinks and cakes, and a painting session. Each adds to the total as it's ticked, and guests can skip the whole step in one tap."], shot: "[Guests and extras screenshot]" },
      { eyebrow: "Confirmation", title: "A booking reference the moment they pay", body: ["Every booking gets an LUF reference and a confirmation email with pre-arrival details, a calendar link and directions to the camp.", "Guests use the same reference under Manage Booking on the home page to look up or change their stay."], shot: "[Confirmation screenshot]" },
      { eyebrow: "The admin dashboard", title: "The whole camp, on one screen", body: ["The team sees bookings, occupancy, revenue and the day's check-ins at a glance. Nine modules cover bookings, the booking page, pricing, guest payments, vouchers and discounts, extras, pods and reports."], shot: "[Lufasi admin dashboard screenshot]" },
    ],
  },
  extra: {
    eyebrow: "Admin in practice",
    title: "Run every booking without calling a developer",
    body: ["Bookings: every booking by status, pending, confirmed or cancelled, with a dome assigned in one click.", "Pricing and configuration: staff change meal-plan and child rates themselves, and every change is saved to an audit log."],
    shots: ["[Bookings screenshot]", "[Pricing and configuration screenshot]"],
  },
  run: {
    title: "Built for this camp, and still looked after",
    paras: [
      "We built the system from scratch for Lufasi, not from a template. One backend serves the guest booking site and the admin dashboard, so a dome booked online is gone from the calendar straight away.",
      "Launch was not the end of the job. We stayed on as Lufasi's technology team on a CTO-as-a-Service retainer, keeping the system running and adding what the lodge needs next.",
    ],
    liveTitle: "booking.lufasilodges.com",
    liveBody: "Overnight stays and day dome hire, booked and paid for online, with Manage Booking for changes.",
    stack: ["[Frontend]", "[Backend]", "[Database]", "[Payment gateway]", "Admin dashboard"],
    note: { label: "In progress", text: "A channel manager link with Channex, so rates and dome availability stay in step between the booking site and the travel sites the lodge lists on." },
  },
  resultTitle: "Live, and booking guests into the forest",
  results: [["Bookings", "[N]", "Bookings taken online since launch"], ["Direct", "[N]%", "Of stays booked direct, with no commission"], ["Extras", "[N]%", "Of bookings that add at least one extra"], ["Occupancy", "[N]%", "Average dome occupancy in [period]"]],
  quote: "[Quote from the Lufasi Lodges team about working with 24 Design Co.]",
  quoteBy: "[Name], [role], Lufasi Lodges",
  next: { title: "Nexuss: one home for Nigeria's family stories", href: "/our-work/nexuss" },
};

export default function Page() {
  return <CaseStudy d={data} />;
}
