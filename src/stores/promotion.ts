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

      // Obtener información de marca para cada producto en promoción
      const promotionsWithBrands = await Promise.all(
        response.data.map(async (product) => {
          // Verificar si el producto tiene un brandID
          if (product.brandID) {
            try {
              // Obtener información detallada de la marca
              const { data: brand } = await client.models.Brand.get({
                id: product.brandID,
              });

              if (brand) {
                return {
                  ...product,
                  brand: brand.name, // Actualizar con el nombre real de la marca
                  brandLogo: brand.logo, // Agregar el logo de la marca
                };
              }
            } catch (e) {
              console.error(
                `Error al obtener la marca para el producto ${product.id}:`,
                e
              );
            }
          }
          // Si no hay brandID o hubo un error, devolver el producto sin cambios
          return product;
        })
      );

      // Obtener también las categorías para cada producto
      const promotionsWithBrandsAndCategories = await Promise.all(
        promotionsWithBrands.map(async (product) => {
          try {
            // Obtener las categorías asociadas al producto
            const { data: productCategories } =
              await client.models.ProductCategory.list({
                filter: {
                  productID: { eq: product.id },
                },
              });

            if (!productCategories || productCategories.length === 0) {
              return {
                ...product,
                categories: [],
              };
            }

            // Obtener los detalles de cada categoría
            const categoriesPromises = productCategories
              .filter((pc) => pc.categoryID !== null)
              .map(async (pc) => {
                if (pc.categoryID) {
                  const { data: category } = await client.models.Category.get({
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
          } catch (e) {
            console.error(
              `Error al obtener categorías para el producto ${product.id}:`,
              e
            );
            return {
              ...product,
              categories: [],
            };
          }
        })
      );

      promotions.value = promotionsWithBrandsAndCategories;
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
