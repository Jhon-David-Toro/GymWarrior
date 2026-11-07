"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { updateTag } from "next/cache";

import { type ActionState } from "@/lib/action-result";
import { type CheckoutInput, checkoutSchema } from "@/lib/validations";
import { getCurrentUser } from "@/server/auth/session";
import { db, schema } from "@/server/db";
import { CACHE_TAGS } from "@/server/queries/catalog";

class CheckoutError extends Error {}

/**
 * Crea un pedido a partir del carrito.
 *
 * - Los precios se leen de la base de datos: el cliente solo envía ids y cantidades.
 * - Las filas de producto se bloquean (`FOR UPDATE`) para evitar vender stock que ya no existe
 *   cuando dos personas compran a la vez.
 * - Todo ocurre en una transacción: o se crea el pedido completo o no se crea nada.
 */
export async function checkoutAction(
  input: CheckoutInput,
): Promise<ActionState<{ orderId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Inicia sesión para finalizar tu compra." };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Carrito inválido." };
  }

  // Agrupa cantidades si el mismo producto llegó repetido.
  const quantities = new Map<string, number>();
  for (const item of parsed.data.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  const ids = [...quantities.keys()];

  try {
    const orderId = await db.transaction(async (tx) => {
      const products = await tx
        .select()
        .from(schema.product)
        .where(and(inArray(schema.product.id, ids), eq(schema.product.isActive, true)))
        .for("update");

      if (products.length !== ids.length) {
        throw new CheckoutError("Uno de los productos ya no está disponible. Revisa tu carrito.");
      }

      let total = 0;
      for (const product of products) {
        const qty = quantities.get(product.id) ?? 0;
        if (qty > product.stock) {
          throw new CheckoutError(
            product.stock === 0
              ? `${product.name} se agotó.`
              : `Solo quedan ${product.stock} unidades de ${product.name}.`,
          );
        }
        total += product.price * qty;
      }

      const [order] = await tx
        .insert(schema.order)
        .values({ userId: user.id, total, status: "PAID" })
        .returning({ id: schema.order.id });
      if (!order) throw new Error("No se pudo crear el pedido");

      await tx.insert(schema.orderItem).values(
        products.map((p) => ({
          orderId: order.id,
          productId: p.id,
          productName: p.name,
          unitPrice: p.price,
          quantity: quantities.get(p.id) ?? 0,
        })),
      );

      for (const p of products) {
        await tx
          .update(schema.product)
          .set({ stock: sql`${schema.product.stock} - ${quantities.get(p.id) ?? 0}` })
          .where(eq(schema.product.id, p.id));
      }

      return order.id;
    });

    updateTag(CACHE_TAGS.products);
    return { status: "success", message: "Pedido confirmado.", data: { orderId } };
  } catch (error) {
    if (error instanceof CheckoutError) return { status: "error", message: error.message };
    console.error("[checkout] error inesperado", error);
    return {
      status: "error",
      message: "No pudimos procesar el pedido y no se hizo ningún cobro. Inténtalo de nuevo.",
    };
  }
}
