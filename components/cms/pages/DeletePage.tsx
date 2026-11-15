"use client";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";

export default function DeletePage({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const toast = useToast();
  return (
    <button type="button" className="text-[13px] font-medium text-bad hover:underline" onClick={async () => {
      if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
      try { await apiFetch(`/api/cms/pages/${id}`, { method: "DELETE" }); toast("Page deleted"); router.refresh(); } catch (e) { toast((e as Error).message, "bad"); }
    }}>Delete</button>
  );
}
