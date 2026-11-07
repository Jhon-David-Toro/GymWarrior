import { describe, expect, it } from "vitest";

import { calculateBmi, classifyBmi } from "./bmi";

describe("calculateBmi", () => {
  it("calcula el IMC con la altura en centímetros", () => {
    const result = calculateBmi({ weightKg: 70, heightCm: 175 });
    expect(result.bmi).toBe(22.9);
    expect(result.category).toBe("normal");
  });

  it("devuelve el rango de peso saludable para la altura", () => {
    const { healthyWeightKg } = calculateBmi({ weightKg: 70, heightCm: 175 });
    expect(healthyWeightKg).toEqual({ min: 56.7, max: 76.3 });
  });

  it("rechaza valores no positivos", () => {
    expect(() => calculateBmi({ weightKg: 0, heightCm: 170 })).toThrow(RangeError);
    expect(() => calculateBmi({ weightKg: 70, heightCm: -1 })).toThrow(RangeError);
  });
});

describe("classifyBmi", () => {
  it.each([
    [18.49, "underweight"],
    [18.5, "normal"],
    // El código PHP original dejaba sin clasificar valores como 24,95.
    [24.95, "normal"],
    [25, "overweight"],
    [29.99, "overweight"],
    [30, "obesity1"],
    [35, "obesity2"],
    [40, "obesity3"],
  ] as const)("IMC %s → %s", (bmi, expected) => {
    expect(classifyBmi(bmi)).toBe(expected);
  });
});
