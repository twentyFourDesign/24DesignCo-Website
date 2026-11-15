import "./env";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import postgres from "postgres";

// Creates the first owner account if there is no owner yet. Uses OWNER_EMAIL / OWNER_NAME / OWNER_PASSWORD, or prints a temporary password.
async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  const [{ n }] = await sql`select count(*)::int as n from cms_users where role = 'owner'`;
  if (n > 0) { console.log("An owner account already exists."); await sql.end(); return; }
  const email = (process.env.OWNER_EMAIL || "wole@24group.com.ng").toLowerCase();
  const name = process.env.OWNER_NAME || "Oluwole Olarewaju";
  const temp = !process.env.OWNER_PASSWORD;
  const password = process.env.OWNER_PASSWORD || crypto.randomBytes(9).toString("base64url");
  await sql`insert into cms_users (name, email, role, status, password_hash) values (${name}, ${email}, 'owner', 'active', ${await bcrypt.hash(password, 12)})`;
  console.log(`Owner account: ${email}`);
  if (temp) console.log(`Temporary password: ${password}  (change it under your profile after signing in)`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
