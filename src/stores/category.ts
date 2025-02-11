import { defineStore } from "pinia";
import { ref } from "vue";
import type { Schema } from "../../amplify/data/resource";
import type { Category } from "@/types/category.types";
import { generateClient } from "aws-amplify/data";

const publicClient = generateClient<Schema>({
  authMode: 'apiKey'
});

const authClient = generateClient<Schema>({
  authMode: 'userPool'
});
export const useCategoryStore = defineStore("category", () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCategories = async () => {
    loading.value = true;
    try {
      const { data: items } = await publicClient.models.Category.list();
      categories.value = items as unknown as Category[];
    } catch (err) {
      error.value = "Error al cargar categorias";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (categoryData: Omit<Category, "id">) => {
    loading.value = true;
    try {
      const { data: newCategory } = await authClient.models.Category.create(
        categoryData
      );
      await fetchCategories();
      return newCategory;
    } catch (err) {
      error.value = "Error al crear categoria";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    loading.value = true;
    try {
      const { id: _, ...updateData } = categoryData;
      const { data: updatedCategory } = await authClient.models.Category.update({
        id,
        ...updateData,
      });
      await fetchCategories();
      return updatedCategory;
    } catch (err) {
      error.value = "Error al actualizar categoria";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: string) => {
    loading.value = true;
    try {
      await authClient.models.Category.delete({ id });
      await fetchCategories();
    } catch (err) {
      error.value = "Error al eliminar categoria";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
});
