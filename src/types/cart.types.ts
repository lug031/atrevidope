import type { Product } from "./product.types";

export interface CartItem {
  id: string;
  cartID: string;
  cart?: Cart;
  productID: string;
  product?: Product;
  quantity: number;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  isPromoted: boolean;
  promotionType: string;
}

export interface Cart {
  id: string;
  userID: string;
  items: CartItem[];
  status: "active" | "checkout" | "abandoned" | "completed";
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}
