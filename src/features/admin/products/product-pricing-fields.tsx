import { Field, Input } from "@/components/ui/field";
import { MIN_PRODUCT_PRICE, MIN_STOCK, PRICE_STEP } from "@/lib/constants";

import type { ProductPricingFieldsProps } from "./product-pricing-fields.types";
import styles from "../shared/admin.module.scss";

/**
 * Product pricing and inventory fields
 * @param props - Field properties
 * @returns Product pricing fields group
 */
export function ProductPricingFields({ errors, getDefaultValue }: ProductPricingFieldsProps) {
  return (
    <div className={styles.formRow3}>
      <Field label="Precio (COP)" errors={errors?.price}>
        {(p) => (
          <Input
            {...p}
            name="price"
            type="number"
            min={MIN_PRODUCT_PRICE}
            step={PRICE_STEP}
            defaultValue={getDefaultValue("price")}
            required
          />
        )}
      </Field>
      <Field label="Precio anterior (opcional)" errors={errors?.compareAtPrice}>
        {(p) => (
          <Input
            {...p}
            name="compareAtPrice"
            type="number"
            min={0}
            step={PRICE_STEP}
            defaultValue={getDefaultValue("compareAtPrice")}
          />
        )}
      </Field>
      <Field label="Stock" errors={errors?.stock}>
        {(p) => (
          <Input
            {...p}
            name="stock"
            type="number"
            min={MIN_STOCK}
            defaultValue={getDefaultValue("stock") ?? "0"}
            required
          />
        )}
      </Field>
    </div>
  );
}
