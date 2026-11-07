import type { OrderStatus, ProductCategory } from "@/server/db/schema";

export const SITE = {
  name: "GymWarrior",
  description:
    "Gimnasio en Caldas, Antioquia. Planes flexibles, entrenadores certificados, tienda de suplementos y calculadoras de IMC y calorías.",
  address: "Caldas, Antioquia — Colombia",
  phone: "+57 300 000 0000",
  email: "hola@gymwarrior.co",
  hours: [
    { days: "Lunes a viernes", time: "5:00 a. m. – 10:00 p. m." },
    { days: "Sábados", time: "7:00 a. m. – 6:00 p. m." },
    { days: "Domingos y festivos", time: "8:00 a. m. – 2:00 p. m." },
  ],
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    tiktok: "https://tiktok.com",
  },
} as const;

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  SUPPLEMENTS: "Suplementos",
  APPAREL: "Ropa",
  ACCESSORIES: "Accesorios",
};

/** Slugs en español para la URL (`/tienda?categoria=ropa`). */
export const CATEGORY_SLUGS: Record<ProductCategory, string> = {
  SUPPLEMENTS: "suplementos",
  APPAREL: "ropa",
  ACCESSORIES: "accesorios",
};

export function categoryFromSlug(slug: string | undefined): ProductCategory | null {
  const entry = Object.entries(CATEGORY_SLUGS).find(([, s]) => s === slug);
  return entry ? (entry[0] as ProductCategory) : null;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  CANCELLED: "Cancelado",
};

export const MAX_QTY_PER_ITEM = 10;

export const NAV_LINKS = [
  { href: "/planes", label: "Planes" },
  { href: "/tienda", label: "Tienda" },
  { href: "/herramientas/imc", label: "IMC" },
  { href: "/herramientas/calorias", label: "Calorías" },
] as const;
