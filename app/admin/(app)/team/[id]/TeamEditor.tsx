"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink, Card } from "@/components/cms/ui/core";
import { Check, Field, FormGrid, Input, Textarea } from "@/components/cms/ui/form";
import MediaPicker from "@/components/cms/MediaPicker";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";

type M = { id: string; name: string; role: string; shortBio: string; bio: string; researchArea: string; photo: string; photoAlt: string; links: { linkedin?: string; x?: string; email?: string }; isFounder: boolean; visible: boolean };

export default function TeamEditor({ member }: { member: M }) {
  const router = useRouter();
  const toast = useToast();
  const [m, setM] = useState(member);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof M>(k: K, v: M[K]) => setM((x) => ({ ...x, [k]: v }));
  const link = (k: "linkedin" | "x" | "email", v: string) => set("links", { ...m.links, [k]: v });

  async function save() {
    setSaving(true);
    try { await apiFetch(`/api/cms/team/${m.id}`, { method: "PATCH", body: m }); toast("Saved"); router.refresh(); } catch (e) { toast((e as Error).message, "bad"); } finally { setSaving(false); }
  }
  async function remove() {
    if (!confirm(`Remove ${m.name || "this person"} from the team?`)) return;
    try { await apiFetch(`/api/cms/team/${m.id}`, { method: "DELETE" }); router.push("/admin/team"); router.refresh(); } catch (e) { toast((e as Error).message, "bad"); }
  }

  return (
    <div className="space-y-6">
      <Card title="Person">
        <FormGrid>
          <Field label="Name"><Input value={m.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Role"><Input value={m.role} onChange={(e) => set("role", e.target.value)} placeholder="Founder and CEO" /></Field>
        </FormGrid>
        <Field label="One-line bio" className="mt-4" hint="Shown on team cards."><Input value={m.shortBio} onChange={(e) => set("shortBio", e.target.value)} /></Field>
        <div className="mt-4 flex flex-wrap gap-6">
          <Check label="Show on the website" checked={m.visible} onChange={(e) => set("visible", e.target.checked)} />
          <Check label="Founder (full bio on the About page; only one person can be the founder)" checked={m.isFounder} onChange={(e) => set("isFounder", e.target.checked)} />
        </div>
      </Card>
      <Card title="Photo"><MediaPicker label="Photo" value={m.photo} onChange={(v) => set("photo", v)} alt={m.photoAlt} onAltChange={(v) => set("photoAlt", v)} folder="Team photos" /></Card>
      {m.isFounder && (
        <Card title="Founder bio">
          <Field label="Full bio" hint="Separate paragraphs with a blank line."><Textarea rows={12} value={m.bio} onChange={(e) => set("bio", e.target.value)} /></Field>
          <Field label="PhD research area" className="mt-4"><Input value={m.researchArea} onChange={(e) => set("researchArea", e.target.value)} /></Field>
        </Card>
      )}
      <Card title="Links">
        <FormGrid cols={3}>
          <Field label="LinkedIn"><Input value={m.links.linkedin ?? ""} onChange={(e) => link("linkedin", e.target.value)} placeholder="https://" /></Field>
          <Field label="X"><Input value={m.links.x ?? ""} onChange={(e) => link("x", e.target.value)} placeholder="https://" /></Field>
          <Field label="Email"><Input type="email" value={m.links.email ?? ""} onChange={(e) => link("email", e.target.value)} /></Field>
        </FormGrid>
      </Card>
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t border-line bg-canvas/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="button" variant="danger" onClick={remove}>Remove</Button>
        <div className="flex gap-2"><ButtonLink href="/admin/team">Back</ButtonLink><Button type="button" variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></div>
      </div>
    </div>
  );
}
