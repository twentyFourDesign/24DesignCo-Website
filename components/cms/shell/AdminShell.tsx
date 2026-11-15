"use client";

import { Bell, CalendarClock, Inbox, ExternalLink, ChevronLeft, ChevronRight, FileText, FolderKanban, Image as ImageIcon, LayoutDashboard, LogOut, Menu, Newspaper, Search, Settings, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/components/cms/ui/core";
import { Avatar, Logo } from "@/components/cms/ui/brand";
import { useSiteHost } from "@/components/cms/useSiteHost";
import { NavProgress } from "@/components/cms/shell/NavProgress";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; min?: "author" | "editor" | "admin"; badge?: "bookings" | "messages" };
type NavGroup = { group: string; min?: "author" | "editor" | "admin"; items: NavItem[] };
// Same grouping as the original admin: CONTENT, BUSINESS, ADMIN.
const GROUPS: NavGroup[] = [
  { group: "CONTENT", items: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/pages", label: "Pages", icon: FileText, min: "editor" },
    { href: "/admin/blog", label: "Blog", icon: Newspaper },
    { href: "/admin/work", label: "Our Work", icon: FolderKanban, min: "editor" },
    { href: "/admin/team", label: "Team", icon: Users, min: "editor" },
    { href: "/admin/media", label: "Media library", icon: ImageIcon, min: "editor" },
  ] },
  { group: "BUSINESS", min: "editor", items: [
    { href: "/admin/bookings", label: "Idea reviews", icon: CalendarClock, min: "editor", badge: "bookings" },
    { href: "/admin/messages", label: "Messages", icon: Inbox, min: "editor", badge: "messages" },
  ] },
  { group: "ADMIN", min: "admin", items: [{ href: "/admin/settings", label: "Settings", icon: Settings, min: "admin" }] },
];
const RANK = { author: 0, editor: 1, admin: 2, owner: 3 } as const;

/**
 * The frame around every admin page: a sidebar that collapses to icons (the choice is kept), a sticky top bar with the section
 * title, search, theme switch, activity link and the person, and a drawer on a phone. Pages are server components passed as children.
 */
export function AdminShell({ user, role, upcoming = 0, unread = 0, children }: { user: string; role: keyof typeof RANK; upcoming?: number; unread?: number; children: ReactNode }) {
  const siteHost = useSiteHost();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const groups = GROUPS.filter((g) => RANK[role] >= RANK[g.min ?? "author"]).map((g) => ({ ...g, items: g.items.filter((n) => RANK[role] >= RANK[n.min ?? "author"]) }));
  const items = groups.flatMap((g) => g.items);
  const active = (n: NavItem) => (n.exact ? path === n.href : path === n.href || path.startsWith(`${n.href}/`));
  const current = path.startsWith("/admin/profile") ? "Your profile" : path.startsWith("/admin/search") ? "Search" : path.startsWith("/admin/activity") ? "Activity" : items.find(active)?.label ?? "Admin";

  useEffect(() => {
    // Read after hydration on purpose: localStorage does not exist on the server, so reading it while rendering would mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setCollapsed(localStorage.getItem("cms-sidebar") === "collapsed"); } catch { /* not kept */ }
  }, []);
  const toggle = () => setCollapsed((c) => { try { localStorage.setItem("cms-sidebar", c ? "open" : "collapsed"); } catch { /* not kept */ } return !c; });
  const signOut = async () => { await fetch("/api/cms/auth/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); };

  const sidebar = (narrow: boolean) => (
    <div className="flex h-full flex-col border-r border-nav-line bg-nav text-nav-text">
      <div className={cn("flex h-16 items-center border-b border-nav-line", narrow ? "justify-center" : "gap-3 px-4")}>
        <Logo size={36} />
        {!narrow && <span className="whitespace-nowrap font-display text-base font-extrabold leading-tight text-nav-ink">24 Design Co.<small className="block text-[11px] font-semibold tracking-[0.1em] text-accent-line">WEBSITE ADMIN</small></span>}
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-3">
        {groups.map((g) => (
          <div key={g.group}>
            {narrow ? <div className="mx-2 my-3 border-t border-nav-line" aria-hidden /> : <div className="mb-1.5 ml-3 mt-5 text-[11px] font-semibold tracking-[0.12em] text-slate-400 first:mt-2">{g.group}</div>}
            <div className="space-y-0.5">
              {g.items.map((n) => {
                const on = active(n);
                return (
                  <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined} title={narrow ? n.label : undefined}
                    className={cn("group relative flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors", narrow ? "justify-center px-0" : "gap-3 px-3", on ? "bg-nav-active text-nav-ink" : "hover:bg-nav-hover hover:text-nav-ink")}>
                    <span className={cn("absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-marker transition-opacity", on ? "opacity-100" : "opacity-0")} aria-hidden />
                    <n.icon className={cn("size-5 shrink-0 transition-transform", on ? "text-white" : "group-hover:scale-110")} aria-hidden />
                    {!narrow && n.label}
                    {n.badge === "bookings" && upcoming > 0 && (
                      <span className={cn("rounded-full bg-marker px-1.5 text-[11px] font-bold text-navy", narrow ? "absolute right-1.5 top-1" : "ml-auto")} aria-label={`${upcoming} this week`}>{upcoming}</span>
                    )}
                    {n.badge === "messages" && unread > 0 && (
                      <span className={cn("rounded-full bg-marker px-1.5 text-[11px] font-bold text-navy", narrow ? "absolute right-1.5 top-1" : "ml-auto")} aria-label={`${unread} new`}>{unread}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-nav-line p-3">
        <div className={cn("flex items-center", narrow ? "flex-col gap-2" : "gap-2.5 px-1.5 py-1")}>
          <Link href="/admin/profile" title="Your profile"><Avatar name={user} size={32} /></Link>
          {!narrow && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] text-nav-ink">{user}</div>
              <div className="text-xs capitalize text-nav-text">{role}</div>
            </div>
          )}
          <button type="button" onClick={signOut} aria-label="Sign out" title="Sign out" className="rounded-lg p-1.5 text-nav-text transition-colors hover:bg-nav-hover hover:text-nav-ink"><LogOut className="size-4" /></button>
        </div>
        {!narrow && (
          <div className="rounded-xl bg-nav-hover p-3.5 text-xs">
            <b className="block text-[13px] text-white">{siteHost || "Your website"}</b>
            <p className="mt-1 text-nav-text">Visitors see changes once you publish them.</p>
            <Link href="/" target="_blank" className="mt-2 inline-flex items-center gap-1.5 text-accent-line hover:text-white"><ExternalLink className="size-3.5" aria-hidden /> View website</Link>
          </div>
        )}
        <button type="button" onClick={toggle} className="hidden w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-nav-text transition-colors hover:bg-nav-hover hover:text-nav-ink lg:flex" aria-label={narrow ? "Expand the sidebar" : "Collapse the sidebar"}>
          {narrow ? <ChevronRight className="size-5" /> : <><ChevronLeft className="size-5" /><span>Collapse</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Suspense fallback={null}><NavProgress /></Suspense>
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-300 ease-out lg:block", collapsed ? "w-[72px]" : "w-[260px]")}>{sidebar(collapsed)}</aside>
      <div className={cn("flex min-h-screen min-w-0 flex-col transition-[padding] duration-300 ease-out", collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]")}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-1.5 text-ink-2 hover:bg-surface-2 lg:hidden"><Menu className="size-5" /></button>
            <p className="truncate text-xl font-semibold text-ink">{current}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <form action="/admin/search" method="get" role="search" className="relative hidden items-center sm:flex">
              <Search className="pointer-events-none absolute left-3 size-4 text-muted" aria-hidden />
              <input name="q" type="search" placeholder="Search everything…" aria-label="Search" className="h-9 w-48 rounded-lg border border-line bg-surface-2 pl-9 pr-3 text-sm text-ink transition-all duration-300 placeholder:text-muted focus:w-64 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
            </form>
            <Link href="/admin/activity" aria-label="Activity" title="Activity" className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"><Bell className="size-[18px]" aria-hidden /></Link>
            <Link href="/admin/profile" title={`${user} (${role})`}><Avatar name={user} size={36} /></Link>
          </div>
        </header>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-[var(--scrim)]" onClick={() => setOpen(false)} aria-hidden />
            <div className="absolute inset-y-0 left-0 w-[260px] shadow-pop">
              {sidebar(false)}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 rounded-lg p-1.5 text-nav-text hover:bg-nav-hover hover:text-nav-ink"><X className="size-4" /></button>
            </div>
          </div>
        )}
        <main className="mx-auto w-full min-w-0 max-w-[1320px] flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
