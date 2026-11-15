"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type Tone = "ok" | "bad";
const Ctx = createContext<(message: string, tone?: Tone) => void>(() => {});
/** `const toast = useToast(); toast("Saved"); toast("Could not save", "bad");` */
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; message: string; tone: Tone }[]>([]);
  const push = useCallback((message: string, tone: Tone = "ok") => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { id, message, tone }]);
    setTimeout(() => setItems((l) => l.filter((i) => i.id !== id)), 4500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((i) => (
          <div key={i.id} role={i.tone === "bad" ? "alert" : "status"} className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-3.5 py-3 text-[13px] shadow-pop ${i.tone === "bad" ? "border-bad-line bg-surface text-bad" : "border-ok-line bg-surface text-ok"}`}>
            {i.tone === "bad" ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
            <span className="text-ink">{i.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
