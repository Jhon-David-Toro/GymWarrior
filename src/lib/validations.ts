import { z } from "zod";

/**
 * Esquemas compartidos entre cliente y servidor.
 * El servidor SIEMPRE vuelve a validar: la validación del cliente es solo UX.
 */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Escribe un correo válido, por ejemplo nombre@correo.com"));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Escribe tu contraseña"),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Tu nombre debe tener al menos 3 caracteres")
      .max(80, "Tu nombre no puede superar 80 caracteres"),
    email,
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede superar 128 caracteres")
      .regex(/[a-zA-Z]/, "Incluye al menos una letra")
      .regex(/\d/, "Incluye al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  email,
  message: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
    .max(1000, "El mensaje no puede superar 1000 caracteres"),
  /** Honeypot anti-spam: los humanos no lo ven ni lo llenan. */
  website: z.string().max(0).optional(),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.int().min(1).max(10),
      }),
    )
    .min(1, "Tu carrito está vacío")
    .max(30),
});

export const bmiInputSchema = z.object({
  weightKg: z.coerce
    .number({ error: "Escribe tu peso" })
    .min(25, "El peso debe estar entre 25 y 300 kg")
    .max(300, "El peso debe estar entre 25 y 300 kg"),
  heightCm: z.coerce
    .number({ error: "Escribe tu altura" })
    .min(100, "La altura debe estar entre 100 y 250 cm")
    .max(250, "La altura debe estar entre 100 y 250 cm"),
});

export const calorieInputSchema = bmiInputSchema.extend({
  sex: z.enum(["male", "female"], { error: "Elige una opción" }),
  age: z.coerce
    .number({ error: "Escribe tu edad" })
    .int("La edad debe ser un número entero")
    .min(15, "La calculadora es para personas entre 15 y 90 años")
    .max(90, "La calculadora es para personas entre 15 y 90 años"),
  activity: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lose", "maintain", "gain"]),
});

export const productFormSchema = z
  .object({
    name: z.string().trim().min(3, "Mínimo 3 caracteres").max(120),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo minúsculas, números y guiones")
      .max(140),
    description: z.string().trim().min(10, "Mínimo 10 caracteres").max(2000),
    price: z.coerce.number().int("Sin decimales").min(1000, "El precio mínimo es $1.000"),
    compareAtPrice: z.preprocess(
      (v) => (v === "" || v == null ? null : v),
      z.coerce.number().int().positive().nullable(),
    ),
    category: z.enum(["SUPPLEMENTS", "APPAREL", "ACCESSORIES"]),
    imageUrl: z
      .string()
      .trim()
      .refine(
        (v) => v.startsWith("/") || /^https:\/\//.test(v),
        "Usa una ruta /images/... o una URL https",
      ),
    stock: z.coerce.number().int().min(0, "El stock no puede ser negativo").max(100_000),
    isFeatured: z.preprocess((v) => v === "on" || v === true, z.boolean()),
    isActive: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  })
  .refine((d) => d.compareAtPrice == null || d.compareAtPrice > d.price, {
    message: "El precio anterior debe ser mayor que el precio actual",
    path: ["compareAtPrice"],
  });

export const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDING", "PAID", "SHIPPED", "CANCELLED"]),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductFormInput = z.infer<typeof productFormSchema>;
