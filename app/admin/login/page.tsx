import { redirect } from "next/navigation";
import { getUser } from "@/lib/cms/auth";
import { Logo } from "@/components/cms/ui/brand";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await getUser()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3"><Logo size={40} /><div><p className="text-lg font-semibold text-ink">24 Design Co.</p><p className="text-[13px] text-muted">Website admin</p></div></div>
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h1 className="text-xl font-semibold text-ink">Sign in</h1>
          <p className="mt-1 text-[13px] text-muted">Use the email and password for your admin account.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
