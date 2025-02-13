import { defineStore } from "pinia";
import { ref } from "vue";
import type { Schema } from "../../amplify/data/resource";
import type { Order, OrderItem } from "@/types/order.types";
import { generateClient } from "aws-amplify/data";

const publicClient = generateClient<Schema>({
  authMode: "apiKey",
});

const authClient = generateClient<Schema>({
  authMode: "userPool",
});

export const useOrderStore = defineStore("order", () => {
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Función auxiliar para convertir los items a string
  const prepareOrderData = (orderData: Omit<Order, "id">) => {
    const now = new Date().toISOString();

    // Preparamos los datos según el schema
    return {
      customerInfo: orderData.customerInfo,
      items: JSON.stringify(orderData.items),
      status: "pending" as const,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      total: orderData.total,
      userEmail: orderData.userEmail,
      createdAt: now,
      updatedAt: now,
    };
  };

  const fetchOrders = async () => {
    loading.value = true;
    try {
      const { data: items } = await authClient.models.Order.list();
      orders.value = items.map(parseOrderData);
    } catch (err) {
      error.value = "Error al cargar órdenes";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const parseOrderData = (order: any): Order => {
    return {
      ...order,
      items: JSON.parse(order.items),
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
    };
  };

  const createOrder = async (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
  ) => {
    loading.value = true;
    try {
      const preparedData = prepareOrderData(orderData);
      const { data: newOrder } = await publicClient.models.Order.create(
        preparedData
      );
      await fetchOrders();
      return parseOrderData(newOrder);
    } catch (err) {
      error.value = "Error al crear orden";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    loading.value = true;
    try {
      const { data: updatedOrder } = await authClient.models.Order.update({
        id,
        status,
      });

      if (status === "completed") {
        await updateProductsStock(parseOrderData(updatedOrder));
      }

      await fetchOrders();
      return parseOrderData(updatedOrder);
    } catch (err) {
      error.value = "Error al actualizar estado de la orden";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProductsStock = async (order: Order) => {
    try {
      for (const item of order.items) {
        const { data: product } = await authClient.models.Product.get({
          id: item.productID,
        });

        if (product && product.stock !== null) {
          await authClient.models.Product.update({
            id: item.productID,
            stock: product.stock - item.quantity,
          });
        } else {
          throw new Error(
            `No se pudo actualizar el stock para el producto ${item.productID}`
          );
        }
      }
    } catch (err) {
      console.error("Error actualizando stock:", err);
      throw new Error("Error al actualizar el stock de los productos");
    }
  };

  const fetchUserOrders = async (userEmail: string) => {
    loading.value = true;
    try {
      const { data: items } = await authClient.models.Order.list({
        filter: {
          userEmail: { eq: userEmail },
        },
      });
      return items.map(parseOrderData);
    } catch (err) {
      error.value = "Error al cargar órdenes del usuario";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getOrder = async (id: string) => {
    loading.value = true;
    try {
      const { data: order } = await authClient.models.Order.get({
        id,
      });
      return parseOrderData(order);
    } catch (err) {
      error.value = "Error al obtener la orden";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    fetchUserOrders,
    getOrder,
  };
});
