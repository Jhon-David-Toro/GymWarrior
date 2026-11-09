import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db, schema } from "@/server/db";

export const CACHE_TAGS = {
  products: "products",
  product: (slug: string) => `product:${slug}`,
  plans: "plans",
  trainers: "trainers",
} as const;

const publicProductColumns = {
  id: true,
  slug: true,
  name: true,
  description: true,
  price: true,
  compareAtPrice: true,
  category: true,
  imageUrl: true,
  stock: true,
  isFeatured: true,
} as const;

export type CatalogProduct = Pick<schema.Product, keyof typeof publicProductColumns>;

/**
 * Retrieves all active products from catalog
 * @returns Active products ordered by featured status, category and name
 */
export async function getActiveProducts(): Promise<CatalogProduct[]> {
  "use cache";
  cacheTag(CACHE_TAGS.products);
  cacheLife("hours");

  return db.query.product.findMany({
    columns: publicProductColumns,
    where: eq(schema.product.isActive, true),
    orderBy: [
      desc(schema.product.isFeatured),
      asc(schema.product.category),
      asc(schema.product.name),
    ],
  });
}

/**
 * Retrieves single product by slug
 * @param slug - Product slug identifier
 * @returns Product or null if not found or inactive
 */
export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  "use cache";
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.product(slug));
  cacheLife("hours");

  const product = await db.query.product.findFirst({
    columns: publicProductColumns,
    where: and(eq(schema.product.slug, slug), eq(schema.product.isActive, true)),
  });

  return product ?? null;
}

/**
 * Retrieves all active membership plans
 * @returns Active plans ordered by sort order
 */
export async function getActivePlans(): Promise<schema.Plan[]> {
  "use cache";
  cacheTag(CACHE_TAGS.plans);
  cacheLife("days");

  return db.query.plan.findMany({
    where: eq(schema.plan.isActive, true),
    orderBy: asc(schema.plan.sortOrder),
  });
}

/**
 * Retrieves all gym trainers
 * @returns Trainers ordered by sort order
 */
export async function getTrainers(): Promise<schema.Trainer[]> {
  "use cache";
  cacheTag(CACHE_TAGS.trainers);
  cacheLife("days");

  return db.query.trainer.findMany({
    orderBy: asc(schema.trainer.sortOrder),
  });
}
