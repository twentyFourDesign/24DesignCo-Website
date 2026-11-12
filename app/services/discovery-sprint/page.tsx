import CmsPage from "@/components/sections/CmsPage";
import { pageMetadata } from "@/lib/cms/pages";

export const generateMetadata = () => pageMetadata("/services/discovery-sprint");

export default function Page() {
  return <CmsPage path="/services/discovery-sprint" />;
}
