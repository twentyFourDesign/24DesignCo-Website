// Brings the database up to date. Run once after each upload:  node migrate.mjs
// Reads DATABASE_URL from the environment (set it in cPanel's Node.js app settings).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set. Add it in cPanel > Setup Node.js App > Environment variables."); process.exit(1); }
const sql = postgres(url, { max: 1, onnotice: () => {} });
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "db/migrations");

try {
  await sql`create table if not exists cms_migrations (name text primary key, applied_at timestamptz not null default now())`;
  const done = new Set((await sql`select name from cms_migrations`).map((r) => r.name));
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(file)) continue;
    console.log("applying", file);
    await sql.begin(async (tx) => {
      await tx.unsafe(fs.readFileSync(path.join(dir, file), "utf8"));
      await tx`insert into cms_migrations (name) values (${file})`;
    });
  }
  console.log("Database is up to date.");
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await sql.end();
}
