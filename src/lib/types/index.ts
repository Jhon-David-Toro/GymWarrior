export type ProductCategory = "SUPPLEMENTS" | "APPAREL" | "ACCESSORIES";

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";

export type UserRole = "USER" | "ADMIN";

export type MembershipStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export type HealthRecordKind = "BMI" | "CALORIES";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}

export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: ProductCategory;
  imageUrl: string;
  isFeatured: boolean;
}
