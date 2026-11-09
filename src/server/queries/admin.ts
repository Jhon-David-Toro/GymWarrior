import "server-only";

import { asc, count, desc, eq, ne, sum } from "drizzle-orm";

import { requireAdmin } from "@/server/auth/session";
import { db, schema } from "@/server/db";

const LOW_STOCK_THRESHOLD = 5;
const DEFAULT_ORDER_LIMIT = 50;

/**
 * Fetches total user count
 * @returns User count record
 */
async function getUserCount() {
  const [result] = await db.select({ value: count() }).from(schema.user);
  return result;
}

/**
 * Fetches order statistics excluding cancelled orders
 * @returns Order count and revenue
 */
async function getOrderStats() {
  const [result] = await db
    .select({ value: count(), revenue: sum(schema.order.total) })
    .from(schema.order)
    .where(ne(schema.order.status, "CANCELLED"));
  return result;
}

/**
 * Fetches active membership count
 * @returns Active membership count
 */
async function getActiveMembershipCount() {
  const [result] = await db
    .select({ value: count() })
    .from(schema.membership)
    .where(eq(schema.membership.status, "ACTIVE"));
  return result;
}

/**
 * Fetches products with low stock
 * @returns Products below stock threshold
 */
async function getLowStockProducts() {
  return db.query.product.findMany({
    columns: { id: true, name: true, stock: true },
    where: (product, { lte, and: andOp }) =>
      andOp(lte(product.stock, LOW_STOCK_THRESHOLD), eq(product.isActive, true)),
    orderBy: asc(schema.product.stock),
  });
}

/**
 * Retrieves dashboard statistics for admin
 * @returns Dashboard stats including users, orders, revenue, active members and low stock items
 */
export async function getAdminStats() {
  await requireAdmin();

  const [users, orders, members, lowStock] = await Promise.all([
    getUserCount(),
    getOrderStats(),
    getActiveMembershipCount(),
    getLowStockProducts(),
  ]);

  return {
    users: users?.value ?? 0,
    orders: orders?.value ?? 0,
    revenue: Number(orders?.revenue ?? 0),
    activeMembers: members?.value ?? 0,
    lowStock,
  };
}

/**
 * Retrieves all products for admin management
 * @returns Products ordered by category and name
 */
export async function getAdminProducts() {
  await requireAdmin();

  return db.query.product.findMany({
    orderBy: [asc(schema.product.category), asc(schema.product.name)],
  });
}

/**
 * Retrieves single product by ID for admin editing
 * @param productId - Product identifier
 * @returns Product or null if not found
 */
export async function getAdminProduct(productId: string) {
  await requireAdmin();

  const product = await db.query.product.findFirst({
    where: eq(schema.product.id, productId),
  });

  return product ?? null;
}

/**
 * Retrieves recent orders with user and item details
 * @param limit - Maximum number of orders to return
 * @returns Orders with user and item information
 */
export async function getAdminOrders(limit = DEFAULT_ORDER_LIMIT) {
  await requireAdmin();

  return db.query.order.findMany({
    with: {
      user: { columns: { name: true, email: true } },
      items: { columns: { productName: true, quantity: true } },
    },
    orderBy: desc(schema.order.createdAt),
    limit,
  });
}
