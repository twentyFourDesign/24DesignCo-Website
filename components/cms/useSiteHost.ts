"use client";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** The address the site is being served from (for example 24designweb.vercel.app), for "Google result" previews. Empty while rendering on the server. */
export function useSiteHost() {
  return useSyncExternalStore(noop, () => window.location.host, () => "");
}
