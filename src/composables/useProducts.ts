import { computed } from "vue";
import { useProductStore } from "@/stores/product";
import { storeToRefs } from "pinia";
import type { Product } from "@/types/product.types";

export function useProducts() {
  const productStore = useProductStore();
  const {
    products,
    productsWeb,
    allProductsWeb,
    allProductsCarousel,
    productsByCategory,
    productsByBrand,
    loading,
    error,
  } = storeToRefs(productStore);

  const totalProducts = computed(() => products.value.length);

  const loadProducts = async () => {
    await productStore.fetchProducts();
  };

  const loadProductsById = async (productId: string) => {
    await productStore.getProductById(productId);
  };

  const loadProductsByCategory = async (categoryId: string) => {
    try {
      await productStore.fetchProductsByCategory(categoryId);
    } catch (error) {
      throw error;
    }
  };

  const loadProductsByBrand = async (brandId: string) => {
    try {
      await productStore.fetchProductsByBrand(brandId);
    } catch (error) {
      throw error;
    }
  };

  const loadProductsWeb = async () => {
    await productStore.fetchProductsWeb();
  };

  const loadAllProductsWeb = async () => {
    await productStore.fetchAllProductsWeb();
  };

  const loadAllProductsCarousel = async () => {
    await productStore.fetchAllProductsCarousel();
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
    allProductsWeb,
    allProductsCarousel,
    productsByCategory,
    productsByBrand,
    loading,
    error,
    totalProducts,
    loadProducts,
    loadProductsById,
    loadAllProductsWeb,
    loadAllProductsCarousel,
    loadProductsByCategory,
    loadProductsByBrand,
    loadProductsWeb,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
