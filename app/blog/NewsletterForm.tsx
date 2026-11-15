"use client";
import { useState } from "react";

/** "One practical tip a month". Sign-ups appear in the admin under Messages. */
export default function NewsletterForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/public/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), website: form.get("website"), page: window.location.pathname }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "That didn't work. Please try again.");
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  return (
    <section className="bg-cloud">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-12 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-8 md:px-8 md:py-14">
        <div className="md:flex-[1_1_420px]">
          <h2 className="text-2xl font-extrabold tracking-tight text-navy md:text-[32px]">One practical tip a month</h2>
          <p className="mt-2 leading-relaxed text-slate-600">Short, useful advice on building and launching your product. No spam.</p>
        </div>
        <div className="md:flex-[1_1_420px]">
          {state === "done" ? (
            <p role="status" className="rounded-lg bg-white px-4 py-3.5 font-semibold text-navy">Thank you. You’re on the list.</p>
          ) : (
            <form onSubmit={submit}>
              <label htmlFor="nl-email" className="text-sm font-semibold">Email</label>
              <div className="mt-1.5 flex flex-col gap-3 sm:flex-row">
                <input id="nl-email" name="email" type="email" required maxLength={200} autoComplete="email" className="min-w-0 flex-1 rounded-lg border border-slate-500 bg-white px-3 py-3" />
                <button type="submit" disabled={state === "sending"} className="rounded-lg bg-signal px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
                  {state === "sending" ? "Subscribing…" : "Subscribe"}
                </button>
              </div>
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>
              {error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
