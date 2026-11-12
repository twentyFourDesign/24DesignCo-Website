"use client";
import { useEffect, useState } from "react";

/** The address the site is being served from (for example 24designweb.vercel.app), for "Google result" previews. Empty until the page has loaded. */
export function useSiteHost() {
  const [host, setHost] = useState("");
  useEffect(() => setHost(window.location.host), []);
  return host;
}
