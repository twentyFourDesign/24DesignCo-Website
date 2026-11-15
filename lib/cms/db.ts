import "server-only";
import postgres from "postgres";

// One shared pool per server instance. Neon's pooled connection string keeps this cheap on serverless.
// Columns come back camelCased (start_at -> startAt); jsonb values are plain objects.
const g = globalThis as unknown as { __cmsSql?: postgres.Sql };

function connect(): postgres.Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local.");
  return postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 20, transform: postgres.camel, onnotice: () => {} });
}

const get = () => (g.__cmsSql ??= connect());

/** Tagged-template SQL client. Created on first use so a missing DATABASE_URL only fails the pages that need it. */
export const sql = new Proxy(function () {} as unknown as postgres.Sql, {
  apply: (_t, _this, args) => (get() as unknown as (...a: unknown[]) => unknown)(...args),
  get: (_t, prop) => (get() as never)[prop],
}) as postgres.Sql;

export const dbConfigured = () => Boolean(process.env.DATABASE_URL);
