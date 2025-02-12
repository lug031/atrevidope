import type { Product } from "./product.types";


export interface CartItem {
  id: string;
  cartID: string;
  productID: string;
  quantity: number;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  isPromoted: boolean;
  product?: Product;
}

export interface Cart {
  id: string;
  userID: string;
  items: CartItem[];
  status: 'active' | 'checkout' | 'abandoned' | 'completed';
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}
