"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { CalorieInput, CalorieResult } from "@/lib/health/calories";
import { calculateCalories } from "@/lib/health/calories";
import { calorieInputSchema } from "@/lib/validations";
import { saveCaloriesAction } from "@/server/actions/health";

import { CalorieForm } from "./calorie-form";
import { CalorieResults } from "./calorie-results";
import styles from "../shared/health.module.scss";
import { useFieldErrors } from "../shared/use-field-errors";

/**
 * Main calorie calculator component that handles form submission and result display
 * @returns Complete calorie calculator interface
 */
export function CalorieCalculator() {
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [input, setInput] = useState<CalorieInput | null>(null);
  const { errors, setFromZod, clear } = useFieldErrors();
  const [isSaving, startSaving] = useTransition();

  /**
   * Handles form submission and calorie calculation
   * @param e - Form submit event
   */
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

  /**
   * Saves the calculation result to user history
   */
  const save = () =>
    startSaving(async () => {
      if (!input) return;
      const res = await saveCaloriesAction(input);

      if (res.status === "success") {
        toast.success(res.message ?? "Guardado");
      } else if (res.status === "error") {
        toast.error(res.message);
      }
    });

  return (
    <div className={styles.tool}>
      <CalorieForm onSubmit={onSubmit} errors={errors} />
      <CalorieResults result={result} input={input} isSaving={isSaving} onSave={save} />
    </div>
  );
}
