/**
 * Stat values can count up on their own: "since 2022-02" shows the time elapsed since that month
 * ("4 yrs 9 mos", or "7 months" under a year) and moves on by itself every month.
 */
const SINCE = /^since\s+(\d{4})-(\d{1,2})$/i;

export function isSinceValue(value: string) {
  return SINCE.test(value.trim());
}

export function statValue(value: string, now = new Date()) {
  const m = SINCE.exec(value.trim());
  if (!m) return value;
  // Months are counted in Lagos time, so the counter ticks over on the 1st there.
  const [y, mo] = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit" }).format(now).split("-").map(Number);
  const months = Math.max(0, y * 12 + mo - (Number(m[1]) * 12 + Number(m[2])));
  const yrs = Math.floor(months / 12), mos = months % 12;
  if (yrs === 0) return `${mos} ${mos === 1 ? "month" : "months"}`;
  const ys = `${yrs} ${yrs === 1 ? "yr" : "yrs"}`;
  return mos ? `${ys} ${mos} ${mos === 1 ? "mo" : "mos"}` : ys;
}
