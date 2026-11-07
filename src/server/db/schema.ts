import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** Columnas de auditoría reutilizables. */
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

// ─── Enums ───────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const productCategoryEnum = pgEnum("product_category", [
  "SUPPLEMENTS",
  "APPAREL",
  "ACCESSORIES",
]);
export const orderStatusEnum = pgEnum("order_status", ["PENDING", "PAID", "SHIPPED", "CANCELLED"]);
export const membershipStatusEnum = pgEnum("membership_status", ["ACTIVE", "EXPIRED", "CANCELLED"]);
export const healthRecordKindEnum = pgEnum("health_record_kind", ["BMI", "CALORIES"]);

// ─── Auth (tablas requeridas por Better Auth) ────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: roleEnum("role").notNull().default("USER"),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// ─── Tienda ──────────────────────────────────────────────────────────────────

export const product = pgTable(
  "product",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    /** Precio en pesos colombianos (COP, sin decimales). */
    price: integer("price").notNull(),
    /** Precio anterior, para mostrar el descuento. */
    compareAtPrice: integer("compare_at_price"),
    category: productCategoryEnum("category").notNull(),
    imageUrl: text("image_url").notNull(),
    stock: integer("stock").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    index("product_category_active_idx").on(t.category, t.isActive),
    check("product_price_positive", sql`${t.price} > 0`),
    check("product_stock_non_negative", sql`${t.stock} >= 0`),
  ],
);

export const order = pgTable(
  "order",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull().default("PAID"),
    /** Total en COP, calculado siempre en el servidor. */
    total: integer("total").notNull(),
    ...timestamps,
  },
  (t) => [index("order_user_created_idx").on(t.userId, t.createdAt)],
);

export const orderItem = pgTable(
  "order_item",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "restrict" }),
    /** Copia del nombre al momento de la compra. */
    productName: text("product_name").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [
    index("order_item_order_idx").on(t.orderId),
    check("order_item_quantity_positive", sql`${t.quantity} > 0`),
  ],
);

// ─── Gimnasio ────────────────────────────────────────────────────────────────

export const plan = pgTable("plan", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  durationDays: integer("duration_days").notNull(),
  /** Entradas incluidas; `null` = ilimitadas durante la vigencia. */
  visits: integer("visits"),
  features: text("features")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  isHighlighted: boolean("is_highlighted").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const membership = pgTable(
  "membership",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => plan.id, { onDelete: "restrict" }),
    status: membershipStatusEnum("status").notNull().default("ACTIVE"),
    pricePaid: integer("price_paid").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("membership_user_status_idx").on(t.userId, t.status)],
);

export const trainer = pgTable("trainer", {
  id: id(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  bio: text("bio").notNull(),
  achievements: text("achievements")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  schedule: text("schedule").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const healthRecord = pgTable(
  "health_record",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: healthRecordKindEnum("kind").notNull(),
    /** IMC o calorías diarias objetivo. */
    value: real("value").notNull(),
    /** Datos de entrada usados en el cálculo. */
    input: jsonb("input").$type<Record<string, string | number>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("health_record_user_kind_idx").on(t.userId, t.kind, t.createdAt)],
);

export const contactMessage = pgTable("contact_message", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Relaciones ──────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  orders: many(order),
  memberships: many(membership),
  healthRecords: many(healthRecord),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, { fields: [order.userId], references: [user.id] }),
  items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, { fields: [orderItem.orderId], references: [order.id] }),
  product: one(product, { fields: [orderItem.productId], references: [product.id] }),
}));

export const productRelations = relations(product, ({ many }) => ({
  orderItems: many(orderItem),
}));

export const planRelations = relations(plan, ({ many }) => ({
  memberships: many(membership),
}));

export const membershipRelations = relations(membership, ({ one }) => ({
  user: one(user, { fields: [membership.userId], references: [user.id] }),
  plan: one(plan, { fields: [membership.planId], references: [plan.id] }),
}));

export const healthRecordRelations = relations(healthRecord, ({ one }) => ({
  user: one(user, { fields: [healthRecord.userId], references: [user.id] }),
}));

// ─── Tipos inferidos ─────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
export type ProductCategory = (typeof productCategoryEnum.enumValues)[number];
export type Order = typeof order.$inferSelect;
export type OrderItem = typeof orderItem.$inferSelect;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type Plan = typeof plan.$inferSelect;
export type Membership = typeof membership.$inferSelect;
export type Trainer = typeof trainer.$inferSelect;
export type HealthRecord = typeof healthRecord.$inferSelect;
export type HealthRecordKind = (typeof healthRecordKindEnum.enumValues)[number];
