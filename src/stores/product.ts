import { defineStore } from "pinia";
import { ref } from "vue";
import type { Schema } from "../../amplify/data/resource";
import type { Product } from "@/types/product.types";
import { generateClient } from "aws-amplify/data";

const publicClient = generateClient<Schema>({
  authMode: "apiKey",
});

const authClient = generateClient<Schema>({
  authMode: "userPool",
});

export const useProductStore = defineStore("product", () => {
  const products = ref<Product[]>([]);
  const productsWeb = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchProducts = async () => {
    loading.value = true;
    try {
      const { data: items } = await publicClient.models.Product.list();
      products.value = items as unknown as Product[];
    } catch (err) {
      error.value = "Error al cargar productos";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchProductsByCategory = async (categoryId: string) => {
    loading.value = true;
    error.value = null;
    products.value = []; // Limpiar productos anteriores

    try {
      const { data: items } = await publicClient.models.Product.list({
        filter: {
          and: [{ categoryID: { eq: categoryId } }, { active: { eq: true } }],
        },
      });

      products.value = items as unknown as Product[];
    } catch (err) {
      console.error("Error fetching products by category:", err);
      error.value = "Error al cargar productos de la categoría";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductsWeb = async () => {
    loading.value = true;
    try {
      const { data: items } = await publicClient.models.Product.list({
        filter: {
          and: [
            {
              isPromoted: { eq: false },
            },
            {
              active: { eq: true },
            },
          ],
        },
      });
      productsWeb.value = items as unknown as Product[];
    } catch (err) {
      error.value = "Error al cargar productos web";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (productData: Omit<Product, "id">) => {
    loading.value = true;
    try {
      const { data: newProduct } = await authClient.models.Product.create(
        productData
      );
      await fetchProducts();
      return newProduct;
    } catch (err) {
      error.value = "Error al crear producto";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    loading.value = true;
    try {
      const { id: _, ...updateData } = productData;
      const { data: updatedProduct } = await authClient.models.Product.update({
        id,
        ...updateData,
      });
      await fetchProducts();
      return updatedProduct;
    } catch (err) {
      error.value = "Error al actualizar producto";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id: string) => {
    loading.value = true;
    try {
      await authClient.models.Product.delete({ id });
      await fetchProducts();
    } catch (err) {
      error.value = "Error al eliminar producto";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    products,
    productsWeb,
    loading,
    error,
    fetchProducts,
    fetchProductsByCategory,
    fetchProductsWeb,
    createProduct,
    updateProduct,
    deleteProduct,
  };
});
