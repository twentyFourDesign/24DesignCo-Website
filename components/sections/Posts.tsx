import Link from "next/link";
import type { Fields } from "@/lib/cms/sections";
import type { BlogPost } from "@/lib/blog";
import { Band, Head, hasHead, str } from "./helpers";

export default function Posts({ f, posts }: { f: Fields; posts: BlogPost[] }) {
  const cat = str(f, "category").toLowerCase();
  const n = Math.max(1, Number(str(f, "count", "3")) || 3);
  const items = posts.filter((p) => !cat || p.category.toLowerCase() === cat).slice(0, n);
  return (
    <Band f={f} bg={str(f, "background", "white")}>
      <Head f={f} />
      <div className={`${hasHead(f) ? "mt-10 " : ""}grid gap-8 md:grid-cols-3`}>
        {items.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-2xl border border-slate-200 p-7">
            <p className="text-xs font-bold uppercase tracking-wide text-signal">{p.category}</p>
            <h3 className="mt-2 text-xl font-bold group-hover:text-signal">{p.title}</h3>
            <p className="mt-2 leading-relaxed text-slate-600">{p.description}</p>
            <p className="mt-4 text-sm text-slate-500">{p.readingMinutes} min read</p>
          </Link>
        ))}
        {items.length === 0 && <p className="text-slate-500">No posts to show yet.</p>}
      </div>
    </Band>
  );
}
