import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import { getCustomerOrders } from "@/lib/orders/queries";
import { CustomerOrdersList } from "@/components/account/customer-orders-list";

export const dynamic = "force-dynamic";

export default async function CustomerProfileOrdersPage() {
  const identity = await getCustomerIdentity();
  if (!identity) return null;

  const orders = await getCustomerOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"} on your account.
        </p>
      </div>

      <CustomerOrdersList initialOrders={orders} customerId={identity.userId} />
    </div>
  );
}
