import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/settings-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { getCatalog } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getCatalog().getSettings();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Store details, contact channels and storefront copy. Changes reach the live site within seconds."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
