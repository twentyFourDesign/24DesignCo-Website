import "server-only";
import { revalidateTag } from "next/cache";

/** Cache tags for public content. Readers use `cacheTag(TAGS.x)`; every admin write calls `bust(TAGS.x)` so the website updates at once. */
export const TAGS = { posts: "cms-posts", pages: "cms-pages", work: "cms-work", team: "cms-team", settings: "cms-settings", media: "cms-media" } as const;

export function bust(...tags: (typeof TAGS)[keyof typeof TAGS][]) {
  for (const t of tags) revalidateTag(t, { expire: 0 });
}
