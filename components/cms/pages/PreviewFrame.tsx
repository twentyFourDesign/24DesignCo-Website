"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Sections, { type SectionData } from "@/components/sections/Sections";
import type { Section } from "@/lib/cms/sections";

/**
 * Live preview. The real public renderers are drawn into an iframe so the page responds to the frame's own width (Desktop 1280px,
 * Mobile 390px), exactly like the website. The frame is blank; the site's stylesheets and font variables are copied in.
 */
export default function PreviewFrame({ sections, data, mode }: { sections: Section[]; data: SectionData; mode: "desktop" | "mobile" }) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [box, setBox] = useState({ w: 600, h: 700 });
  const [contentH, setContentH] = useState(0);

  useLayoutEffect(() => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    doc.open(); doc.write("<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head><body></body></html>"); doc.close();
    document.querySelectorAll("link[rel=stylesheet], style").forEach((n) => doc.head.appendChild(n.cloneNode(true)));
    doc.documentElement.className = document.documentElement.className;
    doc.body.className = "antialiased";
    doc.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a")) e.preventDefault(); }, true);
    doc.addEventListener("submit", (e) => e.preventDefault(), true);
    setBody(doc.body);
  }, []);

  useEffect(() => {
    if (!wrap.current) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!body) return;
    const ro = new ResizeObserver(() => setContentH(body.ownerDocument.documentElement.scrollHeight));
    ro.observe(body);
    return () => ro.disconnect();
  }, [body]);

  const width = mode === "mobile" ? 390 : 1280;
  const scale = Math.min(1, box.w / width);
  const height = Math.max(400, box.h / scale);
  return (
    <div ref={wrap} className="h-[70vh] min-h-96 w-full overflow-auto rounded-lg border border-line bg-surface-2 xl:h-[calc(100vh-14rem)]">
      <div style={{ width: width * scale, height: Math.max(height * scale, contentH * scale), margin: "0 auto" }}>
        <iframe ref={frame} title="Page preview" style={{ width, height: Math.max(height, contentH), transform: `scale(${scale})`, transformOrigin: "top left", border: 0, background: "#fff" }} />
      </div>
      {body && createPortal(<Sections sections={sections} data={data} />, body)}
    </div>
  );
}
