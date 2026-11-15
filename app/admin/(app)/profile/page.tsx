import { requireUser } from "@/lib/cms/auth";
import { PageHeader } from "@/components/cms/ui/layout";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const me = await requireUser();
  return (
    <>
      <PageHeader title="Your profile" description={`Signed in as ${me.email} (${me.role}).`} />
      <ProfileForm name={me.name} />
    </>
  );
}
