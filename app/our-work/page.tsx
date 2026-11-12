import CmsPage from "@/components/sections/CmsPage";
import { pageMetadata } from "@/lib/cms/pages";

export const generateMetadata = () => pageMetadata("/our-work");

export default function Page() {
  return <CmsPage path="/our-work" />;
}
