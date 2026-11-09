"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { type BmiResult, calculateBmi } from "@/lib/health/bmi";
import { bmiInputSchema } from "@/lib/validations";
import { saveBmiAction } from "@/server/actions/health";

import { BmiForm } from "./bmi-form";
import { BmiResults } from "./bmi-results";
import styles from "../shared/health.module.scss";
import { useFieldErrors } from "../shared/use-field-errors";

/**
 * Main BMI calculator component that handles form submission and result display
 * @returns Complete BMI calculator interface
 */
export function BmiCalculator() {
  const [result, setResult] = useState<BmiResult | null>(null);
  const [input, setInput] = useState<{ weightKg: number; heightCm: number } | null>(null);
  const { errors, setFromZod, clear } = useFieldErrors();
  const [isSaving, startSaving] = useTransition();

  /**
   * Handles form submission and BMI calculation
   * @param e - Form submit event
   */
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

  /**
   * Saves the calculation result to user history
   */
  const save = () =>
    startSaving(async () => {
      if (!input) return;
      const res = await saveBmiAction(input);

      if (res.status === "success") {
        toast.success(res.message ?? "Guardado");
      } else if (res.status === "error") {
        toast.error(res.message);
      }
    });

  return (
    <div className={styles.tool}>
      <BmiForm onSubmit={onSubmit} errors={errors} />
      <BmiResults result={result} isSaving={isSaving} onSave={save} />
    </div>
  );
}
