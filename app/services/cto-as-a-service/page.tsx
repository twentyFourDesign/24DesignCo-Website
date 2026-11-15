import CmsPage from "@/components/sections/CmsPage";
import { pageMetadata } from "@/lib/cms/pages";

export const generateMetadata = () => pageMetadata("/services/cto-as-a-service");

export default function Page() {
  return <CmsPage path="/services/cto-as-a-service" />;
}
