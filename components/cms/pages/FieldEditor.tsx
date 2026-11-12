"use client";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Check, Field, Input, Select, Textarea } from "@/components/cms/ui/form";
import MediaPicker from "@/components/cms/MediaPicker";
import { CARD_ITEM_FIELDS, FIELD_HINTS, fieldShown, itemTemplate, optionsFor, type Fields } from "@/lib/cms/sections";

const LONG = /^(text|body|intro|answer|description|summary|quote|note)$/i;
const IMAGE = /^(image|logo|photo|background)$/i;

export const humanize = (k: string) => {
  const w = k.replace(/([A-Z])/g, " $1").trim().toLowerCase().replace(/\burl\b/g, "URL");
  return w.charAt(0).toUpperCase() + w.slice(1);
};

function blankLike(sample: unknown): unknown {
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === "object") return Object.fromEntries(Object.entries(sample).map(([k, v]) => [k, blankLike(v)]));
  if (typeof sample === "boolean") return false;
  return "";
}

const iconBtn = "inline-flex size-7 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent";

function summaryOf(item: unknown): string {
  if (!item || typeof item !== "object") return String(item ?? "");
  const o = item as Record<string, unknown>;
  for (const k of ["title", "question", "name", "value", "label", "text"]) if (typeof o[k] === "string" && o[k]) return o[k] as string;
  return "";
}

function ListEditor({ type, name, value, onChange, itemKeys }: { type: string; name: string; value: unknown[]; onChange: (v: unknown[]) => void; itemKeys?: string[] }) {
  const objects = value.some((v) => v && typeof v === "object");
  const set = (i: number, v: unknown) => onChange(value.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const c = [...value];
    [c[i], c[j]] = [c[j], c[i]];
    onChange(c);
  };
  const tpl = itemTemplate(type, name);
  const add = () => onChange([...value, tpl !== "" || !value.length ? blankLike(tpl) : blankLike(value[0])]);
  const singular = humanize(name).replace(/s$/, "");
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between"><span className="text-[13px] font-medium text-ink-2">{humanize(name)}</span><span className="text-xs text-muted">{value.length}</span></div>
      {FIELD_HINTS[name] && <p className="mb-2 text-xs text-muted">{FIELD_HINTS[name]}</p>}
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="rounded-lg border border-line bg-surface-2/50">
            <div className="flex items-center gap-1 px-3 py-1.5">
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-2">{singular} {i + 1}{objects && summaryOf(item) ? <span className="font-normal text-muted"> · {summaryOf(item)}</span> : null}</span>
              <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${singular} ${i + 1} up`}><ArrowUp className="size-3.5" /></button>
              <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move ${singular} ${i + 1} down`}><ArrowDown className="size-3.5" /></button>
              <button type="button" className={iconBtn} onClick={() => remove(i)} aria-label={`Remove ${singular} ${i + 1}`}><Trash2 className="size-3.5" /></button>
            </div>
            <div className="border-t border-line px-3 pb-3 pt-3">
              {item && typeof item === "object" ? <FieldEditor type={type} fields={item as Fields} onChange={(v) => set(i, v)} only={itemKeys} nested /> : <Input aria-label={`${singular} ${i + 1}`} value={String(item ?? "")} onChange={(e) => set(i, e.target.value)} />}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink-2 shadow-card hover:bg-surface-2"><Plus className="size-3.5" /> Add {singular.toLowerCase()}</button>
    </div>
  );
}

/** Builds a form from the shape of a section's `fields`: strings, long text, booleans, selects, images, lists of strings and lists of groups. */
export default function FieldEditor({ type, fields, onChange, only, nested = false }: { type: string; fields: Fields; onChange: (f: Fields) => void; only?: string[]; nested?: boolean }) {
  const set = (k: string, v: unknown) => onChange({ ...fields, [k]: v });
  const keys = Object.keys(fields).filter((k) => k !== "anchor").filter((k) => (nested ? (only ? only.includes(k) : true) : fieldShown(type, fields, k)));
  const ordered = only && nested ? only.filter((k) => keys.includes(k)) : keys;
  return (
    <div className="space-y-4">
      {ordered.map((k) => {
        const v = fields[k];
        if (/Alt$/.test(k) && IMAGE.test(k.slice(0, -3)) && k.slice(0, -3) in fields) return null; // edited with its image
        if (Array.isArray(v)) {
          const itemKeys = type === "cards" && k === "items" ? CARD_ITEM_FIELDS[String(fields.variant ?? "bordered")] : undefined;
          return <ListEditor key={k} type={type} name={k} value={v} onChange={(x) => set(k, x)} itemKeys={itemKeys} />;
        }
        if (typeof v === "boolean") return <div key={k}><Check label={humanize(k)} checked={v} onChange={(e) => set(k, e.target.checked)} />{FIELD_HINTS[k] && <p className="mt-0.5 pl-6 text-xs text-muted">{FIELD_HINTS[k]}</p>}</div>;
        if (IMAGE.test(k)) {
          const altKey = `${k}Alt`;
          const hasAlt = altKey in fields;
          return <MediaPicker key={k} label={humanize(k)} value={String(v ?? "")} onChange={(u) => set(k, u)} folder="Pages" alt={hasAlt ? String(fields[altKey] ?? "") : undefined} onAltChange={hasAlt ? (a) => set(altKey, a) : undefined} />;
        }
        const options = !nested || k === "icon" ? optionsFor(type, k) : undefined;
        const text = String(v ?? "");
        const placeholder = /\[[A-Za-z][^\]]{1,40}\]/.test(text);
        const hint = placeholder ? "Contains a [placeholder] to replace." : FIELD_HINTS[k] ?? (k === "heading" ? `${text.length} characters` : undefined);
        if (options) return <Field key={k} label={humanize(k)} hint={hint}><Select value={text} onChange={(e) => set(k, e.target.value)} options={options} /></Field>;
        const long = LONG.test(k) || text.length > 90 || text.includes("\n");
        return (
          <Field key={k} label={humanize(k)} hint={hint}>
            {long ? <Textarea value={text} rows={k === "body" ? 8 : 3} onChange={(e) => set(k, e.target.value)} /> : <Input value={text} onChange={(e) => set(k, e.target.value)} />}
          </Field>
        );
      })}
    </div>
  );
}
