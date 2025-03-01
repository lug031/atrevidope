// src/composables/useOrderValidation.js
import { useProductStore } from "@/stores/product";
import { useToast } from "@/composables/useToast";
import type { Order } from "@/types/order.types";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const publicClient = generateClient<Schema>({
  authMode: "apiKey",
});

const authClient = generateClient<Schema>({
  authMode: "userPool",
});

export function useOrderValidation() {
  const productStore = useProductStore();
  const { showToast } = useToast();

  /**
   * Valida si hay suficiente stock para todos los productos de una orden
   * @param {Order} order - La orden a validar
   * @returns {Promise<{valid: boolean, invalidProducts: Array}>}
   */
  const validateOrderStock = async (order: Order) => {
    const invalidProducts = [];

    for (const item of order.items) {
      try {
        // Obtener el producto directamente de la API
        const { data: product } =
          await authClient.models.Product.get({
            id: item.productID,
          });

        if (!product) {
          invalidProducts.push({
            id: item.productID,
            name: item.productSnapshot?.name || `Producto no encontrado`,
            requested: item.quantity,
            available: 0,
            error: "Producto no encontrado",
          });
          continue;
        }

        // Verificar el stock
        const currentStock = product.stock ?? 0;

        if (currentStock < item.quantity) {
          invalidProducts.push({
            id: item.productID,
            name:
              item.productSnapshot?.name ||
              product.name ||
              `Producto #${item.productID}`,
            requested: item.quantity,
            available: currentStock,
          });
        }
      } catch (error) {
        console.error(
          `Error al verificar stock del producto ${item.productID}:`,
          error
        );
        invalidProducts.push({
          id: item.productID,
          name: item.productSnapshot?.name || `Producto #${item.productID}`,
          requested: item.quantity,
          available: 0,
          error: "Error al verificar stock",
        });
      }
    }

    return {
      valid: invalidProducts.length === 0,
      invalidProducts,
    };
  };

  /**
   * Muestra un mensaje toast con los productos sin stock suficiente
   */
  const showStockValidationToast = (invalidProducts: any) => {
    if (invalidProducts.length === 0) return;

    let message = "No se puede completar la orden:";

    // Si hay muchos productos, mostrar solo algunos para que el mensaje no sea muy largo
    if (invalidProducts.length > 2) {
      const firstTwo = invalidProducts.slice(0, 2);
      message += firstTwo
        .map(
          (p: { name: any; requested: any; available: any; }) =>
            `\n- ${p.name}: Solicitado ${p.requested}, Disponible ${p.available}`
        )
        .join("");
      message += `\n...y ${
        invalidProducts.length - 2
      } productos más sin stock suficiente`;
    } else {
      message += invalidProducts
        .map(
          (p: { name: any; requested: any; available: any; }) =>
            `\n- ${p.name}: Solicitado ${p.requested}, Disponible ${p.available}`
        )
        .join("");
    }

    showToast({
      type: "error",
      message,
      duration: 7000,
    });
  };

  return {
    validateOrderStock,
    showStockValidationToast,
  };
}
