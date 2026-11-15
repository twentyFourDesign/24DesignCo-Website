/**
 * Structured data for Google. The JSON is escaped so text from the CMS (an article's questions, a title) can never close the
 * <script> tag and run code: "<", ">" and "&" become \u003c, \u003e and \u0026, which JSON readers treat as the same characters.
 */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
