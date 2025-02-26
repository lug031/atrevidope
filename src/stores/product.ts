import { defineStore } from "pinia";
import { ref } from "vue";
import type { Schema } from "../../amplify/data/resource";
import type { Product } from "@/types/product.types";
import { generateClient } from "aws-amplify/data";
import { useImageCache } from "@/composables/useImageCache";

const publicClient = generateClient<Schema>({
  authMode: "apiKey",
});

const authClient = generateClient<Schema>({
  authMode: "userPool",
});

export const useProductStore = defineStore("product", () => {
  const products = ref<Product[]>([]);
  const allProductsWeb = ref<Product[]>([]);
  const productsWeb = ref<Product[]>([]);
  const productsByCategory = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { removeFromCache, validateAndUpdateImage, cleanExpiredCache } =
    useImageCache();

  const fetchProducts = async () => {
    loading.value = true;
    try {
      const { data: items } = await publicClient.models.Product.list();

      if (!items) {
        throw new Error("Error al obtener productos: items es null");
      }

      const productsWithCategories = await Promise.all(
        items.map(async (product) => {
          const { data: productCategories } =
            await publicClient.models.ProductCategory.list({
              filter: {
                productID: { eq: product.id },
              },
            });

          if (!productCategories) {
            return { ...product, categories: [] };
          }

          const categoriesPromises = productCategories
            .filter((pc) => pc.categoryID !== null)
            .map(async (pc) => {
              if (pc.categoryID) {
                const { data: category } =
                  await publicClient.models.Category.get({
                    id: pc.categoryID,
                  });
                return category;
              }
              return null;
            });

          const categories = await Promise.all(categoriesPromises);

          return {
            ...product,
            categories: categories.filter(
              (category): category is NonNullable<typeof category> =>
                category !== null
            ),
          };
        })
      );

      products.value = productsWithCategories as unknown as Product[];
      cleanExpiredCache(products.value.map((p) => p.id));
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

    try {
      const { data: productCategories } =
        await publicClient.models.ProductCategory.list({
          filter: {
            categoryID: { eq: categoryId },
          },
        });

      if (!productCategories) {
        productsByCategory.value = [];
        return;
      }

      const productsPromises = productCategories
        .filter((pc) => pc.productID !== null)
        .map(async (pc) => {
          if (pc.productID) {
            const { data: product } = await publicClient.models.Product.get({
              id: pc.productID,
            });
            return product;
          }
          return null;
        });

      const products = await Promise.all(productsPromises);

      productsByCategory.value = products.filter(
        (product): product is NonNullable<typeof product> =>
          product !== null && product.active === true
      ) as unknown as Product[];
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
          active: { eq: true },
        },
      });

      const currentDate = getCurrentPeruDate();

      productsWeb.value = items.filter((product) => {
        if (!product.isPromoted) return true;

        if (!product.promotionStartDate || !product.promotionEndDate)
          return false;

        const isWithinPromotionPeriod =
          currentDate >= product.promotionStartDate &&
          currentDate <= product.promotionEndDate;

        return !isWithinPromotionPeriod;
      }) as unknown as Product[];
    } catch (err) {
      error.value = "Error al cargar productos web";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const getCurrentPeruDate = (): string => {
    const date = new Date();
    const peruDate = new Date(
      date.toLocaleString("en-US", { timeZone: "America/Lima" })
    );

    const year = peruDate.getFullYear();
    const month = String(peruDate.getMonth() + 1).padStart(2, "0");
    const day = String(peruDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const fetchAllProductsWeb = async () => {
    loading.value = true;
    try {
      const { data: items } = await publicClient.models.Product.list({
        filter: {
          and: [{ active: { eq: true } }],
        },
      });
      allProductsWeb.value = items as unknown as Product[];
    } catch (err) {
      error.value = "Error al cargar productos web";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (
    productData: Omit<Product, "id" | "categories">,
    categoryIds: string[]
  ) => {
    loading.value = true;
    try {
      // Crear el producto
      const { data: newProduct } = await authClient.models.Product.create({
        ...productData,
      });

      if (!newProduct || !newProduct.id) {
        throw new Error(
          "Error al crear el producto: respuesta inválida del servidor"
        );
      }

      // Crear las relaciones con las categorías
      const productCategoryPromises = categoryIds.map((categoryId) =>
        authClient.models.ProductCategory.create({
          productID: newProduct.id,
          categoryID: categoryId,
        })
      );

      await Promise.all(productCategoryPromises);

      // Recargar los productos
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

  const updateProduct = async (
    id: string,
    productData: Partial<Omit<Product, "id" | "categories">>,
    categoryIds: string[]
  ) => {
    loading.value = true;
    try {
      // Actualizar el producto
      const { data: updatedProduct } = await authClient.models.Product.update({
        id,
        ...productData,
      });

      if (productData.imageUrl) {
        await validateAndUpdateImage(id, productData.imageUrl);
      }

      if (categoryIds) {
        // Obtener las relaciones existentes
        const { data: existingRelations } =
          await authClient.models.ProductCategory.list({
            filter: { productID: { eq: id } },
          });

        // Eliminar las relaciones existentes
        await Promise.all(
          existingRelations.map((relation) =>
            authClient.models.ProductCategory.delete({ id: relation.id })
          )
        );

        // Crear las nuevas relaciones
        await Promise.all(
          categoryIds.map((categoryId) =>
            authClient.models.ProductCategory.create({
              productID: id,
              categoryID: categoryId,
            })
          )
        );
      }

      await fetchProducts();
      return updatedProduct;
    } catch (err) {
      error.value = "Error al crear producto";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id: string) => {
    loading.value = true;
    try {
      const { data: relations } = await authClient.models.ProductCategory.list({
        filter: { productID: { eq: id } },
      });

      if (relations) {
        await Promise.all(
          relations.map((relation) =>
            relation.id
              ? authClient.models.ProductCategory.delete({ id: relation.id })
              : Promise.resolve()
          )
        );
      }

      await authClient.models.Product.delete({ id });

      removeFromCache(id);
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
    allProductsWeb,
    productsByCategory,
    loading,
    error,
    fetchProducts,
    fetchProductsByCategory,
    fetchProductsWeb,
    fetchAllProductsWeb,
    createProduct,
    updateProduct,
    deleteProduct,
  };
});
