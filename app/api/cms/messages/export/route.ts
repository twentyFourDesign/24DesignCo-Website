import { api } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";

// Spreadsheet programs run text that starts with = + - @ (or a tab/CR) as a formula. A leading apostrophe stops that.
const csvCell = (v: unknown) => {
  let s = v instanceof Date ? v.toISOString() : String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export const GET = api(async () => {
  await requireApi("editor");
  const rows = await sql`select * from cms_messages order by created_at desc`;
  const head = ["Received", "Name", "Email", "WhatsApp", "Stage", "Message", "Status", "Notes"];
  const lines = rows.map((m) => [m.createdAt, m.name, m.email, m.whatsapp, m.stage, m.message, m.status, m.notes].map(csvCell).join(","));
  return new Response("﻿" + [head.map(csvCell).join(","), ...lines].join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="website-messages.csv"', "Cache-Control": "no-store" },
  });
});
