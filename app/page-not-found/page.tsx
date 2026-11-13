import { notFound } from "next/navigation";

// Where the proxy sends addresses that do not exist; it shows the site's normal not-found page.
export default function Page() {
  notFound();
}
