import { type ClassValue, clsx } from "clsx";
import type { Route } from "next";

/** Combina nombres de clase condicionales: `cn(styles.btn, isActive && styles.active)`. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Convierte un texto en slug URL-safe: "Proteína Smart 3 LB" → "proteina-smart-3-lb". */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Devuelve una ruta interna segura para redirigir (evita open redirects). */
export function safeRedirectPath(value: unknown, fallback = "/cuenta"): Route {
  if (typeof value !== "string") return fallback as Route;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback as Route;
  }
  return value as Route;
}
