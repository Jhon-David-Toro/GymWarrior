"use server";

import { refresh } from "next/cache";

import { type ActionState } from "@/lib/action-result";
import { calculateBmi } from "@/lib/health/bmi";
import { calculateCalories } from "@/lib/health/calories";
import { bmiInputSchema, calorieInputSchema } from "@/lib/validations";
import { getCurrentUser } from "@/server/auth/session";
import { db, schema } from "@/server/db";

/**
 * Guarda un resultado en el historial. El cálculo se repite en el servidor a partir
 * de los datos de entrada: nunca se guarda un valor enviado por el cliente.
 */
export async function saveBmiAction(input: unknown): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Inicia sesión para guardar tu historial." };

  const parsed = bmiInputSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "Datos inválidos." };

  const result = calculateBmi(parsed.data);
  await db.insert(schema.healthRecord).values({
    userId: user.id,
    kind: "BMI",
    value: result.bmi,
    input: { ...parsed.data, category: result.category },
  });

  refresh();
  return { status: "success", message: "Guardado en tu historial." };
}

export async function saveCaloriesAction(input: unknown): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Inicia sesión para guardar tu historial." };

  const parsed = calorieInputSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "Datos inválidos." };

  const result = calculateCalories(parsed.data);
  await db.insert(schema.healthRecord).values({
    userId: user.id,
    kind: "CALORIES",
    value: result.target,
    input: { ...parsed.data },
  });

  refresh();
  return { status: "success", message: "Guardado en tu historial." };
}
