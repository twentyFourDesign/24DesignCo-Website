import CmsPage from "@/components/sections/CmsPage";
import { pageMetadata } from "@/lib/cms/pages";

export const generateMetadata = () => pageMetadata("/services/mvp-development");

export default function Page() {
  return <CmsPage path="/services/mvp-development" />;
}
