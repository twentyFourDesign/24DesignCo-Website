import Link from "next/link";
import type { ReactNode } from "react";

export const CTA = "Book a free idea review";

export function PrimaryBtn({ className = "", children = CTA }: { className?: string; children?: ReactNode }) {
  return (
    <Link href="/contact" className={`inline-block rounded-lg bg-signal px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-blue-700 ${className}`}>
      {children}
    </Link>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`text-xs font-semibold uppercase tracking-[0.22em] md:text-sm ${light ? "text-blue-300" : "text-signal"}`}>{children}</p>;
}

export function PageHero({ eyebrow, title, children, extra }: { eyebrow: string; title: string; children?: ReactNode; extra?: ReactNode }) {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20">
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">{title}</h1>
        {children && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{children}</p>}
        {extra}
      </div>
    </section>
  );
}

export function Section({ children, id, className = "" }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20 ${className}`}>
      {children}
    </section>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{children}</h2>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 p-7 md:p-8 ${className}`}>{children}</div>;
}

export function Check({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((i) => (
        <li key={i} className="flex gap-3 text-slate-700">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-launch" />
          {i}
        </li>
      ))}
    </ul>
  );
}

export function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return <div className={`grid place-items-center rounded-2xl bg-slate-200 px-4 text-center text-slate-600 ${className}`}>{label}</div>;
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy pb-24 text-center text-sm text-slate-300 md:pb-0">
      <div className="mx-auto max-w-[1200px] px-5 py-8 md:px-8">
        <span className="hidden md:inline">1A, Road 3, Ikota Villa Estate, Lekki, Lagos · +234 70445 44455 · info@24group.com.ng</span>
        <span className="md:hidden">Lekki, Lagos · +234 70445 44455 · info@24group.com.ng</span>
      </div>
    </footer>
  );
}

export function CtaBand() {
  return (
    <>
      <section className="bg-navy text-center text-white">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">Let’s work together</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">Got an idea you want to build?</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300">Free 30-minute call. No obligation.</p>
          <PrimaryBtn className="mt-9" />
        </div>
      </section>
      <Footer />
    </>
  );
}
