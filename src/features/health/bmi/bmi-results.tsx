import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { BMI_CATEGORIES } from "@/lib/health/bmi";

import { BmiGauge } from "./bmi-gauge";
import { TONE_CLASS } from "./bmi-results.constants";
import type { BmiResultsProps } from "./bmi-results.types";
import styles from "../shared/health.module.scss";

/**
 * Displays BMI calculation results with gauge and recommendations
 * @param props - Results display properties
 * @returns BMI calculation results
 */
export function BmiResults({ result, isSaving, onSave }: BmiResultsProps) {
  if (!result) {
    return (
      <section className={styles.result} aria-live="polite" aria-labelledby="bmi-result-title">
        <h2 id="bmi-result-title" className="srOnly">
          Resultado
        </h2>
        <p className={styles.placeholder}>
          Escribe tu peso y tu altura para ver tu IMC y tu rango de peso saludable.
        </p>
      </section>
    );
  }

  const category = BMI_CATEGORIES[result.category];

  return (
    <section className={styles.result} aria-live="polite" aria-labelledby="bmi-result-title">
      <h2 id="bmi-result-title" className="srOnly">
        Resultado
      </h2>

      <p className={styles.bigNumber}>
        <span className="tabular">{formatNumber(result.bmi)}</span>
        <span className={styles.unit}>IMC</span>
      </p>

      <p className={styles[TONE_CLASS[category.tone]]}>
        <strong>{category.label}</strong> · rango {category.range}
      </p>

      <BmiGauge bmi={result.bmi} />

      <p>{category.advice}</p>

      <p className={styles.muted}>
        Para tu altura, el peso saludable va de{" "}
        <strong className="tabular">{formatNumber(result.healthyWeightKg.min)} kg</strong> a{" "}
        <strong className="tabular">{formatNumber(result.healthyWeightKg.max)} kg</strong>.
      </p>

      <Button variant="outline" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Guardando…" : "Guardar en mi historial"}
      </Button>
    </section>
  );
}
