import "server-only";

import { asc, count, desc, eq, ne, sum } from "drizzle-orm";

import { requireAdmin } from "@/server/auth/session";
import { db, schema } from "@/server/db";

export async function getAdminStats() {
  await requireAdmin();
  const [[users], [orders], [members], lowStock] = await Promise.all([
    db.select({ value: count() }).from(schema.user),
    db
      .select({ value: count(), revenue: sum(schema.order.total) })
      .from(schema.order)
      .where(ne(schema.order.status, "CANCELLED")),
    db
      .select({ value: count() })
      .from(schema.membership)
      .where(eq(schema.membership.status, "ACTIVE")),
    db.query.product.findMany({
      columns: { id: true, name: true, stock: true },
      where: (p, { lte, and: andOp }) => andOp(lte(p.stock, 5), eq(p.isActive, true)),
      orderBy: asc(schema.product.stock),
    }),
  ]);

  return {
    users: users?.value ?? 0,
    orders: orders?.value ?? 0,
    revenue: Number(orders?.revenue ?? 0),
    activeMembers: members?.value ?? 0,
    lowStock,
  };
}

export async function getAdminProducts() {
  await requireAdmin();
  return db.query.product.findMany({
    orderBy: [asc(schema.product.category), asc(schema.product.name)],
  });
}

export async function getAdminProduct(id: string) {
  await requireAdmin();
  return (await db.query.product.findFirst({ where: eq(schema.product.id, id) })) ?? null;
}

export async function getAdminOrders(limit = 50) {
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
