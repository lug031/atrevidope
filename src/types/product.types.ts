import type { CartItem } from "./cart.types";
import type { Category } from "./category.types";

export interface Product {
  id: string;
  name: string;
  brand: string;
  brandID: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  active: boolean;
  carousel: boolean;
  isPromoted: boolean;
  categories?: Category[];
  imageUrl: string;
  promotionStartDate: string;
  promotionEndDate: string;
  promotionType: string;
}
