import { defineStore } from "pinia";
import { ref } from "vue";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import type { Product } from "@/types/product.types";

const client = generateClient<Schema>({
  authMode: "apiKey",
});

export const usePromotionStore = defineStore("promotion", () => {
  const promotions = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPromotions = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await client.models.Product.list({
        filter: {
          and: [
            {
              isPromoted: { eq: true },
            },
            {
              active: { eq: true },
            },
          ],
        },
      });

      promotions.value = response.data;
    } catch (e) {
      console.error("Error fetching promotions:", e);
      error.value = "Error al cargar las promociones";
    } finally {
      loading.value = false;
    }
  };

  const calculateDiscount = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    calculateDiscount,
  };
});
