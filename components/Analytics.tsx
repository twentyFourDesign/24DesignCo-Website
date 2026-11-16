"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Counts the clicks the SEO plan measures, without touching each button:
 * the "Book a free idea review" call to action (any link to /contact, or anything marked data-cta), WhatsApp, phone and email links.
 * Form sends (booking_submit, form_submit, newsletter_signup) are counted by the forms themselves.
 */
export default function Analytics() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest?.("a,button");
      if (!el || el.closest("#cms-root")) return;
      const href = el.getAttribute("href") || "";
      const label = (el.textContent || "").trim().slice(0, 80);
      if (href.includes("wa.me/")) track("whatsapp_click");
      else if (href.startsWith("tel:")) track("phone_click");
      else if (href.startsWith("mailto:")) track("email_click");
      else if (el.hasAttribute("data-cta") || /^\/contact(\/|#|\?|$)/.test(href)) {
        const location = el.getAttribute("data-cta") || (el.closest("header") ? "header" : el.closest("footer") ? "footer" : "page");
        track("cta_click", { label, location });
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
