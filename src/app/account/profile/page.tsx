import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { updateCustomerProfile } from "@/lib/customers/profile";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{}>;
}

export default async function ProfilePage({ params }: PageProps) {
  const identity = await getCustomerIdentity();
  if (!identity) redirect("/login?redirect=/account/profile");

  const profile = await getCustomerProfile(identity.userId);

  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <form action={updateProfileAction} className="space-y-5">
          <input type="hidden" name="userId" value={identity.userId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile.full_name ?? ""}
                placeholder="Your full name"
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
              />
              <p className="text-xs text-muted-foreground">
                Email changes require verification.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth (optional)</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={profile.date_of_birth ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender (optional)</Label>
              <Input id="gender" name="gender" defaultValue={profile.gender ?? ""} placeholder="e.g. Female" />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save changes
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">
          Account details
        </h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Account ID</dt>
            <dd className="font-medium text-foreground truncate">{identity.userId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="text-foreground">
              {new Date(profile.created_at ?? identity.userId).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email verified</dt>
            <dd className={cn("font-medium", identity.emailConfirmed ? "text-success" : "text-destructive")}>
              {identity.emailConfirmed ? "Yes" : "No"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Last updated</dt>
            <dd className="text-foreground">
              {new Date(profile.updated_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

async function getCustomerProfile(userId: string) {
  const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return (data as any) ?? null;
}

async function updateProfileAction(formData: FormData) {
  "use server";

  const userId = formData.get("userId") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string | undefined;
  const gender = formData.get("gender") as string | undefined;

  const { updateCustomerProfile } = await import("@/lib/customers/profile");
  await updateCustomerProfile(userId, {
    full_name: fullName || null,
    phone: phone || null,
    date_of_birth: dateOfBirth || null,
    gender: gender || null,
  });

  redirect("/account/profile");
}
