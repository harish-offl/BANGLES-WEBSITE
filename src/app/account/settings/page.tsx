import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { createAuthClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{}>;
}

export default async function SettingsPage({ params }: PageProps) {
  const identity = await getCustomerIdentity();
  if (!identity) redirect("/login?redirect=/account/settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">
          Change password
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Update your account password.
        </p>
        <form action={changePasswordAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" name="newPassword" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Change password
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">
          Email
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your current email:{" "}
          <span className="font-medium text-foreground">
            {identity.email ?? "—"}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Email changes require verification through Supabase.
        </p>
        <Button variant="outline" onClick={() => redirect("/account/profile")}>
          Manage profile
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">
          Danger zone
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Permanent account actions.
        </p>
        <Button variant="destructive" onClick={() => redirect("/account/settings/delete")}>
          Request account deletion
        </Button>
      </div>
    </div>
  );
}

async function changePasswordAction(formData: FormData) {
  "use server";

  const supabase = await createAuthClient();
  if (!supabase) {
    redirect("/account/settings?error=auth_not_configured");
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    redirect("/account/settings?error=password_change_failed");
  }

  redirect("/account/settings?success=password_changed");
}
