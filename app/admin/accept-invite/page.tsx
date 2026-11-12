import { Logo } from "@/components/cms/ui/brand";
import AcceptForm from "./AcceptForm";

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3"><Logo size={40} /><div><p className="text-lg font-semibold text-ink">24 Design Co.</p><p className="text-[13px] text-muted">Website admin</p></div></div>
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h1 className="text-xl font-semibold text-ink">Join the admin</h1>
          <AcceptForm token={token} />
        </div>
      </div>
    </main>
  );
}
