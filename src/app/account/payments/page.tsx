import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { createAuthClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/site";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{}>;
}

export default async function PaymentsPage({ params }: PageProps) {
  const identity = await getCustomerIdentity();
  if (!identity) redirect("/login?redirect=/account/payments");

  const supabase = await createAuthClient();
  if (!supabase) redirect("/account/payments?error=auth_not_configured");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, total_amount, payment_status, created_at, razorpay_payment_id, razorpay_order_id")
    .eq("customer_id", identity.userId)
    .order("created_at", { ascending: false });

  const payments = (orders ?? []).map((order: any) => ({
    id: order.id,
    orderNumber: order.order_number,
    date: order.created_at,
    amount: order.total_amount,
    status: order.payment_status,
    method: "Razorpay",
    reference: order.razorpay_payment_id || order.razorpay_order_id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Payment History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your past payments and transaction details.
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No payments recorded yet.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex items-center rounded-lg border border-border bg-brand-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-c100"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="p-4 font-medium">Transaction ID</th>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p.id} className="p-4">
                  <td className="text-foreground font-medium truncate">
                    {p.reference || "—"}
                  </td>
                  <td className="text-foreground">
                    <Link href={`/account/orders/${p.id}`} className="hover:text-gold-strong">
                      #{p.orderNumber}
                    </Link>
                  </td>
                  <td className="text-muted-foreground">
                    {new Date(p.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="text-foreground">
                    {formatPrice(p.amount, "INR")}
                  </td>
                  <td className="text-muted-foreground capitalize">
                    {p.status}
                  </td>
                  <td className="text-muted-foreground">
                    {p.method}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
