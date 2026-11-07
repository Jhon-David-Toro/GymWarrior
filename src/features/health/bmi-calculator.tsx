"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { type BmiResult, BMI_CATEGORIES, calculateBmi } from "@/lib/health/bmi";
import { formatNumber } from "@/lib/format";
import { bmiInputSchema } from "@/lib/validations";
import { saveBmiAction } from "@/server/actions/health";

import { BmiGauge } from "./bmi-gauge";
import styles from "./health.module.scss";
import { useFieldErrors } from "./use-field-errors";

const TONE_CLASS = {
  info: "toneInfo",
  ok: "toneOk",
  warn: "toneWarn",
  danger: "toneDanger",
} as const;

export function BmiCalculator() {
  const [result, setResult] = useState<BmiResult | null>(null);
  const [input, setInput] = useState<{ weightKg: number; heightCm: number } | null>(null);
  const { errors, setFromZod, clear } = useFieldErrors();
  const [isSaving, startSaving] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = bmiInputSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setFromZod(parsed.error);
      setResult(null);
      return;
    }
    clear();
    setInput(parsed.data);
    setResult(calculateBmi(parsed.data));
  };

  const save = () =>
    startSaving(async () => {
      if (!input) return;
      const res = await saveBmiAction(input);
      if (res.status === "success") toast.success(res.message ?? "Guardado");
      else if (res.status === "error") toast.error(res.message);
    });

  const category = result ? BMI_CATEGORIES[result.category] : null;

  return (
    <div className={styles.tool}>
      <form onSubmit={onSubmit} className={styles.form} noValidate>
        <Field label="Peso (kg)" errors={errors.weightKg}>
          {(p) => (
            <Input
              {...p}
              name="weightKg"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={25}
              max={300}
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
              min={100}
              max={250}
              placeholder="175"
              required
            />
          )}
        </Field>
        <Button type="submit" size="lg" variant="dark">
          Calcular IMC
        </Button>
      </form>

      <section className={styles.result} aria-live="polite" aria-labelledby="bmi-result-title">
        <h2 id="bmi-result-title" className="srOnly">
          Resultado
        </h2>
        {result && category ? (
          <>
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
            <Button variant="outline" onClick={save} disabled={isSaving}>
              {isSaving ? "Guardando…" : "Guardar en mi historial"}
            </Button>
          </>
        ) : (
          <p className={styles.placeholder}>
            Escribe tu peso y tu altura para ver tu IMC y tu rango de peso saludable.
          </p>
        )}
      </section>
    </div>
  );
}
