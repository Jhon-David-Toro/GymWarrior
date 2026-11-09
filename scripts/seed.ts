/**
 * Siembra la base de datos con datos de demostración.
 * Es idempotente: puede ejecutarse varias veces sin duplicar registros.
 *
 *   pnpm db:seed
 */
import "dotenv/config";

import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../src/server/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const products: schema.NewProduct[] = [
  {
    slug: "adidas-defender-4",
    name: "Bolso Adidas Defender 4",
    description:
      "Bolso duffel pequeño, unisex, con compartimento principal amplio y bolsillo lateral para zapatos. Ideal para llevar todo al gimnasio.",
    price: 159000,
    compareAtPrice: 189000,
    category: "ACCESSORIES",
    imageUrl: "/images/products/adidas-defender-4.webp",
    stock: 12,
    isFeatured: true,
  },
  {
    slug: "tfp-fusion-5lb",
    name: "TFP Fusion 5 lb",
    description:
      "Ganador de masa con carbohidratos de rápida asimilación, 35 g de proteína de suero y 5.000 mg de glutamina por servicio.",
    price: 119000,
    category: "SUPPLEMENTS",
    imageUrl: "/images/products/tfp-fusion-5lb.webp",
    stock: 25,
  },
  {
    slug: "proteina-smart-3lb",
    name: "Proteína Smart 3,25 lb",
    description:
      "Proteína en polvo a base de harina de avena con palatinosa, amilopectina y proteína de suero, enriquecida con vitaminas.",
    price: 79900,
    category: "SUPPLEMENTS",
    imageUrl: "/images/products/proteina-smart-3lb.webp",
    stock: 30,
  },
  {
    slug: "viga-fitmafia-2lb",
    name: "Viga FitMafia 2 lb",
    description:
      "Proteína con ingredientes seleccionados para acompañar tu entrenamiento y tu recuperación muscular.",
    price: 55000,
    category: "SUPPLEMENTS",
    imageUrl: "/images/products/viga-fitmafia-2lb.webp",
    stock: 18,
  },
  {
    slug: "whey-protein-hidrolizada",
    name: "Whey Protein hidrolizada 2 lb",
    description:
      "Proteína hidrolizada de suero de leche con enzimas digestivas. 908 g, sabor chocolate.",
    price: 200000,
    compareAtPrice: 230000,
    category: "SUPPLEMENTS",
    imageUrl: "/images/products/whey-protein-hidrolizada.webp",
    stock: 10,
  },
  {
    slug: "megaplex-creatine-power",
    name: "Megaplex Creatine Power 2 lb",
    description:
      "Creatina con fórmula avanzada para mejorar la fuerza y el rendimiento en series cortas e intensas.",
    price: 55000,
    category: "SUPPLEMENTS",
    imageUrl: "/images/products/megaplex-creatine-power.webp",
    stock: 22,
  },
  {
    slug: "creatina-optimum-600g",
    name: "Creatina Optimum Nutrition 600 g",
    description:
      "Creatina monohidratada micronizada de alta pureza. Sin sabor, se mezcla fácil con agua o tu batido.",
    price: 195000,
    category: "SUPPLEMENTS",
    imageUrl: "/images/products/creatina-optimum-600g.webp",
    stock: 8,
  },
  {
    slug: "camiseta-oversize",
    name: "Camiseta oversize GymWarrior",
    description:
      "100 % algodón, corte oversize y largo. Confección nacional, cómoda para entrenar y para el día a día.",
    price: 45000,
    category: "APPAREL",
    imageUrl: "/images/products/camiseta-oversize.webp",
    stock: 40,
  },
  {
    slug: "camiseta-dry-fit",
    name: "Camiseta de entrenamiento dry-fit",
    description:
      "Tela que aleja el sudor de la piel para que se evapore más rápido y te mantengas seco durante toda la sesión.",
    price: 39000,
    category: "APPAREL",
    imageUrl: "/images/products/camiseta-dry-fit.webp",
    stock: 35,
  },
  {
    slug: "tenis-entrenamiento",
    name: "Tenis Nike Air Max Alpha Trainer 5",
    description:
      "Base ancha y estable para levantamientos pesados, con amortiguación Air en el talón para tus días de cardio.",
    price: 520000,
    category: "APPAREL",
    imageUrl: "/images/products/tenis-entrenamiento.webp",
    stock: 6,
  },
  {
    slug: "short-entrenamiento",
    name: "Short de entrenamiento",
    description:
      "Material resistente y costuras reforzadas que aguantan sentadillas profundas y sesiones largas.",
    price: 35000,
    category: "APPAREL",
    imageUrl: "/images/products/short-entrenamiento.webp",
    stock: 28,
  },
  {
    slug: "rodilleras-compresion",
    name: "Rodilleras de compresión",
    description:
      "Soporte y calor para las rodillas en sentadilla y prensa. Neopreno de 7 mm, se venden por par.",
    price: 60000,
    category: "ACCESSORIES",
    imageUrl: "/images/products/rodilleras-compresion.webp",
    stock: 15,
  },
  {
    slug: "lifting-straps",
    name: "Lifting straps",
    description:
      "Correas de algodón reforzado para que el agarre no te limite en peso muerto, remos y dominadas.",
    price: 36000,
    category: "ACCESSORIES",
    imageUrl: "/images/products/lifting-straps.webp",
    stock: 50,
  },
];

const plans: (typeof schema.plan.$inferInsert)[] = [
  {
    slug: "bronce",
    name: "Bronce",
    description: "Para quien entrena unas veces por semana y quiere flexibilidad.",
    price: 45000,
    durationDays: 30,
    visits: 15,
    features: ["15 entradas en 30 días", "Zona de pesas y cardio", "Evaluación física inicial"],
    sortOrder: 1,
  },
  {
    slug: "vip",
    name: "VIP",
    description: "Entrena casi todos los días y súmate a las clases grupales.",
    price: 70000,
    durationDays: 30,
    visits: 30,
    features: [
      "30 entradas en 30 días",
      "Clases grupales incluidas",
      "Evaluación física mensual",
      "10 % de descuento en la tienda",
    ],
    isHighlighted: true,
    sortOrder: 2,
  },
  {
    slug: "gold",
    name: "Gold",
    description: "Dos meses sin límite y acompañamiento de un entrenador.",
    price: 100000,
    durationDays: 60,
    visits: null,
    features: [
      "Acceso ilimitado por 60 días",
      "Clases grupales incluidas",
      "4 sesiones con entrenador personal",
      "Plan de alimentación básico",
    ],
    sortOrder: 3,
  },
];

const trainers: (typeof schema.trainer.$inferInsert)[] = [
  {
    name: "Valentina Ríos",
    specialty: "Fuerza y powerlifting",
    bio: "Te enseña a dominar sentadilla, press de banca y peso muerto con técnica segura y progresiones medibles.",
    achievements: ["Licenciada en Educación Física", "Competidora nacional de powerlifting"],
    schedule: "Lun a vie · 5:00 a. m. – 1:00 p. m.",
    sortOrder: 1,
  },
  {
    name: "Andrés Cardona",
    specialty: "Hipertrofia y recomposición",
    bio: "Diseña rutinas por bloques para ganar músculo o perder grasa sin sacrificar fuerza.",
    achievements: ["Entrenador personal certificado", "8 años de experiencia en sala"],
    schedule: "Lun a vie · 2:00 p. m. – 10:00 p. m.",
    sortOrder: 2,
  },
  {
    name: "Camila Restrepo",
    specialty: "Entrenamiento funcional y movilidad",
    bio: "Dirige las clases grupales y ayuda a quienes vuelven a entrenar después de una lesión.",
    achievements: ["Fisioterapeuta", "Instructora de clases grupales"],
    schedule: "Mar, jue y sáb · 6:00 a. m. – 12:00 m.",
    sortOrder: 3,
  },
];

async function upsertAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@gymwarrior.co").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin12345!";

  const existing = await db.query.user.findFirst({ where: eq(schema.user.email, email) });
  if (existing) {
    await db.update(schema.user).set({ role: "ADMIN" }).where(eq(schema.user.id, existing.id));
    return email;
  }

  const userId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(schema.user).values({
      id: userId,
      name: "Administrador",
      email,
      emailVerified: true,
      role: "ADMIN",
    });
    await tx.insert(schema.account).values({
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: await hashPassword(password),
    });
  });
  return email;
}

async function main() {
  for (const p of products) {
    await db
      .insert(schema.product)
      .values(p)
      .onConflictDoUpdate({
        target: schema.product.slug,
        set: {
          name: p.name,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          category: p.category,
          imageUrl: p.imageUrl,
          isFeatured: p.isFeatured ?? false,
        },
      });
  }

  for (const p of plans) {
    await db
      .insert(schema.plan)
      .values(p)
      .onConflictDoUpdate({
        target: schema.plan.slug,
        set: {
          name: p.name,
          description: p.description,
          price: p.price,
          durationDays: p.durationDays,
          visits: p.visits,
          features: p.features,
          isHighlighted: p.isHighlighted ?? false,
          sortOrder: p.sortOrder,
        },
      });
  }

  const trainerCount = await db.$count(schema.trainer);
  if (trainerCount === 0) await db.insert(schema.trainer).values(trainers);

  await upsertAdmin();
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
