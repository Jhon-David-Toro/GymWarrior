import { describe, expect, it } from "vitest";

import { calculateBmr, calculateCalories, type CalorieInput } from "./calories";

const base: CalorieInput = {
  sex: "male",
  age: 30,
  weightKg: 80,
  heightCm: 180,
  activity: "moderate",
  goal: "maintain",
};

describe("calculateBmr (Mifflin-St Jeor)", () => {
  it("hombres: 10·peso + 6,25·altura − 5·edad + 5", () => {
    expect(calculateBmr(base)).toBe(1780);
  });

  it("mujeres: 10·peso + 6,25·altura − 5·edad − 161", () => {
    expect(calculateBmr({ ...base, sex: "female" })).toBe(1614);
  });
});

describe("calculateCalories", () => {
  it("multiplica la TMB por el factor de actividad", () => {
    const r = calculateCalories(base);
    expect(r.bmr).toBe(1780);
    expect(r.tdee).toBe(2759); // 1780 × 1,55
    expect(r.target).toBe(2759);
  });

  it("aplica un déficit del 15 % para perder grasa", () => {
    expect(calculateCalories({ ...base, goal: "lose" }).target).toBe(2345);
  });

  it("aplica un superávit del 10 % para ganar músculo", () => {
    expect(calculateCalories({ ...base, goal: "gain" }).target).toBe(3035);
  });

  it("no baja del mínimo de seguridad", () => {
    const r = calculateCalories({
      sex: "female",
      age: 70,
      weightKg: 40,
      heightCm: 145,
      activity: "sedentary",
      goal: "lose",
    });
    expect(r.target).toBe(1200);
    expect(r.clampedToMinimum).toBe(true);
  });

  it("los macros suman aproximadamente el objetivo calórico", () => {
    const r = calculateCalories(base);
    const kcal = r.macros.proteinG * 4 + r.macros.carbsG * 4 + r.macros.fatG * 9;
    expect(Math.abs(kcal - r.target)).toBeLessThan(10);
  });
});
