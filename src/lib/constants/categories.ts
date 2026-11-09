import type { ProductCategory } from "@/lib/types";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  SUPPLEMENTS: "Suplementos",
  APPAREL: "Ropa",
  ACCESSORIES: "Accesorios",
};

export const CATEGORY_SLUGS: Record<ProductCategory, string> = {
  SUPPLEMENTS: "suplementos",
  APPAREL: "ropa",
  ACCESSORIES: "accesorios",
};

/**
 * Converts a category slug to its enum value
 * @param slug - Category slug from URL
 * @returns Category enum or null if not found
 */
export function categoryFromSlug(slug: string | undefined): ProductCategory | null {
  const entry = Object.entries(CATEGORY_SLUGS).find(([, s]) => s === slug);
  return entry ? (entry[0] as ProductCategory) : null;
}
