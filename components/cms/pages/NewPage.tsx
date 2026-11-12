"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";
import { Modal } from "@/components/cms/ui/modal";
import { Field, Input, Select } from "@/components/cms/ui/form";
import { buttonClass } from "@/components/cms/ui/button-style";
import { STARTERS } from "@/lib/cms/sections";

export default function NewPage() {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [touched, setTouched] = useState(false);
  const [template, setTemplate] = useState(STARTERS[0].id);
  const [busy, setBusy] = useState(false);
  const slug = (s: string) => "/" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return (
    <Modal trigger="New page" triggerClass={buttonClass("primary", "md")} title="New page" description="Create a draft. Nothing is public until you publish it.">
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const r = await apiFetch<{ id: string }>("/api/cms/pages", { method: "POST", body: { title, path, template } });
          router.push(`/admin/pages/${r.id}`);
        } catch (err) { toast((err as Error).message, "bad"); setBusy(false); }
      }}>
        <Field label="Title" required><Input value={title} onChange={(e) => { setTitle(e.target.value); if (!touched) setPath(slug(e.target.value)); }} required /></Field>
        <Field label="Path" required hint="The address, for example /pricing."><Input value={path} onChange={(e) => { setPath(e.target.value); setTouched(true); }} required /></Field>
        <Field label="Starter template" hint={STARTERS.find((s) => s.id === template)?.description}><Select value={template} onChange={(e) => setTemplate(e.target.value)} options={STARTERS.map((s) => ({ value: s.id, label: s.label }))} /></Field>
        <div className="flex justify-end"><button type="submit" disabled={busy || !title || !path} className={buttonClass("primary", "md")}>{busy ? "Creating…" : "Create page"}</button></div>
      </form>
    </Modal>
  );
}
