import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { CartItem } from "../types/cart.types";

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);
  const showNotification = ref(false);

  const itemCount = computed(() => items.value.length);

  const addItem = (item: CartItem) => {
    items.value.push(item);
    // Activar la notificación
    showNotification.value = true;
    // Desactivar después de 2 segundos
    setTimeout(() => {
      showNotification.value = false;
    }, 2000);
  };

  // Función opcional para verificar si un item ya existe
  const findItem = (id: string) => {
    return items.value.find((item) => item.id === id);
  };

  // Función opcional para actualizar la cantidad de un item existente
  const updateItemQuantity = (id: string, quantity: number) => {
    const item = findItem(id);
    if (item) {
      item.quantity = quantity;
    }
  };

  // Función opcional para eliminar un item
  const removeItem = (id: string) => {
    const index = items.value.findIndex((item) => item.id === id);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  };

  return {
    items,
    itemCount,
    showNotification,
    addItem,
    findItem,
    updateItemQuantity,
    removeItem,
  };
});
