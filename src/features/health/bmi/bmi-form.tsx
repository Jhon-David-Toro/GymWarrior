import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

import { MAX_HEIGHT, MAX_WEIGHT, MIN_HEIGHT, MIN_WEIGHT } from "./bmi-form.constants";
import type { BmiFormProps } from "./bmi-form.types";
import styles from "../shared/health.module.scss";

/**
 * Form for collecting BMI calculation inputs
 * @param props - Form properties
 * @returns BMI input form
 */
export function BmiForm({ onSubmit, errors }: BmiFormProps) {
  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <Field label="Peso (kg)" errors={errors.weightKg}>
        {(p) => (
          <Input
            {...p}
            name="weightKg"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={MIN_WEIGHT}
            max={MAX_WEIGHT}
            placeholder="72"
            required
          />
        )}
      </Field>
      <Field label="Altura (cm)" errors={errors.heightCm}>
        {(p) => (
          <Input
            {...p}
            name="heightCm"
            type="number"
            inputMode="decimal"
            step="0.5"
            min={MIN_HEIGHT}
            max={MAX_HEIGHT}
            placeholder="175"
            required
          />
        )}
      </Field>
      <Button type="submit" size="lg" variant="dark">
        Calcular IMC
      </Button>
    </form>
  );
}
