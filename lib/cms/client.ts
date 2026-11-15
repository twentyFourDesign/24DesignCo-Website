"use client";

/** fetch() for the CMS API from client components: sends JSON, returns the parsed body, and throws an Error with the server's message. */
export async function apiFetch<T = Record<string, unknown>>(path: string, init: Omit<RequestInit, "body"> & { body?: unknown } = {}): Promise<T> {
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  const res = await fetch(path, {
    ...init,
    headers: isForm ? init.headers : { "Content-Type": "application/json", ...init.headers },
    body: init.body === undefined ? undefined : isForm ? (init.body as FormData) : JSON.stringify(init.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Something went wrong. Please try again.");
  return data as T;
}
