// order.types.ts

import type { Category } from "./category.types";
import type { Product } from "./product.types";

// Tipo para la información del cliente
export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  documentType: "DNI" | "CE" | "Pasaporte";
  documentNumber: string;
  phone: string;
  shippingMethod: "regular";
  invoiceType: "boleta" | "factura";
  paymentMethod: "tarjeta" | "yape" | "plin" | "qr" | "efectivo";
}

// Tipo para los items del pedido
export interface OrderItem {
  productID: string;
  quantity: number;
  price: number;
  subtotal: number;
  productSnapshot: Omit<Product, "id">;
}

// Tipo para el estado del pedido
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

// Tipo principal del Order
export interface Order {
  id?: string;
  customerInfo: CustomerInfo;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  linkPago?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface GraphQLError {
  errors?: Array<{
    message: string;
    path?: string[];
    locations?: Array<{ line: number; column: number }>;
  }>;
}
