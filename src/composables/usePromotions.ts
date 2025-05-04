import { computed } from "vue";
import { usePromotionStore } from "@/stores/promotion";
import { storeToRefs } from "pinia";
import type { Product } from "@/types/product.types";

export function usePromotions() {
  const promotionStore = usePromotionStore();
  const { promotions, loading, error } = storeToRefs(promotionStore);

  const totalPromotions = computed(() => promotions.value.length);

  const sortedByDiscount = computed(() => {
    return [...promotions.value].sort(
      (a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0)
    );
  });

  const activePromotions = computed(() => {
    return promotions.value.filter((promo) => promo.active);
  });

  const loadPromotions = async () => {
    await promotionStore.fetchPromotions();
  };

  /**
   * Calcula el precio con descuento basado en el tipo de promoción
   * @param product Producto con información de promoción
   * @returns Precio con descuento aplicado
   */
  const calculateDiscountedPrice = (product: Product) => {
    if (!product.originalPrice || !product.discountPercentage)
      return product.price;

    // Si el tipo de promoción es 'fixed', aplicar descuento de monto fijo
    if (product.promotionType === "fixed") {
      return Math.max(0, product.originalPrice - product.discountPercentage);
    } else {
      // Por defecto, aplicar descuento porcentual
      const discountAmount =
        product.originalPrice * (product.discountPercentage / 100);
      return product.originalPrice - discountAmount;
    }
  };

  /**
   * Formatea el precio con dos decimales
   * @param price Precio a formatear
   * @returns Precio formateado con dos decimales
   */
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)}`;
  };

  /**
   * Formatea el texto del descuento según el tipo de promoción
   * @param product Producto con información de promoción
   * @returns Texto formateado para el badge de descuento
   */
  const formatDiscountBadge = (product: Product): string => {
    if (!product.discountPercentage) return "";

    // Si el tipo de promoción es 'fixed', mostrar con S/
    if (product.promotionType === "fixed") {
      return `-S/${product.discountPercentage.toFixed(2)}`;
    } else {
      // Por defecto usar porcentaje
      return `-${product.discountPercentage}%`;
    }
  };

  return {
    promotions,
    loading,
    error,
    totalPromotions,
    sortedByDiscount,
    activePromotions,
    loadPromotions,
    calculateDiscountedPrice,
    formatPrice,
    formatDiscountBadge,
  };
}
