const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Bogota",
});

const numberFormatter = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

/** 119000 → "$ 119.000" */
export function formatCOP(value: number) {
  return copFormatter.format(value);
}

/** Fecha corta en hora de Colombia: "7 nov 2026". */
export function formatDate(value: Date | string) {
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

/** 2345.67 → "2.345,7" */
export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

/** Porcentaje de descuento entero entre el precio anterior y el actual. */
export function discountPercent(price: number, compareAtPrice: number | null | undefined) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
