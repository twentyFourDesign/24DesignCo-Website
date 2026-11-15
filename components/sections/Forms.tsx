import type { Fields } from "@/lib/cms/sections";
import { H2, Section } from "./primitives";
import BookingFlow from "@/components/BookingFlow";
import ContactForm from "@/app/contact/ContactForm";
import { Band, str } from "./helpers";

export type Contact = { email: string; phone: string; footerText: string };

export function BookingForm({ f }: { f: Fields }) {
  return (
    <Section>
      {(str(f, "heading") || str(f, "text")) && <div className="mb-8">{str(f, "heading") && <H2>{str(f, "heading")}</H2>}{str(f, "text") && <p className="mt-3 text-lg text-slate-600">{str(f, "text")}</p>}</div>}
      <BookingFlow />
    </Section>
  );
}

export function ContactSection({ f, contact }: { f: Fields; contact: Contact }) {
  return (
    <Band f={f} bg={str(f, "background", "cloud")}>
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <H2>{str(f, "heading", "Prefer to write?")}</H2>
          {str(f, "text") && <p className="mt-4 text-lg text-slate-600">{str(f, "text")}</p>}
          <ul className="mt-6 space-y-2 text-slate-700">
            {contact.phone && <li><strong>Phone:</strong> {contact.phone}</li>}
            {contact.email && <li><strong>Email:</strong> {contact.email}</li>}
            {str(f, "replyNote") && <li><strong>Replies:</strong> {str(f, "replyNote")}</li>}
          </ul>
        </div>
        <ContactForm />
      </div>
    </Band>
  );
}
