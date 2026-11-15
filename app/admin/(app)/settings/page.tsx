import { requireUser } from "@/lib/cms/auth";
import { getSettings } from "@/lib/cms/settings";
import { googleCalendarConfigured } from "@/lib/cms/googleCalendar";
import { sql } from "@/lib/cms/db";
import { USER_COLUMNS } from "@/lib/cms/users";
import { PageHeader, Tabs } from "@/components/cms/ui/layout";
import { BusinessForm, FooterForm, IntegrationsForm, MenuForm, SeoForm } from "./SettingsForms";
import UsersPanel, { type UserItem } from "./UsersPanel";

const TABS = [["business", "Business"], ["menu", "Menu"], ["footer", "Footer"], ["seo", "SEO defaults"], ["integrations", "Integrations"], ["users", "Users and roles"]] as const;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await requireUser("admin");
  const sp = await searchParams;
  const tab = TABS.some(([id]) => id === sp.tab) ? sp.tab! : "business";
  const s = await getSettings();
  let body;
  if (tab === "business") body = <BusinessForm initial={s.site} />;
  else if (tab === "menu") body = <MenuForm initial={{ navigation: s.navigation, navButton: s.navButton }} />;
  else if (tab === "footer") body = <FooterForm initial={s.footer} />;
  else if (tab === "seo") body = <SeoForm initial={s.seoDefaults} />;
  else if (tab === "integrations") body = <IntegrationsForm initial={s.integrations} configured={googleCalendarConfigured()} />;
  else {
    const rows = await sql`select ${USER_COLUMNS()} from cms_users order by created_at asc`;
    const users: UserItem[] = rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString().slice(0, 10) : "" }));
    body = <UsersPanel users={users} meId={me.id} meRole={me.role} />;
  }
  return (
    <>
      <PageHeader title="Settings" description="Business details, navigation, SEO defaults, integrations and who can use the admin." />
      <Tabs tabs={TABS.map(([id, label]) => ({ id, label, href: `/admin/settings?tab=${id}` }))} current={tab} />
      {body}
    </>
  );
}
