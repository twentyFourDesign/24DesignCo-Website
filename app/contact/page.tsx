import type { Metadata } from "next";
import { Footer, H2, PageHero, Placeholder, Section } from "@/components/ui";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Contact | 24 Design Co." };

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="Contact" title="Let’s talk about your idea">
        Book a free 30-minute idea review. We will tell you honestly what it would take to build. No pressure, no obligation.
      </PageHero>
      <Section>
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <Placeholder label="[Booking calendar]" className="aspect-[4/3]" />
            <ul className="mt-8 space-y-2 text-slate-700">
              <li><strong>WhatsApp:</strong> [number]</li>
              <li><strong>Email:</strong> [email]</li>
              <li><strong>Phone:</strong> [phone]</li>
              <li><strong>Address:</strong> Plot 1A, Road 3, Ikota Villa, Lekki, Lagos</li>
              <li><strong>Replies:</strong> within one business day</li>
            </ul>
          </div>
          <div><H2>Prefer to write?</H2><div className="mt-8"><ContactForm /></div></div>
        </div>
      </Section>
      <Footer />
    </main>
  );
}
