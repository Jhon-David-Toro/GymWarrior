"use server";

import { refresh } from "next/cache";

import { type ActionState } from "@/lib/action-result";
import { calculateBmi } from "@/lib/health/bmi";
import { calculateCalories } from "@/lib/health/calories";
import { bmiInputSchema, calorieInputSchema } from "@/lib/validations";
import { getCurrentUser } from "@/server/auth/session";
import { db, schema } from "@/server/db";

const ERROR_MESSAGES = {
  UNAUTHORIZED: "Inicia sesión para guardar tu historial.",
  INVALID_DATA: "Datos inválidos.",
} as const;

const SUCCESS_MESSAGE = "Guardado en tu historial.";

/**
 * Saves BMI calculation to user history
 * @param input - BMI calculation input data
 * @returns Action state with success or error message
 */
export async function saveBmiAction(input: unknown): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: ERROR_MESSAGES.UNAUTHORIZED };
  }

  const parsed = bmiInputSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: ERROR_MESSAGES.INVALID_DATA };
  }

  const result = calculateBmi(parsed.data);
  await db.insert(schema.healthRecord).values({
    userId: user.id,
    kind: "BMI",
    value: result.bmi,
    input: { ...parsed.data, category: result.category },
  });

  refresh();
  return { status: "success", message: SUCCESS_MESSAGE };
}

/**
 * Saves calorie calculation to user history
 * @param input - Calorie calculation input data
 * @returns Action state with success or error message
 */
export async function saveCaloriesAction(input: unknown): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: ERROR_MESSAGES.UNAUTHORIZED };
  }

  const parsed = calorieInputSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: ERROR_MESSAGES.INVALID_DATA };
  }

  const result = calculateCalories(parsed.data);
  await db.insert(schema.healthRecord).values({
    userId: user.id,
    kind: "CALORIES",
    value: result.target,
    input: { ...parsed.data },
  });

  refresh();
  return { status: "success", message: SUCCESS_MESSAGE };
}
