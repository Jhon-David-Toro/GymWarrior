import { describe, expect, it } from "vitest";

import { calorieInputSchema, checkoutSchema, productFormSchema, signUpSchema } from "./validations";

describe("signUpSchema", () => {
  const valid = {
    name: "Jhon Toro",
    email: "  Jhon@Correo.COM ",
    password: "Clave1234",
    confirmPassword: "Clave1234",
  };

  it("normaliza el correo", () => {
    expect(signUpSchema.parse(valid).email).toBe("jhon@correo.com");
  });

  it("exige letras y números en la contraseña", () => {
    const r = signUpSchema.safeParse({
      ...valid,
      password: "solamente",
      confirmPassword: "solamente",
    });
    expect(r.success).toBe(false);
  });

  it("detecta contraseñas que no coinciden", () => {
    const r = signUpSchema.safeParse({ ...valid, confirmPassword: "Otra1234" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});

describe("checkoutSchema", () => {
  it("no acepta carritos vacíos ni cantidades fuera de rango", () => {
    expect(checkoutSchema.safeParse({ items: [] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ items: [{ productId: "a", quantity: 0 }] }).success).toBe(
      false,
    );
    expect(checkoutSchema.safeParse({ items: [{ productId: "a", quantity: 11 }] }).success).toBe(
      false,
    );
    expect(checkoutSchema.safeParse({ items: [{ productId: "a", quantity: 2 }] }).success).toBe(
      true,
    );
  });

  it("ignora cualquier precio enviado por el cliente", () => {
    const parsed = checkoutSchema.parse({ items: [{ productId: "a", quantity: 1, price: 1 }] });
    expect(parsed.items[0]).toEqual({ productId: "a", quantity: 1 });
  });
});

describe("calorieInputSchema", () => {
  it("convierte los valores del formulario a número", () => {
    const parsed = calorieInputSchema.parse({
      sex: "female",
      age: "28",
      weightKg: "60.5",
      heightCm: "165",
      activity: "light",
      goal: "lose",
    });
    expect(parsed.age).toBe(28);
    expect(parsed.weightKg).toBe(60.5);
  });
});

describe("productFormSchema", () => {
  const valid = {
    name: "Creatina",
    slug: "creatina",
    description: "Creatina monohidratada",
    price: "100000",
    compareAtPrice: "",
    category: "SUPPLEMENTS",
    imageUrl: "/images/products/creatina.webp",
    stock: "5",
    isActive: "on",
  };

  it("interpreta checkboxes y campos opcionales vacíos", () => {
    const parsed = productFormSchema.parse(valid);
    expect(parsed.compareAtPrice).toBeNull();
    expect(parsed.isActive).toBe(true);
    expect(parsed.isFeatured).toBe(false);
  });

  it("el precio anterior debe ser mayor que el actual", () => {
    expect(productFormSchema.safeParse({ ...valid, compareAtPrice: "90000" }).success).toBe(false);
  });

  it("rechaza slugs inválidos e imágenes http", () => {
    expect(productFormSchema.safeParse({ ...valid, slug: "Con Espacios" }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...valid, imageUrl: "http://x.com/a.png" }).success).toBe(
      false,
    );
  });
});
