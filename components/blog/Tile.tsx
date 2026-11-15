import { categoryLook } from "@/lib/blog-visuals";

/** A coloured category tile, used in place of a photo. */
export default function Tile({ category, className = "", glyphClass = "", dot }: { category: string; className?: string; glyphClass?: string; dot?: string }) {
  const look = categoryLook(category);
  return (
    <div aria-hidden="true" className={`flex items-center justify-center font-display font-extrabold text-white ${className}`} style={{ background: look.bg }}>
      <span className={glyphClass}>
        {look.glyph}
        {dot && <span className="text-launch">{dot}</span>}
      </span>
    </div>
  );
}

