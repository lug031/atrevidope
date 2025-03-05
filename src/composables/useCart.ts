import { computed, ref } from "vue";
import { useCartStore } from "@/stores/cart";
import { storeToRefs } from "pinia";
import type { Product } from "@/types/product.types";
import type { CartItem } from "@/types/cart.types";

export function useCart(options = { paymentMethod: ref('') }) {
  const cartStore = useCartStore();
  const { items, loading, error, showNotification } = storeToRefs(cartStore);

  const validItems = computed(() => {
    return items.value.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.id &&
        item.productID &&
        typeof item.quantity === "number" &&
        typeof item.price === "number"
    );
  });

  const totalItems = computed(() => validItems.value.length);

  const subtotal = computed(() =>
    validItems.value.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    )
  );

  const izipayCommissionRate = 0.04; // 4%

  const izipayCommission = computed(() => {
    return options.paymentMethod.value === "izipay"
      ? Math.round(subtotal.value * izipayCommissionRate * 100) / 100
      : 0;
  });

  // Modificamos el cálculo del total para incluir la comisión cuando corresponda
  const total = computed(() => {
    return subtotal.value + izipayCommission.value;
  });

  /*const total = computed(() => {
    return subtotal.value + shippingCost.value;
  });*/

  const shippingCost = computed(() => {
    // If subtotal is 0 or greater than/equal to 200, shipping is free
    if (subtotal.value === 0 || subtotal.value >= 200) {
      return 0;
    }
    return 15;
  });

  const hasItems = computed(() => validItems.value.length > 0);

  const loadCartItems = async () => {
    try {
      await cartStore.fetchCartItems();
    } catch (error) {
      throw error;
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      await cartStore.addItem(product, quantity);
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartStore.updateItemQuantity(itemId, quantity);
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await cartStore.removeItem(itemId);
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartStore.clearCart();
    } catch (error) {
      throw error;
    }
  };

  const findCartItem = (productId: string) => {
    if (!productId) return null;
    return cartStore.findItem(productId);
  };

  const isInCart = (productId: string) => {
    if (!productId) return false;
    return !!findCartItem(productId);
  };

  const getItemQuantity = (productId: string) => {
    if (!productId) return 0;
    const item = findCartItem(productId);
    return item ? item.quantity || 0 : 0;
  };

  const canIncreaseQuantity = (product: Product) => {
    if (!product?.id || !product?.stock) return false;
    const currentQuantity = getItemQuantity(product.id);
    return currentQuantity < product.stock;
  };

  return {
    // Estado
    items, // Retornamos los items originales
    validItems, // Exponemos validItems como una propiedad separada
    loading,
    error,
    showNotification,

    // Computed properties
    totalItems,
    subtotal,
    total,
    shippingCost,
    hasItems,

    // Izipay
    izipayCommission,
    izipayCommissionRate,

    // Métodos
    loadCartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    findCartItem,
    isInCart,
    getItemQuantity,
    canIncreaseQuantity,
  };
}
