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

  const calculateDiscountedPrice = (product: Product) => {
    if (!product.originalPrice || !product.discountPercentage)
      return product.price;
    const discountAmount =
      product.originalPrice * (product.discountPercentage / 100);
    return product.originalPrice - discountAmount;
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)}`;
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
  };
}
