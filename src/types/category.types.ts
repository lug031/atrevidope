import type { Product } from "./product.types";

export interface Category {
  id: string;
  name: string;
  description: string;
  active: boolean;
  products?: Product[];
}
