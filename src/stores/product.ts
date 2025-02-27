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
  const productsByBrand = ref<Product[]>([]); // Nueva referencia para productos por marca
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
          // Obtener las categorías del producto
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

          // Obtener información detallada de la marca si hay brandID
          let brandInfo = { name: product.brand as unknown as string };
          if (product.brandID) {
            try {
              const { data: brand } = await publicClient.models.Brand.get({
                id: product.brandID,
              });
              if (brand) {
                brandInfo = {
                  name: brand.name ?? "",
                };
              }
            } catch (e) {
              console.error("Error al obtener la marca:", e);
            }
          }

          return {
            ...product,
            brand: brandInfo.name,
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

  // Función corregida para fetchProductsByBrand
  const fetchProductsByBrand = async (brandId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { data: productsResult } = await publicClient.models.Product.list({
        filter: {
          brandID: { eq: brandId },
          active: { eq: true },
        },
      });

      if (!productsResult) {
        productsByBrand.value = [];
        return;
      }

      // Obtener información de la marca para saber su nombre
      let brandName = "";
      try {
        const { data: brand } = await publicClient.models.Brand.get({
          id: brandId,
        });
        if (brand) {
          brandName = brand.name ?? "";
        }
      } catch (e) {
        console.error("Error al obtener información de la marca:", e);
      }

      // Obtener categorías para cada producto y asignar el nombre de la marca
      const productsWithCategoriesAndBrand = await Promise.all(
        productsResult.map(async (product) => {
          const { data: productCategories } =
            await publicClient.models.ProductCategory.list({
              filter: {
                productID: { eq: product.id },
              },
            });

          if (!productCategories) {
            return {
              ...product,
              brand: brandName, // Asignar el nombre real de la marca
              categories: [],
            };
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
            brand: brandName, // Asignar el nombre real de la marca
            categories: categories.filter(
              (category): category is NonNullable<typeof category> =>
                category !== null
            ),
          };
        })
      );

      productsByBrand.value =
        productsWithCategoriesAndBrand as unknown as Product[];
    } catch (err) {
      console.error("Error fetching products by brand:", err);
      error.value = "Error al cargar productos de la marca";
      throw err;
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

            if (product && product.brandID) {
              try {
                // Obtener información detallada de la marca
                const { data: brand } = await publicClient.models.Brand.get({
                  id: product.brandID,
                });
                if (brand) {
                  return {
                    ...product,
                    brand: brand.name, // Actualizar con el nombre real de la marca
                    brandLogo: brand.logo,
                  };
                }
              } catch (e) {
                console.error("Error al obtener la marca:", e);
              }
            }

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

      // Filtrar productos primero
      const filteredProducts = items.filter((product) => {
        if (!product.isPromoted) return true;

        if (!product.promotionStartDate || !product.promotionEndDate)
          return false;

        const isWithinPromotionPeriod =
          currentDate >= product.promotionStartDate &&
          currentDate <= product.promotionEndDate;

        return !isWithinPromotionPeriod;
      });

      // Ahora obtener la información de marca para cada producto filtrado
      const productsWithBrandInfo = await Promise.all(
        filteredProducts.map(async (product) => {
          // Verificar si el producto tiene un brandID
          if (product.brandID) {
            try {
              // Obtener información detallada de la marca
              const { data: brand } = await publicClient.models.Brand.get({
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

      productsWeb.value = productsWithBrandInfo as unknown as Product[];
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

      // Actualizar los datos de marca para cada producto
      const productsWithBrands = await Promise.all(
        items.map(async (product) => {
          if (product.brandID) {
            try {
              const { data: brand } = await publicClient.models.Brand.get({
                id: product.brandID,
              });
              if (brand) {
                return {
                  ...product,
                  brand: brand.name,
                  brandLogo: brand.logo,
                };
              }
            } catch (e) {
              console.error("Error al obtener la marca:", e);
            }
          }
          return product;
        })
      );

      allProductsWeb.value = productsWithBrands as unknown as Product[];
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
    productsByBrand, // Exportar la nueva referencia
    loading,
    error,
    fetchProducts,
    fetchProductsByCategory,
    fetchProductsByBrand, // Exportar la nueva función
    fetchProductsWeb,
    fetchAllProductsWeb,
    createProduct,
    updateProduct,
    deleteProduct,
  };
});
