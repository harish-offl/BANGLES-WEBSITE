import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCustomerAddresses, addCustomerAddress } from "@/lib/customers/addresses";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{}>;
}

export default async function CustomerProfileAddressesPage({ params }: PageProps) {
  const addresses = await getCustomerAddresses();

  if (!addresses) redirect("/login?redirect=/customer/profile/addresses");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Saved Addresses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your delivery addresses.
          </p>
        </div>
        <Link
          href="/customer/profile/addresses/new"
          className="rounded-lg bg-brand-c100 px-4 py-2 text-sm font-medium text-brand-ink hover:bg-brand-c200"
        >
          Add address
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&rsquo;t saved any addresses yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-xl border border-border bg-card p-5 ${addr.is_default ? "border-gold-strong bg-brand-c100/30" : ""}`}
            >
              {addr.is_default && (
                <span className="inline-flex items-center gap-1 mb-2 text-xs font-semibold text-success">
                  Default
                </span>
              )}
              <p className="text-sm font-medium text-foreground">
                {addr.address_name ?? "Home"}
              </p>
              <p className="text-sm text-muted-foreground">
                {addr.full_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {addr.address_line_1}
                {addr.address_line_2 ? `, ${addr.address_line_2}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-sm text-muted-foreground">
                {addr.phone}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
