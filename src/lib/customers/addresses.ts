"use server";

import { redirect } from "next/navigation";

import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { createAuthClient } from "@/lib/supabase/server";

interface AddressInput {
  address_name?: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
  address_type?: string;
  is_default?: boolean;
}

interface CustomerAddress {
  id: string;
  customer_id: string;
  address_name: string | null;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  address_type: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getCustomerAddresses() {
  const identity = await getCustomerIdentity();
  if (!identity) return null;

  const supabase = await createAuthClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", identity.userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as CustomerAddress[] | null) ?? [];
}

export async function addCustomerAddress(input: AddressInput): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity) redirect("/login?redirect=/account/addresses");

  const supabase = await createAuthClient();
  if (!supabase) redirect("/account/addresses?error=auth_not_configured");

  // If setting as default, unset other defaults first
  if (input.is_default) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", identity.userId);
  }

  await supabase.from("customer_addresses").insert({
    customer_id: identity.userId,
    ...input,
  });
}

export async function updateCustomerAddress(addressId: string, input: AddressInput): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity) return;

  const supabase = await createAuthClient();
  if (!supabase) return;

  if (input.is_default) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", identity.userId);
  }

  await supabase
    .from("customer_addresses")
    .update(input)
    .eq("id", addressId)
    .eq("customer_id", identity.userId);
}

export async function deleteCustomerAddress(addressId: string): Promise<void> {
  const identity = await getCustomerIdentity();
  if (!identity) return;

  const supabase = await createAuthClient();
  if (!supabase) return;
  await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", addressId)
    .eq("customer_id", identity.userId);
}
