import type { ReactNode } from "react";

// Same looks as Eyebrow, H2 and Card in components/ui.tsx. Copied here because ui.tsx now reads site settings on the server,
// and these renderers must also run in the admin preview (a client component).
export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`text-xs font-semibold uppercase tracking-[0.22em] md:text-sm ${light ? "text-blue-300" : "text-signal"}`}>{children}</p>;
}
export function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{children}</h2>;
}
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 p-7 md:p-8 ${className}`}>{children}</div>;
}
export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20 ${className}`}>{children}</section>;
}
