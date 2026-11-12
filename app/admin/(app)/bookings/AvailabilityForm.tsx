"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";
import { Button, Callout, Card } from "@/components/cms/ui/core";
import { Check, Field, FormGrid, Input } from "@/components/cms/ui/form";
import type { Settings } from "@/lib/cms/settings";

type Av = Settings["availability"];
const DAYS = [["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"], ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"]] as const;

export default function AvailabilityForm({ initial, googleCalendar }: { initial: Av; googleCalendar: { configured: boolean; enabled: boolean } }) {
  const router = useRouter();
  const toast = useToast();
  const [av, setAv] = useState<Av>(initial);
  const [busy, setBusy] = useState(false);
  const num = (k: "slotMinutes" | "bufferMinutes" | "minNoticeHours" | "maxDaysAhead", v: string) => setAv((a) => ({ ...a, [k]: Number(v) }));
  const day = (k: (typeof DAYS)[number][0], patch: Partial<Av["days"]["mon"]>) => setAv((a) => ({ ...a, days: { ...a.days, [k]: { ...a.days[k], ...patch } } }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/api/cms/bookings/availability", { method: "PUT", body: av });
      toast("Availability saved. The booking page uses it straight away.");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "bad");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <Card title="Opening hours" description="The days and times people can book a free idea review, in the time zone below.">
        <div className="space-y-3">
          {DAYS.map(([k, label]) => (
            <div key={k} className="grid grid-cols-[7rem_1fr] items-center gap-3 sm:grid-cols-[9rem_auto_auto_auto]">
              <Check label={label} checked={av.days[k].enabled} onChange={(e) => day(k, { enabled: e.target.checked })} />
              <Input type="time" aria-label={`${label} start`} value={av.days[k].start} disabled={!av.days[k].enabled} onChange={(e) => day(k, { start: e.target.value })} className="w-32" />
              <span className="hidden text-muted sm:block">to</span>
              <Input type="time" aria-label={`${label} end`} value={av.days[k].end} disabled={!av.days[k].enabled} onChange={(e) => day(k, { end: e.target.value })} className="w-32" />
            </div>
          ))}
        </div>
      </Card>
      <Card title="Rules">
        <FormGrid cols={3}>
          <Field label="Time zone" hint="For example Africa/Lagos"><Input value={av.timezone} onChange={(e) => setAv((a) => ({ ...a, timezone: e.target.value }))} required /></Field>
          <Field label="Call length (minutes)" hint="15 to 120"><Input type="number" min={15} max={120} step={5} value={av.slotMinutes} onChange={(e) => num("slotMinutes", e.target.value)} /></Field>
          <Field label="Buffer between calls (minutes)" hint="Kept free before and after each call"><Input type="number" min={0} max={120} step={5} value={av.bufferMinutes} onChange={(e) => num("bufferMinutes", e.target.value)} /></Field>
          <Field label="Minimum notice (hours)" hint="How soon before a call people can still book"><Input type="number" min={0} max={168} value={av.minNoticeHours} onChange={(e) => num("minNoticeHours", e.target.value)} /></Field>
          <Field label="Book up to (days ahead)" hint="1 to 180"><Input type="number" min={1} max={180} value={av.maxDaysAhead} onChange={(e) => num("maxDaysAhead", e.target.value)} /></Field>
          <Field label="Alert email" hint="Gets an email for each new booking (needs SMTP set up)"><Input type="email" value={av.alertEmail} onChange={(e) => setAv((a) => ({ ...a, alertEmail: e.target.value }))} /></Field>
        </FormGrid>
      </Card>
      <Callout tone={googleCalendar.configured && googleCalendar.enabled ? "ok" : "info"} title="Google Calendar">
        {googleCalendar.configured && googleCalendar.enabled
          ? "Connected. Your busy times are hidden from the booking page and each booking gets a calendar event with a Meet link."
          : "Not connected. Bookings are still saved and shown here. Turn it on under Settings, Integrations, once the Google service account is configured on the server."}
      </Callout>
      <div className="flex justify-end"><Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving…" : "Save availability"}</Button></div>
    </form>
  );
}
