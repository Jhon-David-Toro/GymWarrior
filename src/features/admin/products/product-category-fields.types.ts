import type { Product } from "@/server/db/schema";

export interface ProductCategoryFieldsProps {
  errors?: Record<string, string[] | undefined>;
  getDefaultValue: (key: keyof Product) => string | undefined;
  isActive: boolean;
  isFeatured: boolean;
}
