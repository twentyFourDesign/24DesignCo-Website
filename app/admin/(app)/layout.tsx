import { requireUser } from "@/lib/cms/auth";
import { atLeast } from "@/lib/cms/roles";
import { sql } from "@/lib/cms/db";
import { AdminShell } from "@/components/cms/shell/AdminShell";
import { ToastProvider } from "@/components/cms/Toast";

// Every signed-in admin screen sits inside this frame. The layout only decides who may see the frame; pages and API routes
// check the role they need themselves, because a layout does not re-run on every client navigation.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // The orange count beside "Idea reviews": calls booked for the next seven days.
  const upcoming = atLeast(user.role, "editor")
    ? ((await sql`select count(*)::int as n from cms_bookings where start_at >= now() and start_at < now() + interval '7 days' and status in ('pending','confirmed')`)[0].n as number)
    : 0;
  return <ToastProvider><AdminShell user={user.name || user.email} role={user.role} upcoming={upcoming}>{children}</AdminShell></ToastProvider>;
}
