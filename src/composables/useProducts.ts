import { computed } from "vue";
import { useProductStore } from "@/stores/product";
import { storeToRefs } from "pinia";
import type { Product } from "@/types/product.types";

export function useProducts() {
  const productStore = useProductStore();
  const { products, productsWeb, productsByCategory, loading, error } =
    storeToRefs(productStore);

  const totalProducts = computed(() => products.value.length);

  const loadProducts = async () => {
    await productStore.fetchProducts();
  };

  const loadProductsByCategory = async (categoryId: string) => {
    try {
      await productStore.fetchProductsByCategory(categoryId);
    } catch (error) {
      throw error;
    }
  };

  const loadProductsWeb = async () => {
    await productStore.fetchProductsWeb();
  };

  const createProduct = async (
    data: Omit<Product, "id">,
    categoryIds: string[]
  ) => {
    return await productStore.createProduct(data, categoryIds);
  };

  const updateProduct = async (
    id: string,
    data: Partial<Product>,
    categoryIds?: string[]
  ) => {
    try {
      const safeCategories = categoryIds || [];
      return await productStore.updateProduct(id, data, safeCategories);
    } catch (error) {
      console.error("Error en composable updateProduct:", error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    await productStore.deleteProduct(id);
  };

  return {
    products,
    productsWeb,
    productsByCategory,
    loading,
    error,
    totalProducts,
    loadProducts,
    loadProductsByCategory,
    loadProductsWeb,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
