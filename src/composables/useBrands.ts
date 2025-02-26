import { computed } from "vue";
import { useBrandStore } from "@/stores/brand";
import { storeToRefs } from "pinia";
import type { Brand } from "@/types/brand.types";

export function useBrands() {
  const brandStore = useBrandStore();
  const { brands, loading, error } = storeToRefs(brandStore);

  const totalBrands = computed(() => brands.value.length);

  const loadBrands = async () => {
    await brandStore.fetchBrands();
  };

  const createBrand = async (data: Omit<Brand, "id">) => {
    return await brandStore.createBrand(data);
  };

  const updateBrand = async (id: string, data: Partial<Brand>) => {
    return await brandStore.updateBrand(id, data);
  };

  const deleteBrand = async (id: string) => {
    await brandStore.deleteBrand(id);
  };

  const getBrandProducts = async (brandId: string) => {
    return await brandStore.getBrandProducts(brandId);
  };

  return {
    brands,
    loading,
    error,
    totalBrands,
    loadBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandProducts,
  };
}
