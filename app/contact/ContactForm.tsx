"use client";
import { useState } from "react";

const field = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  if (sent)
    return <p className="rounded-2xl bg-cloud p-8 text-lg font-semibold">Thank you. We will reply within one business day.</p>;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: send to an API route / email service before launch.
        setSent(true);
      }}
      className="space-y-5"
    >
      <label className="block font-semibold">Name<input name="name" required className={field} /></label>
      <label className="block font-semibold">Email<input name="email" type="email" required className={field} /></label>
      <label className="block font-semibold">WhatsApp number<input name="whatsapp" type="tel" className={field} /></label>
      <label className="block font-semibold">What are you building?<textarea name="idea" rows={4} required className={field} /></label>
      <label className="block font-semibold">Stage
        <select name="stage" defaultValue="Just an idea" className={field}>
          <option>Just an idea</option><option>Have a prototype</option><option>Building now</option><option>Live product</option>
        </select>
      </label>
      <button type="submit" className="rounded-lg bg-signal px-8 py-4 font-semibold text-white hover:bg-blue-700">Send</button>
      <p className="text-sm text-slate-600">We use your details only to reply to your enquiry. See our Privacy Policy.</p>
    </form>
  );
}
