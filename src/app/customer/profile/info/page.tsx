import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { createAuthClient } from "@/lib/supabase/server";
import { updateCustomerProfile } from "@/lib/customers/profile";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{}>;
}

export default async function CustomerProfileInfoPage({ params }: PageProps) {
  const identity = await getCustomerIdentity();
  if (!identity) redirect("/login?redirect=/customer/profile/info");

  const supabase = await createAuthClient();
  if (!supabase) redirect("/customer/profile/info?error=auth_not_configured");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email, phone, avatar_url, created_at, updated_at")
    .eq("id", identity.userId)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Customer Info
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and account details.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="size-32 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="size-32 rounded-full bg-brand-c100 flex items-center justify-center">
                <span className="text-brand-ink font-semibold text-lg">
                  {(identity.fullName ?? "C").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {profile?.display_name ?? identity.fullName ?? "Customer"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {identity.email ?? "No email on file"}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Customer ID: {identity.userId}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Member since:{new Date(profile?.created_at ?? identity.userId).toLocaleDateString(
                "en-IN",
                { day: "2-digit", month: "short", year: "numeric" },
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">
          Personal Information
        </h3>
        <form action={updateProfileAction} className="space-y-4">
          <input type="hidden" name="userId" value={identity.userId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile?.display_name ?? identity.fullName ?? ""}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={identity.email ?? ""}
                placeholder="name@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                Email changes require verification through Supabase.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? identity.phone ?? ""}
              placeholder="+91 98765 43210"
            />
          </div>

          <Button type="submit" className="w-full">
            Save changes
          </Button>
        </form>
      </div>
    </div>
  );
}

async function updateProfileAction(formData: FormData) {
  "use server";

  const userId = formData.get("userId") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  const { updateCustomerProfile } = await import("@/lib/customers/profile");
  await updateCustomerProfile(userId, {
    full_name: fullName || null,
    phone: phone || null,
  });

  redirect("/customer/profile/info?saved=1");
}
