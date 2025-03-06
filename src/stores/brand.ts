import { defineStore } from "pinia";
import { ref } from "vue";
import type { Schema } from "../../amplify/data/resource";
import type { Brand } from "@/types/brand.types";
import { generateClient } from "aws-amplify/data";

const publicClient = generateClient<Schema>({
  authMode: "apiKey",
});

const authClient = generateClient<Schema>({
  authMode: "userPool",
});

export const useBrandStore = defineStore("brand", () => {
  const brands = ref<Brand[]>([]);
  const brandsCarousel = ref<Brand[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchBrands = async () => {
    loading.value = true;
    try {
      const { data: items } = await publicClient.models.Brand.list();
      brands.value = items as unknown as Brand[];
    } catch (err) {
      error.value = "Error al cargar marcas";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const fetchBrandsCarousel = async () => {
    loading.value = true;
    try {
      const { data: items } = await publicClient.models.Brand.list({
        filter: {
          active: { eq: true },
        },
      });
      brandsCarousel.value = items as unknown as Brand[];
    } catch (err) {
      error.value = "Error al cargar marcas";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createBrand = async (brandData: Omit<Brand, "id">) => {
    loading.value = true;
    try {
      const { data: newBrand } = await authClient.models.Brand.create(
        brandData
      );
      await fetchBrands();
      return newBrand;
    } catch (err) {
      error.value = "Error al crear marca";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBrand = async (id: string, brandData: Partial<Brand>) => {
    loading.value = true;
    try {
      const { id: _, ...updateData } = brandData;
      const { data: updatedBrand } = await authClient.models.Brand.update({
        id,
        ...updateData,
      });
      await fetchBrands();
      return updatedBrand;
    } catch (err) {
      error.value = "Error al actualizar marca";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBrand = async (id: string) => {
    loading.value = true;
    try {
      await authClient.models.Brand.delete({ id });
      await fetchBrands();
    } catch (err) {
      error.value = "Error al eliminar marca";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Método para obtener productos de una marca específica
  const getBrandProducts = async (brandId: string) => {
    loading.value = true;
    try {
      const { data: products } = await publicClient.models.Product.list({
        filter: {
          brandID: {
            eq: brandId,
          },
        },
      });
      return products;
    } catch (err) {
      error.value = "Error al cargar productos de la marca";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    brands,
    brandsCarousel,
    loading,
    error,
    fetchBrands,
    fetchBrandsCarousel,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandProducts,
  };
});
