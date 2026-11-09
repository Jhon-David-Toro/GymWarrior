import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ACTIVITY_LEVELS, GOALS, SEX_LABELS } from "@/lib/health/calories";

import type { CalorieFormProps } from "./calorie-form.types";
import styles from "../shared/health.module.scss";

/**
 * Form for collecting calorie calculation inputs
 * @param props - Form properties
 * @returns Calorie calculation form
 */
export function CalorieForm({ onSubmit, errors }: CalorieFormProps) {
  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <fieldset className={styles.radios}>
        <legend>Sexo</legend>
        {Object.entries(SEX_LABELS).map(([value, label]) => (
          <label key={value}>
            <input type="radio" name="sex" value={value} defaultChecked={value === "male"} />
            {label}
          </label>
        ))}
      </fieldset>

      <div className={styles.row3}>
        <Field label="Edad" errors={errors.age}>
          {(p) => (
            <Input {...p} name="age" type="number" inputMode="numeric" placeholder="28" required />
          )}
        </Field>
        <Field label="Peso (kg)" errors={errors.weightKg}>
          {(p) => (
            <Input
              {...p}
              name="weightKg"
              type="number"
              inputMode="decimal"
              step="0.1"
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
              placeholder="175"
              required
            />
          )}
        </Field>
      </div>

      <Field label="Actividad física" errors={errors.activity}>
        {(p) => (
          <Select {...p} name="activity" defaultValue="moderate">
            {Object.entries(ACTIVITY_LEVELS).map(([value, a]) => (
              <option key={value} value={value}>
                {a.label} — {a.description}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Objetivo" errors={errors.goal}>
        {(p) => (
          <Select {...p} name="goal" defaultValue="maintain">
            {Object.entries(GOALS).map(([value, g]) => (
              <option key={value} value={value}>
                {g.label}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Button type="submit" size="lg" variant="dark">
        Calcular calorías
      </Button>
    </form>
  );
}
