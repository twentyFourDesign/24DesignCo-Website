"use client";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";
import MediaPicker from "@/components/cms/MediaPicker";
import { Button, Callout, Card } from "@/components/cms/ui/core";
import { Check, Field, FormGrid, Input, Textarea } from "@/components/cms/ui/form";
import type { Settings } from "@/lib/cms/settings";

/** Shared save wrapper: PATCHes one settings section and reports the result. */
function Form({ section, value, children }: { section: string; value: unknown; children: ReactNode }) {
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/api/cms/settings", { method: "PATCH", body: { [section]: value } });
      toast("Settings saved. The website updates straight away.");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "bad");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="space-y-6">
      {children}
      <div className="flex justify-end"><Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button></div>
    </form>
  );
}

export function BusinessForm({ initial }: { initial: Settings["site"] }) {
  const [v, setV] = useState(initial);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Form section="site" value={v}>
      <Card title="Business details">
        <FormGrid>
          <Field label="Business name"><Input value={v.name} onChange={set("name")} required /></Field>
          <Field label="Tagline"><Input value={v.tagline} onChange={set("tagline")} /></Field>
          <Field label="Email"><Input type="email" value={v.email} onChange={set("email")} /></Field>
          <Field label="Phone"><Input value={v.phone} onChange={set("phone")} /></Field>
          <Field label="Registered name"><Input value={v.registeredName} onChange={set("registeredName")} /></Field>
          <Field label="RC number"><Input value={v.rcNumber} onChange={set("rcNumber")} /></Field>
          <Field label="TIN"><Input value={v.tin} onChange={set("tin")} /></Field>
          <Field label="Address (not shown on the website)" hint="Kept for your records only. The website does not display it."><Input value={v.address} onChange={set("address")} /></Field>
        </FormGrid>
      </Card>
    </Form>
  );
}

type Link = { label: string; url: string };
function LinkList({ items, onChange, noun }: { items: Link[]; onChange: (l: Link[]) => void; noun: string }) {
  const edit = (i: number, p: Partial<Link>) => onChange(items.map((l, j) => (j === i ? { ...l, ...p } : l)));
  const move = (i: number, d: number) => { const n = [...items]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-[13px] text-muted">No {noun} yet.</p>}
      {items.map((l, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
          <Input aria-label="Label" placeholder="Label" value={l.label} onChange={(e) => edit(i, { label: e.target.value })} />
          <Input aria-label="Address" placeholder="/page or https://…" value={l.url} onChange={(e) => edit(i, { url: e.target.value })} />
          <div className="flex gap-1">
            <Button type="button" size="sm" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" /></Button>
            <Button type="button" size="sm" variant="ghost" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" /></Button>
            <Button type="button" size="sm" variant="ghost" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
          </div>
        </div>
      ))}
      <Button type="button" size="sm" onClick={() => onChange([...items, { label: "", url: "" }])}><Plus className="size-4" aria-hidden />Add {noun}</Button>
    </div>
  );
}

/** Menu saves two sections, so it has its own submit. */
export function MenuForm({ initial }: { initial: { navigation: Link[]; navButton: Link } }) {
  const toast = useToast();
  const router = useRouter();
  const [nav, setNav] = useState(initial.navigation);
  const [btn, setBtn] = useState(initial.navButton);
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/api/cms/settings", { method: "PATCH", body: { navigation: nav, navButton: btn } });
      toast("Menu saved.");
      router.refresh();
    } catch (err) { toast((err as Error).message, "bad"); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} className="space-y-6">
      <Card title="Main navigation" description="The links in the website header, in order."><LinkList items={nav} onChange={setNav} noun="link" /></Card>
      <Card title="Header button">
        <FormGrid>
          <Field label="Button label"><Input value={btn.label} onChange={(e) => setBtn({ ...btn, label: e.target.value })} /></Field>
          <Field label="Button address"><Input value={btn.url} onChange={(e) => setBtn({ ...btn, url: e.target.value })} /></Field>
        </FormGrid>
      </Card>
      <div className="flex justify-end"><Button type="submit" variant="primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button></div>
    </form>
  );
}

export function FooterForm({ initial }: { initial: Settings["footer"] }) {
  const [v, setV] = useState(initial);
  const soc = (k: keyof typeof v.social) => (e: React.ChangeEvent<HTMLInputElement>) => setV((p) => ({ ...p, social: { ...p.social, [k]: e.target.value } }));
  return (
    <Form section="footer" value={v}>
      <Card title="Footer text"><Field label="Text"><Textarea rows={3} value={v.text} onChange={(e) => setV({ ...v, text: e.target.value })} /></Field></Card>
      <Card title="Footer links"><LinkList items={v.links} onChange={(links) => setV({ ...v, links })} noun="link" /></Card>
      <Card title="Social links" description="Leave empty to hide an icon.">
        <FormGrid cols={3}>
          <Field label="LinkedIn"><Input value={v.social.linkedin} onChange={soc("linkedin")} placeholder="https://" /></Field>
          <Field label="X"><Input value={v.social.x} onChange={soc("x")} placeholder="https://" /></Field>
          <Field label="Instagram"><Input value={v.social.instagram} onChange={soc("instagram")} placeholder="https://" /></Field>
        </FormGrid>
      </Card>
    </Form>
  );
}

export function SeoForm({ initial }: { initial: Settings["seoDefaults"] }) {
  const [v, setV] = useState(initial);
  return (
    <Form section="seoDefaults" value={v}>
      <Card title="Search and sharing defaults" description="Used on any page that does not set its own.">
        <div className="space-y-4">
          <Field label="Title suffix" hint="Added after page titles, for example ' | 24 Design Co.'"><Input value={v.titleSuffix} onChange={(e) => setV({ ...v, titleSuffix: e.target.value })} /></Field>
          <Field label="Default description" hint={`${v.defaultDescription.length} characters. Around 150 to 160 works best.`}><Textarea rows={3} value={v.defaultDescription} onChange={(e) => setV({ ...v, defaultDescription: e.target.value })} /></Field>
          <MediaPicker label="Default share image" value={v.ogImage} onChange={(ogImage) => setV({ ...v, ogImage })} folder="SEO" />
        </div>
      </Card>
    </Form>
  );
}

export function IntegrationsForm({ initial, configured }: { initial: Settings["integrations"]; configured: boolean }) {
  const [v, setV] = useState(initial);
  return (
    <Form section="integrations" value={v}>
      <Card title="Google Calendar" description="Adds each booking to your calendar with a Meet link, and hides your busy times from the booking page.">
        <div className="space-y-4">
          {!configured && <Callout tone="warn">The Google service account is not set on the server yet (GOOGLE_SERVICE_ACCOUNT_JSON), so this has no effect until it is.</Callout>}
          <Check label="Turn on Google Calendar sync" checked={v.googleCalendar.enabled} onChange={(e) => setV({ ...v, googleCalendar: { ...v.googleCalendar, enabled: e.target.checked } })} />
          <Field label="Calendar id" hint="Usually the calendar's email address."><Input value={v.googleCalendar.calendarId} onChange={(e) => setV({ ...v, googleCalendar: { ...v.googleCalendar, calendarId: e.target.value } })} /></Field>
        </div>
      </Card>
      <Card title="Analytics and search">
        <FormGrid>
          <Field label="Google Analytics measurement id" hint="For example G-XXXXXXXXXX"><Input value={v.googleAnalytics.measurementId} onChange={(e) => setV({ ...v, googleAnalytics: { measurementId: e.target.value } })} /></Field>
          <Field label="Search Console verification" hint="The content value of the verification meta tag."><Input value={v.searchConsole.verification} onChange={(e) => setV({ ...v, searchConsole: { verification: e.target.value } })} /></Field>
        </FormGrid>
      </Card>
      <Card title="Newsletter">
        <FormGrid>
          <Field label="Provider" hint="For example Mailchimp or Brevo"><Input value={v.newsletter.provider} onChange={(e) => setV({ ...v, newsletter: { ...v.newsletter, provider: e.target.value } })} /></Field>
          <Field label="List id"><Input value={v.newsletter.listId} onChange={(e) => setV({ ...v, newsletter: { ...v.newsletter, listId: e.target.value } })} /></Field>
        </FormGrid>
      </Card>
    </Form>
  );
}
