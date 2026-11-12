import "./env";
import postgres from "postgres";
// Run with: NODE_OPTIONS=--conditions=react-server tsx scripts/seed-settings.ts (lets the server-only import resolve outside Next).
import { DEFAULT_SETTINGS } from "../lib/cms/settings";

// Stores the default site settings if none are saved yet. Safe to re-run; it never overwrites saved settings.
async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  const rows = await sql`insert into cms_settings (singleton, data) values ('site', ${sql.json(DEFAULT_SETTINGS as never)}) on conflict (singleton) do nothing returning singleton`;
  console.log(rows.length ? "Default settings saved." : "Settings already exist; left unchanged.");
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
