"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

type NavLink = { label: string; url: string };

/** The menu comes from the admin settings (Menu tab); the layout passes it in. */
type Props = { navigation: NavLink[]; button: NavLink };

/** Reads the current address (to highlight the active link) and passes it to the view. Render it inside <Suspense> with <HeaderView path="" /> as the fallback. */
export default function Header(props: Props) {
  return <HeaderView {...props} path={usePathname()} />;
}

export function HeaderView({ navigation, button, path }: Props & { path: string }) {
  const links = navigation.map((n) => [n.label, n.url] as const);
  const [open, setOpen] = useState(false);
  const active = (h: string) => path === h || path.startsWith(h + "/");
  return (
    <header className="site-chrome sticky top-0 z-40 border-b border-white/10 bg-navy/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-9 text-[15px] lg:flex">
          {links.map(([l, h]) => (
            <Link key={l} href={h} className={`transition hover:text-white ${active(h) ? "text-white" : "text-slate-300"}`}>{l}</Link>
          ))}
        </nav>
        <Link href={button.url} className="hidden rounded-lg bg-signal px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-blue-700 lg:inline-block">
          {button.label}
        </Link>
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="rounded-lg bg-signal px-5 py-3 text-sm font-semibold text-white lg:hidden">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 px-5 pb-5 pt-2 lg:hidden">
          {links.map(([l, h]) => (
            <Link key={l} href={h} onClick={() => setOpen(false)} className="block py-3 text-slate-200">{l}</Link>
          ))}
          <Link href={button.url} onClick={() => setOpen(false)} className="block py-3 font-semibold text-white">{button.label}</Link>
        </nav>
      )}
    </header>
  );
}
