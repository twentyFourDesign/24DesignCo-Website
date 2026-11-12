import Link from "next/link";

/** The 24 Design Co. mark (public/logo-mark.svg) with the name beside it, for the dark header. */
export default function Logo() {
  return (
    <Link href="/" aria-label="24 Design Co. home" className="flex items-center gap-3 text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.svg" alt="" width={44} height={44} className="h-11 w-11" />
      <span className="font-display text-lg font-bold">Design Co.</span>
    </Link>
  );
}
