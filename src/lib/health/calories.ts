/**
 * Calculadora de gasto calórico.
 *
 * - Tasa Metabólica Basal (TMB) con la ecuación de Mifflin-St Jeor (1990), la más precisa
 *   para población general según la Academy of Nutrition and Dietetics.
 *     Hombres: 10·peso + 6,25·altura − 5·edad + 5
 *     Mujeres: 10·peso + 6,25·altura − 5·edad − 161
 * - Gasto energético total (TDEE) = TMB × factor de actividad.
 * - Ajuste por objetivo y reparto de macronutrientes.
 */

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";

export const ACTIVITY_LEVELS: Record<
  ActivityLevel,
  { label: string; description: string; factor: number }
> = {
  sedentary: { label: "Sedentario", description: "Poco o nada de ejercicio", factor: 1.2 },
  light: { label: "Ligero", description: "Ejercicio 1–3 días por semana", factor: 1.375 },
  moderate: { label: "Moderado", description: "Ejercicio 3–5 días por semana", factor: 1.55 },
  active: { label: "Activo", description: "Ejercicio intenso 6–7 días por semana", factor: 1.725 },
  very_active: {
    label: "Muy activo",
    description: "Entrenamiento doble o trabajo físico exigente",
    factor: 1.9,
  },
};

export const GOALS: Record<Goal, { label: string; adjustment: number; proteinPerKg: number }> = {
  lose: { label: "Perder grasa", adjustment: -0.15, proteinPerKg: 2.0 },
  maintain: { label: "Mantener peso", adjustment: 0, proteinPerKg: 1.6 },
  gain: { label: "Ganar músculo", adjustment: 0.1, proteinPerKg: 1.8 },
};

export const SEX_LABELS: Record<Sex, string> = { male: "Hombre", female: "Mujer" };

/** Mínimos de seguridad: por debajo de estas cifras no se recomienda sin supervisión médica. */
const MIN_CALORIES: Record<Sex, number> = { male: 1500, female: 1200 };
const FAT_SHARE = 0.25;
const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

export type CalorieInput = {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
  goal: Goal;
};

export type CalorieResult = {
  bmr: number;
  tdee: number;
  target: number;
  /** `true` si el objetivo se ajustó al mínimo de seguridad. */
  clampedToMinimum: boolean;
  macros: { proteinG: number; carbsG: number; fatG: number };
};

export function calculateBmr({
  sex,
  age,
  weightKg,
  heightCm,
}: Pick<CalorieInput, "sex" | "age" | "weightKg" | "heightCm">) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateCalories(input: CalorieInput): CalorieResult {
  const bmr = calculateBmr(input);
  const tdee = bmr * ACTIVITY_LEVELS[input.activity].factor;
  const goal = GOALS[input.goal];

  const rawTarget = tdee * (1 + goal.adjustment);
  const minimum = MIN_CALORIES[input.sex];
  const clampedToMinimum = rawTarget < minimum;
  const target = Math.round(Math.max(rawTarget, minimum));

  const proteinG = Math.round(goal.proteinPerKg * input.weightKg);
  const fatG = Math.round((target * FAT_SHARE) / KCAL_PER_GRAM.fat);
  const remaining = target - proteinG * KCAL_PER_GRAM.protein - fatG * KCAL_PER_GRAM.fat;
  const carbsG = Math.max(0, Math.round(remaining / KCAL_PER_GRAM.carbs));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target,
    clampedToMinimum,
    macros: { proteinG, carbsG, fatG },
  };
}
