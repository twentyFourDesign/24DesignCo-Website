"use client";
import { useEffect, useMemo, useState } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STAGES = ["Just an idea", "Prototype or designs", "Live product"];
const MEETS = ["Video call (Google Meet)", "WhatsApp call"];
// Slots and bookings come from the site's own API (/api/public/availability and /api/public/bookings), which the admin controls.
const API_STAGE: Record<string, string> = { "Just an idea": "Just an idea", "Prototype or designs": "Have a prototype", "Live product": "App already live" };
type Slot = { h: number; m: number; ms: number };
type Info = { slotMinutes: number; daysLabel: string; hoursLabel: string | null; lastCall: string | null; openDays: number[]; maxDaysAhead: number };
const FALLBACK: Info = { slotMinutes: 30, daysLabel: "Monday to Friday", hoursLabel: "12:00 to 18:00", lastCall: "17:30", openDays: [1, 2, 3, 4, 5], maxDaysAhead: 42 };
const dkey = (x: { y: number; m: number; d: number }) => `${x.y}-${String(x.m + 1).padStart(2, "0")}-${String(x.d).padStart(2, "0")}`;

const pad = (n: number) => String(n).padStart(2, "0");
const hm = (h: number, m: number) => `${pad(h)}:${pad(m)}`;
const endOf = (s: { h: number; m: number }, len = 30) => { const t = s.h * 60 + s.m + len; return { h: Math.floor(t / 60), m: t % 60 }; };
// A day is {y, m (0-11), d}. WAT is UTC+1 all year, so a WAT time maps to a fixed UTC instant.
type Day = { y: number; m: number; d: number };
const utc = (day: Day, h: number, m: number) => Date.UTC(day.y, day.m, day.d, h - 1, m);
const dow = (day: Day) => new Date(Date.UTC(day.y, day.m, day.d)).getUTCDay();
const same = (a?: Day | null, b?: Day | null) => !!a && !!b && a.y === b.y && a.m === b.m && a.d === b.d;
const label = (day: Day) => `${DAYS[dow(day)]} ${day.d} ${MONTHS[day.m]} ${day.y}`;
const field = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3";

function watNow(): Day {
  const t = new Date(Date.now() + 3600_000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate() };
}

function localRange(day: Day, s: { h: number; m: number }, len: number) {
  if (new Date().getTimezoneOffset() === -60) return null;
  const fmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short" });
  const e = endOf(s, len);
  return `${fmt.format(utc(day, s.h, s.m))} to ${fmt.format(utc(day, e.h, e.m))}`;
}

const Steps = ({ step }: { step: 1 | 2 | 3 }) => (
  <ol className="flex flex-wrap gap-2 text-sm">
    {["Date and time", "Your details", "Confirmed"].map((n, i) => {
      const done = step > i + 1, on = step === i + 1;
      return (
        <li key={n} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${on ? "border-signal font-semibold" : "border-slate-200 text-slate-600"}`} aria-current={on ? "step" : undefined}>
          <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${done ? "bg-launch text-white" : on ? "bg-signal text-white" : "bg-slate-200"}`}>{done ? "✓" : i + 1}</span>
          {n}
        </li>
      );
    })}
  </ol>
);

function Summary({ day, slot, info }: { day: Day | null; slot: { h: number; m: number } | null; info: Info }) {
  const e = slot && endOf(slot, info.slotMinutes);
  return (
    <aside className="bg-navy p-7 text-white md:p-8">
      <h3 className="text-2xl font-bold">Free idea review</h3>
      <ul className="mt-5 space-y-4 text-sm">
        <li><strong className="block text-base">{info.slotMinutes} minutes</strong><span className="text-slate-300">No obligation, no cost</span></li>
        <li><strong className="block text-base">{info.daysLabel}</strong><span className="text-slate-300">{info.hoursLabel ? `${info.hoursLabel} WAT (Lagos)` : "Times shown in WAT (Lagos)"}</span></li>
        <li><strong className="block text-base">Video call or WhatsApp</strong><span className="text-slate-300">Your choice</span></li>
      </ul>
      <p className="mt-6 text-slate-300">We will listen to your idea, tell you honestly what it would take to build, and say whether we are the right team.</p>
      {day && slot && e && (
        <div className="mt-6 border-t border-white/15 pt-5">
          <p className="text-sm text-slate-300">Your slot</p>
          <p className="mt-1 text-lg font-bold">{label(day)}, {hm(slot.h, slot.m)} to {hm(e.h, e.m)} WAT</p>
        </div>
      )}
    </aside>
  );
}

type Form = { name: string; email: string; whatsapp: string; company: string; idea: string; stage: string; meet: string; budget: string; launch: string; heard: string; consent: boolean };
const blank: Form = { name: "", email: "", whatsapp: "", company: "", idea: "", stage: STAGES[0], meet: MEETS[0], budget: "", launch: "", heard: "", consent: false };

export default function BookingFlow() {
  const [today, setToday] = useState<Day | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [day, setDay] = useState<Day | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [f, setF] = useState<Form>(blank);
  const [ref, setRef] = useState("");
  const [copied, setCopied] = useState(false);
  const [avail, setAvail] = useState<Record<string, Slot[]> | null>(null);
  const [info, setInfo] = useState<Info>(FALLBACK);
  const [loadErr, setLoadErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [meet, setMeet] = useState("");

  useEffect(() => {
    const t = watNow();
    setToday(t);
    setView({ y: t.y, m: t.m });
  }, []);

  useEffect(() => {
    if (!today) return;
    let live = true;
    const get = (from: string, days: number) => fetch(`/api/public/availability?from=${from}&days=${days}`, { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); });
    const second = new Date(Date.UTC(today.y, today.m, today.d + 31));
    Promise.all([get(dkey(today), 31), get(dkey({ y: second.getUTCFullYear(), m: second.getUTCMonth(), d: second.getUTCDate() }), 11)])
      .then((parts) => {
        if (!live) return;
        const map: Record<string, Slot[]> = {};
        const sm = parts[0].summary;
        if (sm) setInfo({ slotMinutes: parts[0].slotMinutes ?? 30, daysLabel: sm.daysLabel, hoursLabel: sm.hoursLabel, lastCall: sm.lastCall, openDays: sm.openDays, maxDaysAhead: sm.maxDaysAhead });
        for (const part of parts) for (const d of part.days) {
          map[d.date] = d.slots.map((s: { start: string }) => { const ms = new Date(s.start).getTime(); const w = new Date(ms + 3600_000); return { h: w.getUTCHours(), m: w.getUTCMinutes(), ms }; });
        }
        setAvail(map);
      })
      .catch(() => live && setLoadErr(true));
    return () => { live = false; };
  }, [today]);

  const last = useMemo(() => {
    if (!today) return null;
    const d = new Date(Date.UTC(today.y, today.m, today.d + info.maxDaysAhead));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
  }, [today, info.maxDaysAhead]);

  const slotsOf = (x: Day): Slot[] => avail?.[dkey(x)] ?? [];
  const open = (x: Day) => {
    if (!today || !last) return false;
    if (utc(x, 0, 0) > utc(last, 0, 0)) return false;
    return slotsOf(x).length > 0;
  };

  if (loadErr) return <div className="rounded-2xl border border-slate-200 p-8 text-slate-700">We could not load the available times. Please refresh, or email <a className="font-semibold text-signal" href="mailto:info@24group.com.ng">info@24group.com.ng</a> and we will find a time with you.</div>;
  if (!today || !view || !last || !avail) return <div className="h-[560px] rounded-2xl border border-slate-200" aria-busy="true" />;

  const first = new Date(Date.UTC(view.y, view.m, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: (Day | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => ({ y: view.y, m: view.m, d: i + 1 }))];
  const canPrev = view.y * 12 + view.m > today.y * 12 + today.m;
  const canNext = view.y * 12 + view.m < last.y * 12 + last.m;
  const nav = (n: number) => { const d = new Date(Date.UTC(view.y, view.m + n, 1)); setView({ y: d.getUTCFullYear(), m: d.getUTCMonth() }); };
  const set = (k: keyof Form, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const e = slot && endOf(slot, info.slotMinutes);
  const when = day && slot && e ? `${label(day)}, ${hm(slot.h, slot.m)} to ${hm(e.h, e.m)} WAT` : "";

  const done = (reference: string) => {
    setRef(reference);
    setStep(3);
    window.scrollTo({ top: document.getElementById("booking")?.offsetTop ?? 0, behavior: "smooth" });
  };
  const confirm = async () => {
    if (!day || !slot || busy) return;
    setBusy(true); setErr("");
    const extra = [`Meeting: ${f.meet}`, f.launch && `Wants to launch: ${f.launch}`].filter(Boolean).join("\n");
    try {
      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.name, email: f.email, phone: f.whatsapp, company: f.company, idea: `${f.idea}\n\n${extra}`.slice(0, 2000), stage: API_STAGE[f.stage] ?? "Just an idea", budget: f.budget || "Not sure yet", source: f.heard, start: new Date(slot.ms).toISOString(), website: "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setErr(data.error || "Sorry, that time was just taken. Please choose another.");
        setSlot(null); setAvail(null); setStep(1);
        setLoadErr(false); setToday(watNow());
        return;
      }
      if (!res.ok) { setErr(data.error || "Something went wrong. Please try again."); return; }
      setMeet(data.meetLink || "");
      done(`IR-${String(data.id).slice(-6).toUpperCase()}`);
    } catch {
      setErr("We could not reach the booking service. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const stamp = (h: number, m: number) => { const d = new Date(utc(day!, h, m)); return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`; };
  const gcal = day && slot && e
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Free idea review with 24 Design Co.")}&dates=${stamp(slot.h, slot.m)}/${stamp(e.h, e.m)}&details=${encodeURIComponent(`Reference ${ref}`)}`
    : "#";
  const details = `Free idea review with 24 Design Co.\nReference: ${ref}\nWhen: ${when}\nMeeting: ${f.meet}\nName: ${f.name}\nEmail: ${f.email}\nWhatsApp: ${f.whatsapp}\nStage: ${f.stage}\nYour idea: ${f.idea}`;
  const copy = async () => { try { await navigator.clipboard.writeText(details); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ } };
  const reset = () => { setF(blank); setSlot(null); setDay(null); setRef(""); setMeet(""); setErr(""); setStep(1); };

  const chip = (on: boolean) => `rounded-full border px-4 py-2 text-sm ${on ? "border-signal bg-blue-50 font-semibold text-signal" : "border-slate-300 hover:border-slate-400"}`;

  return (
    <div id="booking" className="scroll-mt-24">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">Step {step} of 3</p>
          <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">{step === 1 ? "Pick a date and time" : step === 2 ? "Add your details" : "Booking confirmed"}</h2>
        </div>
        <Steps step={step} />
      </div>
      <div className="grid overflow-hidden rounded-2xl border border-slate-200 shadow-sm lg:grid-cols-[300px_1fr]">
        <Summary day={day} slot={slot} info={info} />
        <div className="p-6 md:p-8">
          {step === 1 && (
            <>
              {err && <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</p>}
              <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{MONTHS[view.m]} {view.y}</h3>
                    <div className="flex gap-2">
                      <button type="button" aria-label="Previous month" disabled={!canPrev} onClick={() => nav(-1)} className="h-10 w-10 rounded-lg border border-slate-200 disabled:opacity-40">‹</button>
                      <button type="button" aria-label="Next month" disabled={!canNext} onClick={() => nav(1)} className="h-10 w-10 rounded-lg border border-slate-200 disabled:opacity-40">›</button>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-sm">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d} className="pb-2 font-semibold text-slate-600">{d}</span>)}
                    {cells.map((c, i) => {
                      if (!c) return <span key={i} />;
                      const ok = open(c), on = same(c, day);
                      return (
                        <button key={i} type="button" disabled={!ok} aria-pressed={on} onClick={() => { setDay(c); setSlot(null); }}
                          className={`aspect-square rounded-lg font-semibold ${on ? "bg-signal text-white" : ok ? "bg-blue-50 text-signal hover:bg-blue-100" : "text-slate-400"}`}>{c.d}</button>
                      );
                    })}
                  </div>
                  <p className="mt-4 flex flex-wrap gap-x-5 text-xs text-slate-600"><span>Blue days have open slots</span>{[0, 6].some((d) => !info.openDays.includes(d)) && <span>{[0, 6].every((d) => !info.openDays.includes(d)) ? "Weekends are closed" : "Some weekend days are closed"}</span>}<span>Book up to {Math.round(info.maxDaysAhead / 7)} weeks ahead</span></p>
                </div>
                <div>
                  {day ? (
                    <>
                      <h3 className="text-xl font-bold">{label(day)}</h3>
                      <p className="mt-1 text-sm text-slate-600">Times shown in West Africa Time (WAT, Lagos). Visitors abroad also see their local time.</p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {slotsOf(day).map((s) => {
                          const ok = true, on = slot?.ms === s.ms, e2 = endOf(s, info.slotMinutes), loc = localRange(day, s, info.slotMinutes);
                          return (
                            <button key={hm(s.h, s.m)} type="button" disabled={!ok} aria-pressed={on} onClick={() => setSlot(s)}
                              className={`rounded-lg border px-2 py-2.5 text-center ${on ? "border-signal bg-signal text-white" : "border-slate-200 hover:border-signal disabled:opacity-40 disabled:hover:border-slate-200"}`}>
                              <span className="block font-bold">{hm(s.h, s.m)}</span>
                              <span className={`block text-xs ${on ? "text-blue-100" : "text-slate-600"}`}>to {hm(e2.h, e2.m)}</span>
                              {loc && <span className={`block text-[11px] ${on ? "text-blue-100" : "text-slate-500"}`}>{loc}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : <p className="rounded-xl bg-cloud p-6 text-slate-600">Choose a blue day to see the open times.</p>}
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">Slots start every {info.slotMinutes} minutes.{info.lastCall ? ` The last call starts at ${info.lastCall}.` : ""}</p>
                <button type="button" disabled={!day || !slot} onClick={() => setStep(2)} className="rounded-lg bg-signal px-8 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">Continue</button>
              </div>
            </>
          )}

          {step === 2 && (
            <form onSubmit={(ev) => { ev.preventDefault(); void confirm(); }} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block font-semibold">Full name<input required autoComplete="name" value={f.name} onChange={(x) => set("name", x.target.value)} className={field} /></label>
                <label className="block font-semibold">Email<input required type="email" autoComplete="email" value={f.email} onChange={(x) => set("email", x.target.value)} className={field} /></label>
                <label className="block font-semibold">WhatsApp number<input required type="tel" autoComplete="tel" value={f.whatsapp} onChange={(x) => set("whatsapp", x.target.value)} className={field} /></label>
                <label className="block font-semibold">Company or project name <span className="font-normal text-slate-600">(optional)</span><input value={f.company} onChange={(x) => set("company", x.target.value)} className={field} /></label>
              </div>
              <label className="block font-semibold">What are you building?<textarea required rows={3} value={f.idea} onChange={(x) => set("idea", x.target.value)} placeholder="For example: a booking app for salons in Lekki, starting with one salon." className={field} /></label>
              <fieldset><legend className="font-semibold">What stage are you at?</legend>
                <div className="mt-2 flex flex-wrap gap-2">{STAGES.map((s) => <button key={s} type="button" aria-pressed={f.stage === s} onClick={() => set("stage", s)} className={chip(f.stage === s)}>{s}</button>)}</div>
              </fieldset>
              <fieldset><legend className="font-semibold">How should we meet?</legend>
                <div className="mt-2 flex flex-wrap gap-2">{MEETS.map((s) => <button key={s} type="button" aria-pressed={f.meet === s} onClick={() => set("meet", s)} className={chip(f.meet === s)}>{s}</button>)}</div>
              </fieldset>
              <div className="grid gap-5 md:grid-cols-3">
                <label className="block font-semibold">Budget <span className="font-normal text-slate-600">(optional)</span><input value={f.budget} onChange={(x) => set("budget", x.target.value)} className={field} /></label>
                <label className="block font-semibold">When do you want to launch? <span className="font-normal text-slate-600">(optional)</span><input value={f.launch} onChange={(x) => set("launch", x.target.value)} className={field} /></label>
                <label className="block font-semibold">How did you hear about us? <span className="font-normal text-slate-600">(optional)</span><input value={f.heard} onChange={(x) => set("heard", x.target.value)} className={field} /></label>
              </div>
              <label className="flex gap-3 text-sm text-slate-700">
                <input required type="checkbox" checked={f.consent} onChange={(x) => set("consent", x.target.checked)} className="mt-1 h-4 w-4" />
                <span>I agree that 24 Design Co. may use these details to arrange and prepare for this call. See our Privacy Policy.</span>
              </label>
              {err && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</p>}
              <div className="flex justify-between border-t border-slate-200 pt-6">
                <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-slate-300 px-6 py-3 font-semibold">Back</button>
                <button type="submit" disabled={busy} className="rounded-lg bg-signal px-8 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? "Booking…" : "Book my idea review"}</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div>
              <p className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">Booked</p>
              <h3 className="mt-4 text-3xl font-extrabold">See you soon, {f.name.split(" ")[0]}.</h3>
              <p className="mt-2 text-slate-600">Reference <strong className="text-navy">{ref}</strong></p>
              <dl className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200">
                {[["When", when], ["Meeting", f.meet], ["Name", f.name], ["Email", f.email], ["WhatsApp", f.whatsapp], ["Stage", f.stage], ["Your idea", f.idea]].map(([k, v]) => (
                  <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[110px_1fr]"><dt className="text-slate-600">{k}</dt><dd className="font-semibold">{v}</dd></div>
                ))}
              </dl>
              <p className="mt-5 text-sm text-slate-600">A confirmation email with the Google Meet link and a calendar invite go to the email above, with a reminder before the call.</p>
              {meet && <p className="mt-4 text-sm">Google Meet link: <a className="font-semibold text-signal underline" href={meet} target="_blank" rel="noreferrer">{meet}</a></p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={gcal} target="_blank" rel="noreferrer" className="rounded-lg bg-signal px-6 py-3 font-semibold text-white hover:bg-blue-700">Add to Google Calendar</a>
                <button type="button" onClick={copy} className="rounded-lg border border-slate-300 px-6 py-3 font-semibold">{copied ? "Copied" : "Copy booking details"}</button>
                <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-6 py-3 font-semibold">Book another slot</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
