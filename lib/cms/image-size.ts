// Reads width/height from the first bytes of PNG, JPEG, GIF and WebP files, and sniffs the real file type. No packages.
export type Sniffed = { mime: string; ext: string; width?: number; height?: number } | null;

const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.subarray(from, to));
const u16be = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];
const u32be = (b: Uint8Array, o: number) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const u16le = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);

function jpegSize(b: Uint8Array) {
  let o = 2;
  while (o + 9 < b.length) {
    if (b[o] !== 0xff) { o++; continue; }
    const marker = b[o + 1];
    if (marker === 0xff) { o++; continue; }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { o += 2; continue; }
    const len = u16be(b, o + 2);
    // SOF0..SOF15 except DHT (c4), JPG (c8) and DAC (cc)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: u16be(b, o + 5), width: u16be(b, o + 7) };
    }
    o += 2 + len;
  }
  return {};
}

function webpSize(b: Uint8Array) {
  const kind = ascii(b, 12, 16);
  if (kind === "VP8 " && b.length >= 30) return { width: u16le(b, 26) & 0x3fff, height: u16le(b, 28) & 0x3fff };
  if (kind === "VP8L" && b.length >= 25) {
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (kind === "VP8X" && b.length >= 30) {
    return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
  }
  return {};
}

/** Identifies the file from its bytes (never from what the browser claimed). SVG is detected loosely; the caller checks it is safe. */
export function sniff(b: Uint8Array): Sniffed {
  if (b.length > 24 && b[0] === 0x89 && ascii(b, 1, 4) === "PNG") return { mime: "image/png", ext: ".png", width: u32be(b, 16), height: u32be(b, 20) };
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: "image/jpeg", ext: ".jpg", ...jpegSize(b) };
  if (b.length > 10 && (ascii(b, 0, 6) === "GIF87a" || ascii(b, 0, 6) === "GIF89a")) return { mime: "image/gif", ext: ".gif", width: u16le(b, 6), height: u16le(b, 8) };
  if (b.length > 16 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP") return { mime: "image/webp", ext: ".webp", ...webpSize(b) };
  if (b.length > 5 && ascii(b, 0, 5) === "%PDF-") return { mime: "application/pdf", ext: ".pdf" };
  const head = new TextDecoder().decode(b.subarray(0, Math.min(b.length, 2048))).replace(/^﻿/, "").trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(head)) return { mime: "image/svg+xml", ext: ".svg" };
  return null;
}

/** SVGs can carry scripts. Refuse ones with script, event handlers, javascript: links, foreignObject, external references or embedded HTML. */
export function svgIsSafe(text: string) {
  return !/<script|<foreignObject|<iframe|<embed|<object|<!ENTITY|\son[a-z]+\s*=|javascript:|data:text\/html|(?:xlink:)?href\s*=\s*["']?\s*(?:https?:)?\/\//i.test(text);
}

/** Best-effort width and height from an SVG's width/height attributes or viewBox. */
export function svgSize(text: string): { width?: number; height?: number } {
  const tag = /<svg\b[^>]*>/i.exec(text)?.[0] ?? "";
  const num = (n: string) => { const m = new RegExp(`\\s${n}\\s*=\\s*["']\\s*([0-9.]+)\\s*(px)?\\s*["']`, "i").exec(tag); return m ? Math.round(parseFloat(m[1])) : undefined; };
  let width = num("width"), height = num("height");
  if (!width || !height) {
    const vb = /viewBox\s*=\s*["']\s*[-0-9.]+[ ,]+[-0-9.]+[ ,]+([0-9.]+)[ ,]+([0-9.]+)\s*["']/i.exec(tag);
    if (vb) { width = Math.round(parseFloat(vb[1])); height = Math.round(parseFloat(vb[2])); }
  }
  return { width, height };
}
