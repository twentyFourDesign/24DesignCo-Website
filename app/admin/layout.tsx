import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Admin | 24 Design Co.", robots: { index: false, follow: false } };

/** Applies the saved theme (light, dark or system) before first paint so the admin never flashes the wrong one. */
const THEME = `try{var t=localStorage.getItem("cms-theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.getElementById("cms-root").classList.toggle("dark",d)}catch(e){}`;

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <div id="cms-root" className="cms min-h-screen" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME }} />
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted">Loading…</div>}>{children}</Suspense>
    </div>
  );
}
