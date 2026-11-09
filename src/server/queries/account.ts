import "server-only";

import { and, desc, eq, gt } from "drizzle-orm";

import { requireUser } from "@/server/auth/session";
import { db, schema } from "@/server/db";

const DAY_MS = 86_400_000;
const TWO_MINUTES_MS = 2 * 60_000;
const DEFAULT_ORDER_LIMIT = 20;
const DEFAULT_HEALTH_RECORD_LIMIT = 10;

/**
 * Calculates days remaining until date
 * @param endDate - Target date
 * @returns Days remaining (minimum 0)
 */
function calculateDaysRemaining(endDate: Date): number {
  const millisecondsRemaining = endDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(millisecondsRemaining / DAY_MS));
}

/**
 * Checks if date is within recent threshold
 * @param date - Date to check
 * @param thresholdMs - Threshold in milliseconds
 * @returns True if date is recent
 */
function isRecent(date: Date, thresholdMs: number): boolean {
  return Date.now() - date.getTime() < thresholdMs;
}

/**
 * Retrieves active membership for current user
 * @returns Active membership with plan details and days remaining, or null
 */
export async function getMyActiveMembership() {
  const user = await requireUser("/cuenta");
  const now = new Date();

  const membership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, user.id),
      eq(schema.membership.status, "ACTIVE"),
      gt(schema.membership.endsAt, now),
    ),
    with: { plan: { columns: { name: true, slug: true, visits: true } } },
    orderBy: desc(schema.membership.endsAt),
  });

  if (!membership) {
    return null;
  }

  const daysLeft = calculateDaysRemaining(membership.endsAt);
  return { ...membership, daysLeft };
}

/**
 * Retrieves order history for current user
 * @param limit - Maximum number of orders to return
 * @returns User orders with item counts
 */
export async function getMyOrders(limit = DEFAULT_ORDER_LIMIT) {
  const user = await requireUser("/cuenta/pedidos");

  return db.query.order.findMany({
    where: eq(schema.order.userId, user.id),
    with: { items: { columns: { id: true, quantity: true } } },
    orderBy: desc(schema.order.createdAt),
    limit,
  });
}

/**
 * Retrieves single order for current user
 * @param orderId - Order identifier
 * @returns Order with items and product details, or null if not found
 */
export async function getMyOrder(orderId: string) {
  const user = await requireUser(`/cuenta/pedidos/${orderId}`);

  const order = await db.query.order.findFirst({
    where: and(eq(schema.order.id, orderId), eq(schema.order.userId, user.id)),
    with: {
      items: {
        with: { product: { columns: { slug: true, imageUrl: true } } },
      },
    },
  });

  if (!order) {
    return null;
  }

  const isRecentOrder = isRecent(order.createdAt, TWO_MINUTES_MS);
  return { ...order, isRecent: isRecentOrder };
}

/**
 * Retrieves health calculation history for current user
 * @param limit - Maximum number of records to return
 * @returns Health records ordered by creation date
 */
export async function getMyHealthRecords(limit = DEFAULT_HEALTH_RECORD_LIMIT) {
  const user = await requireUser("/cuenta");

  return db.query.healthRecord.findMany({
    where: eq(schema.healthRecord.userId, user.id),
    orderBy: desc(schema.healthRecord.createdAt),
    limit,
  });
}
