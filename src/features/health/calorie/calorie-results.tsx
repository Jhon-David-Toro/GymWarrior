import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/misc";
import { formatNumber } from "@/lib/format";
import { GOALS } from "@/lib/health/calories";

import { MACRO_CALORIES } from "./calorie-results.constants";
import type { CalorieResultsProps, MacroData } from "./calorie-results.types";
import styles from "../shared/health.module.scss";

/**
 * Displays calorie calculation results with macronutrient breakdown
 * @param props - Results display properties
 * @returns Calorie calculation results
 */
export function CalorieResults({ result, input, isSaving, onSave }: CalorieResultsProps) {
  if (!result || !input) {
    return (
      <section className={styles.result} aria-live="polite" aria-labelledby="kcal-result-title">
        <h2 id="kcal-result-title" className="srOnly">
          Resultado
        </h2>
        <p className={styles.placeholder}>
          Completa tus datos para ver cuántas calorías necesitas y cómo repartirlas entre proteína,
          carbohidratos y grasas.
        </p>
      </section>
    );
  }

  const macros: MacroData[] = [
    {
      key: "protein",
      label: "Proteína",
      grams: result.macros.proteinG,
      kcal: MACRO_CALORIES.PROTEIN,
    },
    {
      key: "carbs",
      label: "Carbohidratos",
      grams: result.macros.carbsG,
      kcal: MACRO_CALORIES.CARBS,
    },
    { key: "fat", label: "Grasas", grams: result.macros.fatG, kcal: MACRO_CALORIES.FAT },
  ];

  return (
    <section className={styles.result} aria-live="polite" aria-labelledby="kcal-result-title">
      <h2 id="kcal-result-title" className="srOnly">
        Resultado
      </h2>

      <p className={styles.bigNumber}>
        <span className="tabular">{formatNumber(result.target)}</span>
        <span className={styles.unit}>kcal / día</span>
      </p>

      <p>
        Para <strong>{GOALS[input.goal].label.toLowerCase()}</strong>. Tu gasto diario estimado es
        de <strong className="tabular">{formatNumber(result.tdee)} kcal</strong> y tu metabolismo
        basal de <strong className="tabular">{formatNumber(result.bmr)} kcal</strong>.
      </p>

      {result.clampedToMinimum && (
        <FormMessage tone="error">
          Ajustamos el objetivo al mínimo recomendado. Para déficits mayores, consulta con un
          profesional de la salud.
        </FormMessage>
      )}

      <ul role="list" className={styles.macros}>
        {macros.map((macro) => (
          <li key={macro.key} data-macro={macro.key}>
            <span className={styles.macroLabel}>{macro.label}</span>
            <span className={`${styles.macroValue} tabular`}>{macro.grams} g</span>
            <span className={styles.macroBar}>
              <span
                style={{
                  width: `${Math.round(((macro.grams * macro.kcal) / result.target) * 100)}%`,
                }}
              />
            </span>
          </li>
        ))}
      </ul>

      <Button variant="outline" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Guardando…" : "Guardar en mi historial"}
      </Button>
    </section>
  );
}
