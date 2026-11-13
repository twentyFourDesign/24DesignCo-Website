"use client";
import Link from "next/link";
import { useState } from "react";

const field = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3";
const STAGES = ["Just an idea", "Have a prototype", "Building now", "Live product"];

/** "Prefer to write?" form. Saves the message to the admin (Messages) and emails it to the team. */
export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"), email: form.get("email"), whatsapp: form.get("whatsapp"), message: form.get("message"),
          stage: form.get("stage"), website: form.get("website"), page: window.location.pathname,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Your message could not be sent. Please try again.");
      setState("sent");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  if (state === "sent")
    return (
      <div role="status" className="rounded-2xl bg-white p-8">
        <p className="text-lg font-semibold text-navy">Thank you. Your message has been sent.</p>
        <p className="mt-2 text-slate-600">We will reply within one business day.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block font-semibold">Name<input name="name" required maxLength={120} autoComplete="name" className={field} /></label>
      <label className="block font-semibold">Email<input name="email" type="email" required maxLength={200} autoComplete="email" className={field} /></label>
      <label className="block font-semibold">WhatsApp number <span className="font-normal text-slate-500">(optional)</span><input name="whatsapp" type="tel" maxLength={40} autoComplete="tel" className={field} /></label>
      <label className="block font-semibold">What are you building?<textarea name="message" rows={4} required maxLength={4000} className={field} /></label>
      <label className="block font-semibold">Stage
        <select name="stage" defaultValue={STAGES[0]} className={field}>
          {STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      {/* Hidden from people; bots that fill every field are turned away. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="rounded-lg bg-signal px-8 py-4 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {state === "sending" ? "Sending…" : "Send"}
      </button>
      <p className="text-sm text-slate-600">We use your details only to reply to your enquiry. See our <Link href="/privacy" className="font-semibold text-signal hover:underline">Privacy Policy</Link>.</p>
    </form>
  );
}
