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
 * Creates an order from the cart items
 * @param input - Cart items with product IDs and quantities
 * @returns Action result with order ID or error
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
        products.map((product) => ({
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: quantities.get(product.id) ?? 0,
        })),
      );

      for (const product of products) {
        await tx
          .update(schema.product)
          .set({ stock: sql`${schema.product.stock} - ${quantities.get(product.id) ?? 0}` })
          .where(eq(schema.product.id, product.id));
      }

      return order.id;
    });

    updateTag(CACHE_TAGS.products);
    return { status: "success", message: "Pedido confirmado.", data: { orderId } };
  } catch (error) {
    if (error instanceof CheckoutError) return { status: "error", message: error.message };
    console.error("[checkout] Unexpected error:", error);
    return {
      status: "error",
      message: "No pudimos procesar el pedido y no se hizo ningún cobro. Inténtalo de nuevo.",
    };
  }
}
