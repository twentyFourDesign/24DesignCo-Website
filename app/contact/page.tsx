import type { Metadata } from "next";
import { Footer, H2, PageHero, Section } from "@/components/ui";
import BookingFlow from "@/components/BookingFlow";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Book a free idea review | 24 Design Co.",
  description: "Pick a 30-minute slot, tell us what you are building, and we will come prepared with honest advice.",
};

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="Book a free idea review" title="Let’s talk about your idea.">
        Pick a 30-minute slot, tell us a little about what you are building, and we will come prepared with honest advice.
      </PageHero>
      <Section><BookingFlow /></Section>
      <section className="bg-cloud">
        <Section>
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <H2>Prefer to write?</H2>
              <ul className="mt-6 space-y-2 text-slate-700">
                <li><strong>Phone:</strong> +234 70445 44455</li>
                <li><strong>Email:</strong> info@24group.com.ng</li>
                <li><strong>Replies:</strong> within one business day</li>
              </ul>
            </div>
            <ContactForm />
          </div>
        </Section>
      </section>
      <Footer />
    </main>
  );
}
