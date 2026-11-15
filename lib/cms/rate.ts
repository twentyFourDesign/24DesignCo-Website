import "server-only";
import { sql } from "./db";

/** Fixed-window rate limit kept in the database, so it holds across serverless instances. Returns true when the call is allowed. */
export async function allow(key: string, limit: number, windowSeconds: number) {
  const [row] = await sql`
    insert into cms_rate (key, count, window_start) values (${key}, 1, now())
    on conflict (key) do update set
      count = case when cms_rate.window_start < now() - make_interval(secs => ${windowSeconds}) then 1 else cms_rate.count + 1 end,
      window_start = case when cms_rate.window_start < now() - make_interval(secs => ${windowSeconds}) then now() else cms_rate.window_start end
    returning count`;
  return Number(row.count) <= limit;
}

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
}
