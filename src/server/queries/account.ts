import "server-only";

import { and, desc, eq, gt } from "drizzle-orm";

import { requireUser } from "@/server/auth/session";
import { db, schema } from "@/server/db";

const DAY_MS = 86_400_000;

/**
 * Lecturas privadas del usuario actual. Cada función resuelve el usuario por sí misma,
 * así nadie puede pedir datos de otra cuenta pasando un id distinto.
 */

export async function getMyActiveMembership() {
  const user = await requireUser("/cuenta");
  const membership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, user.id),
      eq(schema.membership.status, "ACTIVE"),
      gt(schema.membership.endsAt, new Date()),
    ),
    with: { plan: { columns: { name: true, slug: true, visits: true } } },
    orderBy: desc(schema.membership.endsAt),
  });
  if (!membership) return null;

  const daysLeft = Math.max(0, Math.ceil((membership.endsAt.getTime() - Date.now()) / DAY_MS));
  return { ...membership, daysLeft };
}

export async function getMyOrders(limit = 20) {
  const user = await requireUser("/cuenta/pedidos");
  return db.query.order.findMany({
    where: eq(schema.order.userId, user.id),
    with: { items: { columns: { id: true, quantity: true } } },
    orderBy: desc(schema.order.createdAt),
    limit,
  });
}

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
  if (!order) return null;

  /** El pedido se creó hace menos de 2 minutos (recién pagado). */
  const isRecent = Date.now() - order.createdAt.getTime() < 2 * 60_000;
  return { ...order, isRecent };
}

export async function getMyHealthRecords(limit = 10) {
  const user = await requireUser("/cuenta");
  return db.query.healthRecord.findMany({
    where: eq(schema.healthRecord.userId, user.id),
    orderBy: desc(schema.healthRecord.createdAt),
    limit,
  });
}
