import { Checkbox, Field, Input, Select } from "@/components/ui/field";
import { CATEGORY_LABELS } from "@/lib/constants";

import type { ProductCategoryFieldsProps } from "./product-category-fields.types";
import styles from "../shared/admin.module.scss";

/**
 * Product category, image, and visibility fields
 * @param props - Field properties
 * @returns Product category and visibility fields group
 */
export function ProductCategoryFields({
  errors,
  getDefaultValue,
  isActive,
  isFeatured,
}: ProductCategoryFieldsProps) {
  return (
    <>
      <div className={styles.formRow}>
        <Field label="Categoría" errors={errors?.category}>
          {(p) => (
            <Select
              {...p}
              name="category"
              defaultValue={getDefaultValue("category") ?? "SUPPLEMENTS"}
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Imagen" errors={errors?.imageUrl} hint="Ruta en /public o URL https">
          {(p) => (
            <Input
              {...p}
              name="imageUrl"
              defaultValue={getDefaultValue("imageUrl")}
              placeholder="/images/products/mi-producto.webp"
              required
            />
          )}
        </Field>
      </div>

      <div className={styles.checks}>
        <Checkbox name="isActive" label="Visible en la tienda" defaultChecked={isActive} />
        <Checkbox name="isFeatured" label="Destacado en el inicio" defaultChecked={isFeatured} />
      </div>
    </>
  );
}
