import Link from "next/link";

export default function StickyBar({ label, url }: { label: string; url: string }) {
  return (
    <div className="site-chrome fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-navy p-3 md:hidden">
      <Link href={url} className="block w-full rounded-lg bg-signal px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-blue-700">{label}</Link>
    </div>
  );
}
