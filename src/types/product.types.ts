import type { CartItem } from "./cart.types";
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
  categoryID: string;
  category?: Category;
  imageUrl: string;
  promotionStartDate: string | null;
  promotionEndDate: string | null;
  promotionType: string | null;
  cartItems?: CartItem[];
}
