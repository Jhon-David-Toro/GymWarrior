import type { Product } from "@/server/db/schema";

export interface ProductBasicFieldsProps {
  errors?: Record<string, string[] | undefined>;
  getDefaultValue: (key: keyof Product) => string | undefined;
  slug: string;
  slugTouched: boolean;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
}
