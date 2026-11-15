import CmsPage from "@/components/sections/CmsPage";
import { pageMetadata } from "@/lib/cms/pages";

export const generateMetadata = () => pageMetadata("/how-we-work");

export default function Page() {
  return <CmsPage path="/how-we-work" />;
}
