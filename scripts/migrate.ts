import "./env";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const sql = postgres(url, { max: 1, onnotice: () => {} });
const dir = path.join(process.cwd(), "db/migrations");

async function main() {

await sql`create table if not exists cms_migrations (name text primary key, applied_at timestamptz not null default now())`;
const done = new Set((await sql`select name from cms_migrations`).map((r) => r.name as string));
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  if (done.has(file)) continue;
  console.log("applying", file);
  await sql.begin(async (tx) => {
    await tx.unsafe(fs.readFileSync(path.join(dir, file), "utf8"));
    await tx`insert into cms_migrations (name) values (${file})`;
  });
}
console.log("migrations up to date");
await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
