import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Schema } from "../../amplify/data/resource";
import type { Product } from "@/types/product.types";
import { generateClient } from "aws-amplify/data";
import type { CartItem } from "@/types/cart.types";

const authClient = generateClient<Schema>({
  authMode: "userPool",
});

const publicClient = generateClient<Schema>({
  authMode: "apiKey",
});

export const useCartStore = defineStore("cart", () => {
  // Estado
  const items = ref<CartItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const showNotification = ref(false);

  // Getters
  const itemCount = computed(() => items.value.length);

  const cartSubtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const cartTotal = computed(() => {
    const shipping = cartSubtotal.value >= 200 ? 0 : 15;
    return cartSubtotal.value + shipping;
  });

  // Acciones
  const fetchCartItems = async () => {
    if (loading.value) return; // Prevenir múltiples llamadas simultáneas

    loading.value = true;
    try {
      const { data: cartItems } = await publicClient.models.CartItem.list();
      items.value = cartItems as unknown as CartItem[];
    } catch (err) {
      console.error("Error al cargar items del carrito:", err);
      error.value = "Error al cargar items del carrito";
    } finally {
      loading.value = false;
    }
  };

  const addItem = async (product: Product, quantity: number = 1) => {
    loading.value = true;
    try {
      const existingItem = findItem(product.id);

      if (existingItem) {
        await updateItemQuantity(
          existingItem.id,
          existingItem.quantity + quantity
        );
      } else {
        const newItem = {
          productID: product.id,
          quantity,
          price: product.price,
          originalPrice: product.originalPrice,
          discountPercentage: product.discountPercentage,
          isPromoted: product.isPromoted,
        };

        const { data: cartItem } = await publicClient.models.CartItem.create(
          newItem
        );
        items.value.push(cartItem as unknown as CartItem);

        showNotification.value = true;
        setTimeout(() => {
          showNotification.value = false;
        }, 2000);
      }
    } catch (err) {
      error.value = "Error al añadir item al carrito";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    loading.value = true;
    try {
      if (quantity > 0) {
        const { data: updatedItem } = await publicClient.models.CartItem.update(
          {
            id: itemId,
            quantity,
          }
        );
        const index = items.value.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          items.value[index] = updatedItem as unknown as CartItem;
        }
      }
    } catch (err) {
      error.value = "Error al actualizar cantidad";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const removeItem = async (itemId: string) => {
    loading.value = true;
    try {
      await publicClient.models.CartItem.delete({ id: itemId });
      items.value = items.value.filter((item) => item.id !== itemId);
    } catch (err) {
      error.value = "Error al eliminar item del carrito";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearCart = async () => {
    loading.value = true;
    try {
      await Promise.all(
        items.value.map((item) =>
          publicClient.models.CartItem.delete({ id: item.id })
        )
      );
      items.value = [];
    } catch (err) {
      error.value = "Error al limpiar el carrito";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const findItem = (productId: string) => {
    return items.value?.find((item) => item?.productID === productId) || null;
  };

  return {
    // Estado
    items,
    loading,
    error,
    showNotification,

    // Getters
    itemCount,
    cartSubtotal,
    cartTotal,

    // Acciones
    fetchCartItems,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    findItem,
  };
});
