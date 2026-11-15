"use client";
import { apiFetch } from "./client";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, type MediaItem } from "./blog-shared";

/**
 * Uploads files one request at a time. Vercel refuses any request body over 4.5 MB, so sending several images together
 * (or one large one) would fail with a bare 413. Oversized files are caught here with a clear message before uploading.
 */
export async function uploadFiles(list: FileList | File[], folder: string, onProgress?: (done: number, total: number) => void) {
  const files: MediaItem[] = [];
  const errors: string[] = [];
  const arr = Array.from(list);
  for (let i = 0; i < arr.length; i++) {
    const f = arr[i];
    onProgress?.(i, arr.length);
    if (f.size > MAX_UPLOAD_BYTES) {
      errors.push(`${f.name}: larger than ${MAX_UPLOAD_LABEL}. Resize or compress it first.`);
      continue;
    }
    const fd = new FormData();
    fd.append("files", f);
    fd.append("folder", folder);
    try {
      const r = await apiFetch<{ files: MediaItem[]; errors: string[] }>("/api/cms/media", { method: "POST", body: fd });
      files.push(...r.files);
      errors.push(...(r.errors ?? []));
    } catch (e) {
      errors.push((e as Error).message);
    }
  }
  onProgress?.(arr.length, arr.length);
  return { files, errors };
}
