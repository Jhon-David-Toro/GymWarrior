"use server";

import { eq, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState, fromZodError } from "@/lib/action-result";
import { orderStatusSchema, productFormSchema } from "@/lib/validations";
import { requireAdmin } from "@/server/auth/session";
import { db, schema } from "@/server/db";
import { CACHE_TAGS } from "@/server/queries/catalog";

function isUniqueViolation(error: unknown) {
  const cause = (error as { cause?: { code?: string } })?.cause;
  return (error as { code?: string })?.code === "23505" || cause?.code === "23505";
}

export async function saveProductAction(
  productId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZodError(parsed.error, formData);

  try {
    if (productId) {
      const [before] = await db
        .select({ slug: schema.product.slug })
        .from(schema.product)
        .where(eq(schema.product.id, productId));
      await db.update(schema.product).set(parsed.data).where(eq(schema.product.id, productId));
      if (before) updateTag(CACHE_TAGS.product(before.slug));
    } else {
      await db.insert(schema.product).values(parsed.data);
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        message: "Revisa los campos marcados.",
        fieldErrors: { slug: ["Ya existe un producto con este slug."] },
      };
    }
    throw error;
  }

  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.product(parsed.data.slug));
  redirect("/admin/productos");
}

export async function toggleProductActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await db.query.product.findFirst({ where: eq(schema.product.id, id) });
  if (!product) return;

  await db
    .update(schema.product)
    .set({ isActive: !product.isActive })
    .where(eq(schema.product.id, id));
  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.product(product.slug));
}

/**
 * Cambia el estado de un pedido. Al cancelarlo se devuelve el stock;
 * un pedido cancelado no se puede reabrir (habría que crear uno nuevo).
 */
export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = orderStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { orderId, status } = parsed.data;

  await db.transaction(async (tx) => {
    const [current] = await tx
      .select({ status: schema.order.status })
      .from(schema.order)
      .where(eq(schema.order.id, orderId))
      .for("update");
    if (!current || current.status === "CANCELLED" || current.status === status) return;

    if (status === "CANCELLED") {
      const items = await tx
        .select({ productId: schema.orderItem.productId, quantity: schema.orderItem.quantity })
        .from(schema.orderItem)
        .where(eq(schema.orderItem.orderId, orderId));
      for (const item of items) {
        await tx
          .update(schema.product)
          .set({ stock: sql`${schema.product.stock} + ${item.quantity}` })
          .where(eq(schema.product.id, item.productId));
      }
      updateTag(CACHE_TAGS.products);
    }

    await tx.update(schema.order).set({ status }).where(eq(schema.order.id, orderId));
  });

  refresh();
}
