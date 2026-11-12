import { cn } from "./core";

/** The 24 Design Co. mark (public/logo-mark.svg). */
export function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo-mark.svg" alt="" width={size} height={size} className={cn("shrink-0", className)} style={{ width: size, height: size }} aria-hidden />
  );
}

const initialsOf = (s: string) => s.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

/** A person's initials on a quiet neutral tile with a hairline ring. Flat, no gradient. */
export function Avatar({ name, size = 36, title, className }: { name: string; size?: number; title?: string; className?: string }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold text-ink-2 ring-1 ring-line", className)} style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.36)) }} title={title ?? name}>
      {initialsOf(name)}
    </span>
  );
}
