import { defineStore } from "pinia";
import { ref } from "vue";
import type { Schema } from "../../amplify/data/resource";
import type { GraphQLError, Order, OrderItem } from "@/types/order.types";
import { generateClient } from "aws-amplify/data";

const publicClient = generateClient<Schema>({
  authMode: "apiKey",
});

const authClient = generateClient<Schema>({
  authMode: "userPool",
});

type CreateOrderInput = {
  firstName: string;
  lastName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  shippingMethod: string;
  invoiceType: string;
  paymentMethod: string;
  items: string;
  userEmail: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  linkPago: string;
  linkShort: string;
};

export const useOrderStore = defineStore("order", () => {
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Función auxiliar para convertir los items a string
  const prepareOrderData = (orderData: Omit<Order, "id">): CreateOrderInput => {
    // Extraer los campos de customerInfo
    const {
      firstName,
      lastName,
      email,
      documentType,
      documentNumber,
      phone,
      shippingMethod,
      invoiceType,
      paymentMethod,
    } = orderData.customerInfo;

    // Preparar los datos según el schema exacto
    return {
      // Customer info fields
      firstName,
      lastName,
      email,
      documentType,
      documentNumber,
      phone,
      shippingMethod,
      invoiceType,
      paymentMethod,

      // Order items como string
      items: Array.isArray(orderData.items)
        ? JSON.stringify(orderData.items)
        : orderData.items,

      // User email
      userEmail: orderData.userEmail,

      // Order totals
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      total: orderData.total,

      // Status
      status: "pending",

      // Link de pago
      linkPago: "",
      linkShort: "",
    };
  };

  /*const fetchOrders = async () => {
    loading.value = true;
    try {
      const { data: items } = await authClient.models.Order.list();
      orders.value = items.map(parseOrderData);
    } catch (err) {
      error.value = "Error al cargar pedidos";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };*/

  const fetchOrders = async () => {
    loading.value = true;
    try {
      const { data: items } = await authClient.models.Order.list();

      const sortedItems = [...items].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        return dateA - dateB;
      });

      orders.value = sortedItems.map(parseOrderData);
    } catch (err) {
      error.value = "Error al cargar pedidos";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const parseOrderData = (order: any): Order => {
    if (!order) {
      throw new Error("No se recibieron datos de la orden");
    }

    try {
      const parsedItems =
        typeof order.items === "string" ? JSON.parse(order.items) : order.items;

      // Reconstruir el objeto customerInfo
      const customerInfo = {
        firstName: order.firstName,
        lastName: order.lastName,
        email: order.email,
        documentType: order.documentType,
        documentNumber: order.documentNumber,
        phone: order.phone,
        shippingMethod: order.shippingMethod,
        invoiceType: order.invoiceType,
        paymentMethod: order.paymentMethod || "",
      };

      return {
        id: order.id,
        customerInfo,
        items: parsedItems,
        userEmail: order.userEmail,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod || "",
        linkPago: order.linkPago || "",
        linkShort: order.linkShort || "",
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      };
    } catch (err) {
      console.error("Error al parsear los datos de la orden:", err);
      console.error("Datos recibidos:", order);
      throw new Error("Error al procesar los datos de la orden");
    }
  };

  const isGraphQLError = (error: unknown): error is GraphQLError => {
    return typeof error === "object" && error !== null && "errors" in error;
  };

  const createOrder = async (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
  ) => {
    loading.value = true;
    try {
      const preparedData = prepareOrderData(orderData);
      console.log("Prepared order data:", preparedData);

      const { data: newOrder } = await publicClient.models.Order.create(
        preparedData
      );

      if (!newOrder) {
        throw new Error(
          "No se recibió respuesta del servidor al crear la orden"
        );
      }

      const parsedOrder = parseOrderData(newOrder);
      //await fetchOrders();
      return parsedOrder;
    } catch (err: unknown) {
      if (isGraphQLError(err)) {
        const errorMessage = err.errors?.[0]?.message;
        error.value = errorMessage
          ? `Error al crear orden: ${errorMessage}`
          : "Error al crear orden";
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Error desconocido al crear orden";
      }

      console.error("Error detallado:", err);
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
      const { data: items } = await publicClient.models.Order.list({
        filter: {
          userEmail: { eq: userEmail },
        },
      });
      return items.map(parseOrderData);
    } catch (err) {
      error.value = "Error al cargar pedidos del usuario";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getOrder = async (id: string) => {
    loading.value = true;
    try {
      const { data: order } = await publicClient.models.Order.get({
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

  const updateOrderPaymentLink = async (id: string, linkPago: string) => {
    loading.value = true;
    try {
      // Usamos el cliente apropiado según si es administrador o usuario público
      const client = authClient; // Para administradores (podría cambiarse según lógica de negocio)

      const { data: updatedOrder } = await client.models.Order.update({
        id,
        linkPago, // Actualizamos solo el enlace de pago
      });

      if (!updatedOrder) {
        throw new Error(
          "No se recibió respuesta del servidor al actualizar el enlace de pago"
        );
      }

      // Actualizamos la lista de órdenes si es necesario
      await fetchOrders();

      return parseOrderData(updatedOrder);
    } catch (err) {
      if (isGraphQLError(err)) {
        const errorMessage = err.errors?.[0]?.message;
        error.value = errorMessage
          ? `Error al actualizar enlace de pago: ${errorMessage}`
          : "Error al actualizar enlace de pago";
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Error desconocido al actualizar enlace de pago";
      }

      console.error("Error detallado:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // New function to update just the short link
  const updateOrderShortLink = async (id: string, linkShort: string) => {
    loading.value = true;
    try {
      const client = authClient;

      const { data: updatedOrder } = await client.models.Order.update({
        id,
        linkShort, // Update only the short link
      });

      if (!updatedOrder) {
        throw new Error(
          "No se recibió respuesta del servidor al actualizar el enlace acortado"
        );
      }

      await fetchOrders();
      return parseOrderData(updatedOrder);
    } catch (err) {
      if (isGraphQLError(err)) {
        const errorMessage = err.errors?.[0]?.message;
        error.value = errorMessage
          ? `Error al actualizar enlace acortado: ${errorMessage}`
          : "Error al actualizar enlace acortado";
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "Error desconocido al actualizar enlace acortado";
      }

      console.error("Error detallado:", err);
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
    updateOrderPaymentLink,
    updateOrderShortLink,
    getOrder,
  };
});
