"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { updateTag } from "next/cache";

import { type ActionState } from "@/lib/action-result";
import { type CheckoutInput, checkoutSchema } from "@/lib/validations";
import { getCurrentUser } from "@/server/auth/session";
import { db, schema } from "@/server/db";
import { CACHE_TAGS } from "@/server/queries/catalog";

class CheckoutError extends Error {}

const ERROR_MESSAGES = {
  UNAUTHORIZED: "Inicia sesión para finalizar tu compra.",
  INVALID_CART: "Carrito inválido.",
  PRODUCT_UNAVAILABLE: "Uno de los productos ya no está disponible. Revisa tu carrito.",
  OUT_OF_STOCK: "se agotó.",
  LOW_STOCK: "Solo quedan",
  UNEXPECTED: "No pudimos procesar el pedido y no se hizo ningún cobro. Inténtalo de nuevo.",
} as const;

/**
 * Consolidates duplicate product IDs into quantity map
 * @param items - Cart items to consolidate
 * @returns Map of product IDs to total quantities
 */
function consolidateQuantities(items: CheckoutInput["items"]): Map<string, number> {
  const quantities = new Map<string, number>();

  for (const item of items) {
    const currentQuantity = quantities.get(item.productId) ?? 0;
    quantities.set(item.productId, currentQuantity + item.quantity);
  }

  return quantities;
}

/**
 * Fetches active products with lock for update
 * @param productIds - Product identifiers to fetch
 * @param tx - Database transaction
 * @returns Locked product records
 */
async function fetchProductsForUpdate(
  productIds: string[],
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
  return tx
    .select()
    .from(schema.product)
    .where(and(inArray(schema.product.id, productIds), eq(schema.product.isActive, true)))
    .for("update");
}

/**
 * Validates product availability matches cart
 * @param products - Available products
 * @param expectedCount - Expected product count
 * @throws CheckoutError if products unavailable
 */
function validateProductAvailability(products: unknown[], expectedCount: number) {
  if (products.length !== expectedCount) {
    throw new CheckoutError(ERROR_MESSAGES.PRODUCT_UNAVAILABLE);
  }
}

/**
 * Creates stock error message
 * @param productName - Name of product
 * @param availableStock - Available stock quantity
 * @returns Formatted error message
 */
function createStockErrorMessage(productName: string, availableStock: number): string {
  if (availableStock === 0) {
    return `${productName} ${ERROR_MESSAGES.OUT_OF_STOCK}`;
  }
  return `${ERROR_MESSAGES.LOW_STOCK} ${availableStock} unidades de ${productName}.`;
}

/**
 * Validates stock availability for cart items
 * @param products - Products with stock information
 * @param quantities - Requested quantities per product
 * @returns Total order amount
 * @throws CheckoutError if insufficient stock
 */
function validateStockAndCalculateTotal(
  products: Array<{ id: string; name: string; price: number; stock: number }>,
  quantities: Map<string, number>,
): number {
  let total = 0;

  for (const product of products) {
    const requestedQuantity = quantities.get(product.id) ?? 0;

    if (requestedQuantity > product.stock) {
      throw new CheckoutError(createStockErrorMessage(product.name, product.stock));
    }

    total += product.price * requestedQuantity;
  }

  return total;
}

/**
 * Creates order record in database
 * @param userId - User identifier
 * @param total - Order total amount
 * @param tx - Database transaction
 * @returns Created order ID
 */
async function createOrder(
  userId: string,
  total: number,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<string> {
  const [order] = await tx
    .insert(schema.order)
    .values({ userId, total, status: "PAID" })
    .returning({ id: schema.order.id });

  if (!order) {
    throw new Error("No se pudo crear el pedido");
  }

  return order.id;
}

/**
 * Creates order item records
 * @param orderId - Order identifier
 * @param products - Products in order
 * @param quantities - Quantities per product
 * @param tx - Database transaction
 */
async function createOrderItems(
  orderId: string,
  products: Array<{ id: string; name: string; price: number }>,
  quantities: Map<string, number>,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
  const orderItems = products.map((product) => ({
    orderId,
    productId: product.id,
    productName: product.name,
    unitPrice: product.price,
    quantity: quantities.get(product.id) ?? 0,
  }));

  await tx.insert(schema.orderItem).values(orderItems);
}

/**
 * Updates product stock after purchase
 * @param products - Products to update
 * @param quantities - Quantities purchased per product
 * @param tx - Database transaction
 */
async function updateProductStock(
  products: Array<{ id: string }>,
  quantities: Map<string, number>,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
  for (const product of products) {
    const purchasedQuantity = quantities.get(product.id) ?? 0;
    await tx
      .update(schema.product)
      .set({ stock: sql`${schema.product.stock} - ${purchasedQuantity}` })
      .where(eq(schema.product.id, product.id));
  }
}

/**
 * Processes checkout transaction
 * @param userId - User identifier
 * @param items - Cart items to process
 * @returns Created order ID
 */
async function processCheckout(userId: string, items: CheckoutInput["items"]): Promise<string> {
  const quantities = consolidateQuantities(items);
  const productIds = [...quantities.keys()];

  return db.transaction(async (tx) => {
    const products = await fetchProductsForUpdate(productIds, tx);
    validateProductAvailability(products, productIds.length);

    const total = validateStockAndCalculateTotal(products, quantities);
    const orderId = await createOrder(userId, total, tx);

    await createOrderItems(orderId, products, quantities, tx);
    await updateProductStock(products, quantities, tx);

    return orderId;
  });
}

/**
 * Creates order from cart items
 * @param input - Cart items with product IDs and quantities
 * @returns Action result with order ID or error
 */
export async function checkoutAction(
  input: CheckoutInput,
): Promise<ActionState<{ orderId: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: ERROR_MESSAGES.UNAUTHORIZED };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const errorMessage = parsed.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_CART;
    return { status: "error", message: errorMessage };
  }

  try {
    const orderId = await processCheckout(user.id, parsed.data.items);
    updateTag(CACHE_TAGS.products);
    return { status: "success", message: "Pedido confirmado.", data: { orderId } };
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { status: "error", message: error.message };
    }
    console.error("[checkout] Unexpected error:", error);
    return { status: "error", message: ERROR_MESSAGES.UNEXPECTED };
  }
}
