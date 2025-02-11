import type { Product } from "./product.types";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  active: boolean;
  products?: ProductPromotion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPromotion {
  id: string;
  productID: string;
  promotionID: string;
  product: Product;
  promotion: Promotion;
  originalPrice: number;
  finalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}
