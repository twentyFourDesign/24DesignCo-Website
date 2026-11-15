import CmsPage from "@/components/sections/CmsPage";
import { pageMetadata } from "@/lib/cms/pages";

export const generateMetadata = () => pageMetadata("/services");

export default function Page() {
  return <CmsPage path="/services" />;
}
