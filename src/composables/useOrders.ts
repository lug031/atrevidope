import { computed } from "vue";
import { useOrderStore } from "@/stores/order";
import { storeToRefs } from "pinia";
import type { Order } from "@/types/order.types";

export function useOrders() {
  const orderStore = useOrderStore();
  const { orders, loading, error } = storeToRefs(orderStore);

  // Computed properties
  const totalOrders = computed(() => orders.value.length);

  const pendingOrders = computed(() =>
    orders.value.filter((order) => order.status === "pending")
  );

  const completedOrders = computed(() =>
    orders.value.filter((order) => order.status === "completed")
  );

  const cancelledOrders = computed(() =>
    orders.value.filter((order) => order.status === "cancelled")
  );

  // Funciones básicas de CRUD
  const loadOrders = async () => {
    await orderStore.fetchOrders();
  };

  const createOrder = async (
    data: Omit<Order, "id" | "createdAt" | "updatedAt">
  ) => {
    return await orderStore.createOrder(data);
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    return await orderStore.updateOrderStatus(id, status);
  };

  // Funciones específicas del negocio
  const getUserOrders = async (userEmail: string) => {
    return await orderStore.fetchUserOrders(userEmail);
  };

  const getOrderDetails = async (id: string) => {
    return await orderStore.getOrder(id);
  };

  // Función para calcular estadísticas de órdenes
  const getOrderStats = computed(() => ({
    total: orders.value.length,
    pending: pendingOrders.value.length,
    completed: completedOrders.value.length,
    cancelled: cancelledOrders.value.length,
    totalRevenue: completedOrders.value.reduce(
      (sum, order) => sum + order.total,
      0
    ),
    averageOrderValue:
      completedOrders.value.length > 0
        ? completedOrders.value.reduce((sum, order) => sum + order.total, 0) /
          completedOrders.value.length
        : 0,
  }));

  return {
    // Estado
    orders,
    loading,
    error,

    // Computed properties
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    orderStats: getOrderStats,

    // Funciones
    loadOrders,
    createOrder,
    updateOrderStatus,
    getUserOrders,
    getOrderDetails,
  };
}
