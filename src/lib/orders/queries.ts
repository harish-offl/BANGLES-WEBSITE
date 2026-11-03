import "server-only";

import { getCustomerIdentity } from "@/lib/auth/auth-utils";
import type { CustomerNotification, Order, OrderStatusHistory } from "@/types";

import { getCatalog } from "@/lib/data";

/**
 * Lists the orders belonging to the currently signed-in customer.
 *
 * Customers can never see another customer's orders: the lookup filters by
 * `customer_id` after verifying the caller is authenticated.
 */
export async function getCustomerOrders(): Promise<Order[]> {
  const identity = await getCustomerIdentity();
  if (!identity) return [];
  return getCatalog().listCustomerOrders(identity.userId);
}

/**
 * Returns a single order owned by the current customer, or null when it does
 * not exist or belongs to another customer.
 */
export async function getCustomerOrderById(id: string): Promise<Order | null> {
  const identity = await getCustomerIdentity();
  if (!identity) return null;
  return getCatalog().getCustomerOrderById(identity.userId, id);
}

/**
 * Returns the append-only audit trail for an order owned by the current
 * customer. Empty array when the order does not belong to the caller.
 */
export async function getCustomerOrderHistory(
  id: string,
): Promise<OrderStatusHistory[]> {
  const identity = await getCustomerIdentity();
  if (!identity) return [];

  const order = await getCatalog().getCustomerOrderById(identity.userId, id);
  if (!order) return [];

  return getCatalog().listOrderStatusHistory(order.id);
}

/**
 * Returns the notifications belonging to the current customer, newest first.
 */
export async function getCustomerNotifications(): Promise<CustomerNotification[]> {
  const identity = await getCustomerIdentity();
  if (!identity) return [];
  return getCatalog().listCustomerNotifications(identity.userId);
}