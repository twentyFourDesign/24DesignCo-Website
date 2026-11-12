import { requireUser } from "@/lib/cms/auth";
import { AdminShell } from "@/components/cms/shell/AdminShell";
import { ToastProvider } from "@/components/cms/Toast";

// Every signed-in admin screen sits inside this frame. The layout only decides who may see the frame; pages and API routes
// check the role they need themselves, because a layout does not re-run on every client navigation.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <ToastProvider><AdminShell user={user.name || user.email} role={user.role}>{children}</AdminShell></ToastProvider>;
}
