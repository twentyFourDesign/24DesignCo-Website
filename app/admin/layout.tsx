import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Admin | 24 Design Co.", robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <div id="cms-root" className="cms min-h-screen">
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted">Loading…</div>}>{children}</Suspense>
    </div>
  );
}
