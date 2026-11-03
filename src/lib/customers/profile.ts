"use server";

import { redirect } from "next/navigation";

import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { createAuthClient } from "@/lib/supabase/server";

export async function updateCustomerProfile(
  userId: string,
  updates: {
    full_name?: string | null;
    phone?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
  },
): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity || identity.userId !== userId) {
    redirect("/login?redirect=/account/profile");
  }

  const supabase = await createAuthClient();
  if (!supabase) {
    redirect("/account/profile?error=auth_not_configured");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    redirect("/account/profile?error=update_failed");
  }
}
