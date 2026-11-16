/** Sends an event to Google Analytics 4 when it is set up (Admin › Settings › Integrations). Does nothing otherwise. */
export function track(name: string, params: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  w.gtag?.("event", name, { page: window.location.pathname, ...params });
}
