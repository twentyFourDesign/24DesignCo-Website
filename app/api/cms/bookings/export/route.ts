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
  const rows = await sql`select * from cms_bookings order by start_at desc`;
  const head = ["Name", "Email", "Phone", "Company", "Idea", "Stage", "Budget", "Found us", "Start", "Status", "Meet link", "Notes"];
  const lines = rows.map((b) => [b.name, b.email, b.phone, b.company, b.idea, b.stage, b.budget, b.source, b.startAt, b.status, b.meetLink, b.notes].map(csvCell).join(","));
  return new Response("﻿" + [head.map(csvCell).join(","), ...lines].join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="idea-reviews.csv"', "Cache-Control": "no-store" },
  });
});
