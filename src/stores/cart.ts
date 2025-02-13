import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { CartItem } from "@/types/cart.types";
import type { Product } from "@/types/product.types";

const CART_STORAGE_KEY = "shopping-cart";

export const useCartStore = defineStore("cart", () => {
  // State
  const items = ref<CartItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const showNotification = ref(false);

  // Initialize cart from localStorage
  const initializeCart = () => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      items.value = JSON.parse(savedCart);
    }
  };

  // Watch for changes and update localStorage
  watch(
    items,
    (newItems) => {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    },
    { deep: true }
  );

  // Initialize cart when store is created
  initializeCart();

  // Getters
  const itemCount = computed(() => items.value.length);

  const cartSubtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const cartTotal = computed(() => {
    const shipping = cartSubtotal.value >= 200 ? 0 : 15;
    return cartSubtotal.value + shipping;
  });

  // Actions
  const fetchCartItems = async () => {
    if (loading.value) return;

    loading.value = true;
    try {
      // Simulamos una carga asíncrona para mantener consistencia en la UI
      await new Promise((resolve) => setTimeout(resolve, 500));
      initializeCart();
    } catch (err) {
      console.error("Error al cargar items del carrito:", err);
      error.value = "Error al cargar items del carrito";
    } finally {
      loading.value = false;
    }
  };

  const generateCartItemId = () => {
    return `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addItem = async (product: Product, quantity: number = 1) => {
    loading.value = true;
    try {
      const existingItem = findItem(product.id);

      // Simulamos una operación asíncrona
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (existingItem) {
        await updateItemQuantity(
          existingItem.id,
          existingItem.quantity + quantity
        );
      } else {
        const newItem: CartItem = {
          id: generateCartItemId(),
          cartID: "default-cart",
          productID: product.id,
          quantity,
          price: product.price,
          originalPrice: product.originalPrice,
          discountPercentage: product.discountPercentage,
          isPromoted: product.isPromoted,
        };

        items.value.push(newItem);
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
      // Simulamos una operación asíncrona
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (quantity > 0) {
        const index = items.value.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          items.value[index] = {
            ...items.value[index],
            quantity,
          };
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
      // Simulamos una operación asíncrona
      await new Promise((resolve) => setTimeout(resolve, 500));

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
      // Simulamos una operación asíncrona
      await new Promise((resolve) => setTimeout(resolve, 500));

      items.value = [];
      localStorage.removeItem(CART_STORAGE_KEY);
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
    // State
    items,
    loading,
    error,
    showNotification,

    // Getters
    itemCount,
    cartSubtotal,
    cartTotal,

    // Actions
    fetchCartItems,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    findItem,
  };
});
