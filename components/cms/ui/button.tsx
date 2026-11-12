"use client";

import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass, type Size, type Variant } from "./button-style";

/**
 * A button. Inside a form that saves through a server action, it shows a spinner and cannot be pressed twice while the save runs
 * (two submit buttons in one form: only the one that was pressed spins, the other waits). Outside a form it is a plain button.
 */
export function Button({ variant = "secondary", size = "md", className, children, disabled, name, value, type = "submit", ...p }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  const { pending, data } = useFormStatus();
  const mine = pending && (name ? data?.get(name) === value : true);
  return (
    <button {...p} type={type} name={name} value={value} disabled={disabled || (type === "submit" && pending)} aria-busy={mine || undefined} className={buttonClass(variant, size, className)}>
      {mine && <Loader2 className="size-4 animate-spin" aria-hidden />}
      <span className={mine ? "opacity-80" : undefined}>{children}</span>
      {mine && <span className="sr-only"> Saving</span>}
    </button>
  );
}
