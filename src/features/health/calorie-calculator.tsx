"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/misc";
import {
  ACTIVITY_LEVELS,
  type CalorieInput,
  type CalorieResult,
  calculateCalories,
  GOALS,
  SEX_LABELS,
} from "@/lib/health/calories";
import { formatNumber } from "@/lib/format";
import { calorieInputSchema } from "@/lib/validations";
import { saveCaloriesAction } from "@/server/actions/health";

import styles from "./health.module.scss";
import { useFieldErrors } from "./use-field-errors";

export function CalorieCalculator() {
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [input, setInput] = useState<CalorieInput | null>(null);
  const { errors, setFromZod, clear } = useFieldErrors();
  const [isSaving, startSaving] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = calorieInputSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setFromZod(parsed.error);
      setResult(null);
      return;
    }
    clear();
    setInput(parsed.data);
    setResult(calculateCalories(parsed.data));
  };

  const save = () =>
    startSaving(async () => {
      if (!input) return;
      const res = await saveCaloriesAction(input);
      if (res.status === "success") toast.success(res.message ?? "Guardado");
      else if (res.status === "error") toast.error(res.message);
    });

  const macros = result
    ? [
        { key: "protein", label: "Proteína", grams: result.macros.proteinG, kcal: 4 },
        { key: "carbs", label: "Carbohidratos", grams: result.macros.carbsG, kcal: 4 },
        { key: "fat", label: "Grasas", grams: result.macros.fatG, kcal: 9 },
      ]
    : [];

  return (
    <div className={styles.tool}>
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
              <Input
                {...p}
                name="age"
                type="number"
                inputMode="numeric"
                placeholder="28"
                required
              />
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

      <section className={styles.result} aria-live="polite" aria-labelledby="kcal-result-title">
        <h2 id="kcal-result-title" className="srOnly">
          Resultado
        </h2>
        {result && input ? (
          <>
            <p className={styles.bigNumber}>
              <span className="tabular">{formatNumber(result.target)}</span>
              <span className={styles.unit}>kcal / día</span>
            </p>
            <p>
              Para <strong>{GOALS[input.goal].label.toLowerCase()}</strong>. Tu gasto diario
              estimado es de <strong className="tabular">{formatNumber(result.tdee)} kcal</strong> y
              tu metabolismo basal de{" "}
              <strong className="tabular">{formatNumber(result.bmr)} kcal</strong>.
            </p>
            {result.clampedToMinimum ? (
              <FormMessage tone="error">
                Ajustamos el objetivo al mínimo recomendado. Para déficits mayores, consulta con un
                profesional de la salud.
              </FormMessage>
            ) : null}
            <ul role="list" className={styles.macros}>
              {macros.map((m) => (
                <li key={m.key} data-macro={m.key}>
                  <span className={styles.macroLabel}>{m.label}</span>
                  <span className={`${styles.macroValue} tabular`}>{m.grams} g</span>
                  <span className={styles.macroBar}>
                    <span
                      style={{
                        width: `${Math.round(((m.grams * m.kcal) / result.target) * 100)}%`,
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="outline" onClick={save} disabled={isSaving}>
              {isSaving ? "Guardando…" : "Guardar en mi historial"}
            </Button>
          </>
        ) : (
          <p className={styles.placeholder}>
            Completa tus datos para ver cuántas calorías necesitas y cómo repartirlas entre
            proteína, carbohidratos y grasas.
          </p>
        )}
      </section>
    </div>
  );
}
