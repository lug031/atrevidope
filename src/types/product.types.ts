import type { Category } from "./category.types";

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  active: boolean;
  isPromoted: boolean;
  imageUrl?: string;
  categoryID: string;
  category?: Category;
  promotionStartDate?: string;
  promotionEndDate?: string;
  promotionType?: string;
}
