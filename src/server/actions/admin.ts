"use server";

import { eq, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState, fromZodError } from "@/lib/action-result";
import { orderStatusSchema, productFormSchema } from "@/lib/validations";
import { requireAdmin } from "@/server/auth/session";
import { db, schema } from "@/server/db";
import { CACHE_TAGS } from "@/server/queries/catalog";

const UNIQUE_VIOLATION_CODE = "23505";

/**
 * Checks if database error is a unique constraint violation
 * @param error - Database error to check
 * @returns True if error is unique constraint violation
 */
function isUniqueViolation(error: unknown): boolean {
  const cause = (error as { cause?: { code?: string } })?.cause;
  return (
    (error as { code?: string })?.code === UNIQUE_VIOLATION_CODE ||
    cause?.code === UNIQUE_VIOLATION_CODE
  );
}

/**
 * Creates duplicate slug error state
 * @returns Action state with field-specific error
 */
const createDuplicateSlugError = (): ActionState => ({
  status: "error",
  message: "Revisa los campos marcados.",
  fieldErrors: { slug: ["Ya existe un producto con este slug."] },
});

/**
 * Retrieves product slug before update
 * @param productId - Product identifier
 * @returns Product slug or undefined if not found
 */
async function getProductSlug(productId: string): Promise<string | undefined> {
  const [result] = await db
    .select({ slug: schema.product.slug })
    .from(schema.product)
    .where(eq(schema.product.id, productId));
  return result?.slug;
}

/**
 * Updates existing product in database
 * @param productId - Product identifier
 * @param data - Product data to update
 */
async function updateProduct(productId: string, data: typeof schema.product.$inferInsert) {
  const previousSlug = await getProductSlug(productId);
  await db.update(schema.product).set(data).where(eq(schema.product.id, productId));

  if (previousSlug) {
    updateTag(CACHE_TAGS.product(previousSlug));
  }
}

/**
 * Creates new product in database
 * @param data - Product data to insert
 */
async function createProduct(data: typeof schema.product.$inferInsert) {
  await db.insert(schema.product).values(data);
}

/**
 * Saves product (creates or updates)
 * @param productId - Product ID for updates, null for creation
 * @param _prev - Previous action state (unused)
 * @param formData - Form data with product fields
 * @returns Action state or redirects on success
 */
export async function saveProductAction(
  productId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fromZodError(parsed.error, formData);
  }

  try {
    if (productId) {
      await updateProduct(productId, parsed.data);
    } else {
      await createProduct(parsed.data);
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return createDuplicateSlugError();
    }
    throw error;
  }

  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.product(parsed.data.slug));
  redirect("/admin/productos");
}

/**
 * Retrieves product by ID
 * @param productId - Product identifier
 * @returns Product or undefined if not found
 */
async function getProductById(productId: string) {
  return db.query.product.findFirst({ where: eq(schema.product.id, productId) });
}

/**
 * Toggles product active status
 * @param formData - Form data containing product ID
 */
export async function toggleProductActiveAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("id") ?? "");
  const product = await getProductById(productId);

  if (!product) {
    return;
  }

  await db
    .update(schema.product)
    .set({ isActive: !product.isActive })
    .where(eq(schema.product.id, productId));

  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.product(product.slug));
}

/**
 * Checks if order can be cancelled
 * @param currentStatus - Current order status
 * @param newStatus - Desired order status
 * @returns True if status change is allowed
 */
function canUpdateOrderStatus(currentStatus: string, newStatus: string): boolean {
  return currentStatus !== "CANCELLED" && currentStatus !== newStatus;
}

/**
 * Restores product stock from cancelled order
 * @param orderId - Order identifier
 * @param tx - Database transaction
 */
async function restoreProductStock(
  orderId: string,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
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

/**
 * Updates order status with stock restoration on cancellation
 * @param formData - Form data containing order ID and new status
 */
export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = orderStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  const { orderId, status } = parsed.data;

  await db.transaction(async (tx) => {
    const [current] = await tx
      .select({ status: schema.order.status })
      .from(schema.order)
      .where(eq(schema.order.id, orderId))
      .for("update");

    if (!current || !canUpdateOrderStatus(current.status, status)) {
      return;
    }

    if (status === "CANCELLED") {
      await restoreProductStock(orderId, tx);
    }

    await tx.update(schema.order).set({ status }).where(eq(schema.order.id, orderId));
  });

  refresh();
}
