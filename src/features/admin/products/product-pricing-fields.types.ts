import type { Product } from "@/server/db/schema";

export interface ProductPricingFieldsProps {
  errors?: Record<string, string[] | undefined>;
  getDefaultValue: (key: keyof Product) => string | undefined;
}
