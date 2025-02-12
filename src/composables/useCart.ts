import { computed } from "vue";
import { useCartStore } from "@/stores/cart";
import { storeToRefs } from "pinia";
import type { Product } from "@/types/product.types";
import type { CartItem } from "@/types/cart.types";

export function useCart() {
  const cartStore = useCartStore();
  const { items, loading, error, showNotification } = storeToRefs(cartStore);

  // Computed properties
  const totalItems = computed(() => items.value.length);

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const total = computed(() => {
    const shipping = subtotal.value >= 200 ? 0 : 15;
    return subtotal.value + shipping;
  });

  const shippingCost = computed(() => (subtotal.value >= 200 ? 0 : 15));

  const hasItems = computed(() => items.value.length > 0);

  // Cargar items del carrito
  const loadCartItems = async () => {
    try {
      await cartStore.fetchCartItems();
    } catch (error) {
      throw error;
    }
  };

  // Añadir item al carrito
  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      await cartStore.addItem(product, quantity);
    } catch (error) {
      throw error;
    }
  };

  // Actualizar cantidad de un item
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartStore.updateItemQuantity(itemId, quantity);
    } catch (error) {
      throw error;
    }
  };

  // Remover item del carrito
  const removeFromCart = async (itemId: string) => {
    try {
      await cartStore.removeItem(itemId);
    } catch (error) {
      throw error;
    }
  };

  // Limpiar carrito
  const clearCart = async () => {
    try {
      await cartStore.clearCart();
    } catch (error) {
      throw error;
    }
  };

  // Encontrar item por productId
  const findCartItem = (productId: string) => {
    return cartStore.findItem(productId);
  };

  // Verificar si un producto está en el carrito
  const isInCart = (productId: string) => {
    return items.value.some((item) => item.productID === productId);
  };

  // Obtener cantidad de un producto en el carrito
  const getItemQuantity = (productId: string) => {
    const item = findCartItem(productId);
    return item ? item.quantity : 0;
  };

  // Verificar si se puede añadir más cantidad de un producto
  const canIncreaseQuantity = (product: Product) => {
    const currentQuantity = getItemQuantity(product.id);
    return currentQuantity < product.stock;
  };

  return {
    // Estado
    items,
    loading,
    error,
    showNotification,

    // Computed properties
    totalItems,
    subtotal,
    total,
    shippingCost,
    hasItems,

    // Métodos principales
    loadCartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,

    // Métodos de utilidad
    findCartItem,
    isInCart,
    getItemQuantity,
    canIncreaseQuantity,
  };
}
