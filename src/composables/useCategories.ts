import { computed } from "vue";
import { useCategoryStore } from "@/stores/category";
import { storeToRefs } from "pinia";
import type { Category } from "@/types/category.types";

export function useCategories() {
  const categoryStore = useCategoryStore();
  const { categories, loading, error } = storeToRefs(categoryStore);

  const totalCategories = computed(() => categories.value.length);

  const loadCategories = async () => {
    await categoryStore.fetchCategories();
  };

  const createCategory = async (data: Omit<Category, "id">) => {
    return await categoryStore.createCategory(data);
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    return await categoryStore.updateCategory(id, data);
  };

  const deleteCategory = async (id: string) => {
    await categoryStore.deleteCategory(id);
  };

  return {
    categories,
    loading,
    error,
    totalCategories,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
