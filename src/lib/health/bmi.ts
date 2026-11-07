/**
 * Índice de Masa Corporal (IMC) según la clasificación de la OMS.
 * IMC = peso (kg) / altura (m)²
 */

export type BmiCategory =
  "underweight" | "normal" | "overweight" | "obesity1" | "obesity2" | "obesity3";

export type BmiResult = {
  bmi: number;
  category: BmiCategory;
  /** Rango de peso saludable para esa altura (IMC 18,5 – 24,9). */
  healthyWeightKg: { min: number; max: number };
};

export const BMI_CATEGORIES: Record<
  BmiCategory,
  { label: string; range: string; advice: string; tone: "info" | "ok" | "warn" | "danger" }
> = {
  underweight: {
    label: "Bajo peso",
    range: "Menos de 18,5",
    advice:
      "Prioriza un superávit calórico moderado con proteína suficiente y entrenamiento de fuerza para ganar masa muscular.",
    tone: "info",
  },
  normal: {
    label: "Peso saludable",
    range: "18,5 – 24,9",
    advice:
      "Estás en el rango recomendado. Mantén la constancia en tu entrenamiento y una alimentación equilibrada.",
    tone: "ok",
  },
  overweight: {
    label: "Sobrepeso",
    range: "25 – 29,9",
    advice:
      "Un déficit calórico leve, más actividad diaria y entrenamiento de fuerza te ayudarán a mejorar tu composición corporal.",
    tone: "warn",
  },
  obesity1: {
    label: "Obesidad grado I",
    range: "30 – 34,9",
    advice:
      "Te recomendamos acompañamiento profesional: un plan de nutrición y entrenamiento progresivo marcan la diferencia.",
    tone: "danger",
  },
  obesity2: {
    label: "Obesidad grado II",
    range: "35 – 39,9",
    advice:
      "Consulta con un profesional de la salud antes de empezar un programa de entrenamiento intenso.",
    tone: "danger",
  },
  obesity3: {
    label: "Obesidad grado III",
    range: "40 o más",
    advice: "Es importante que un médico evalúe tu caso para diseñar un plan seguro y efectivo.",
    tone: "danger",
  },
};

export function classifyBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  if (bmi < 35) return "obesity1";
  if (bmi < 40) return "obesity2";
  return "obesity3";
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function calculateBmi({
  weightKg,
  heightCm,
}: {
  weightKg: number;
  heightCm: number;
}): BmiResult {
  if (!(weightKg > 0) || !(heightCm > 0)) {
    throw new RangeError("El peso y la altura deben ser mayores que cero");
  }
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  return {
    bmi: round1(bmi),
    category: classifyBmi(bmi),
    healthyWeightKg: {
      min: round1(18.5 * heightM * heightM),
      max: round1(24.9 * heightM * heightM),
    },
  };
}
