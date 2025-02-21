// useImageCache.ts
import { ref } from "vue";
import { getUrl } from "aws-amplify/storage";

interface ImageCache {
  url: string;
  timestamp: number;
}

interface StoredCache {
  [key: string]: ImageCache;
}

export function useImageCache(cacheDuration = 24 * 60 * 60 * 1000) {
  // 24 horas por defecto
  const imageCache = ref<Record<string, string>>({});

  // Cargar caché inicial desde localStorage
  const loadCacheFromStorage = () => {
    try {
      const storedCache = localStorage.getItem("image-cache");
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache) as StoredCache;
        const now = Date.now();

        // Filtrar y mantener solo las entradas que no han expirado
        Object.entries(parsedCache).forEach(([key, value]) => {
          if (now - value.timestamp < cacheDuration) {
            imageCache.value[key] = value.url;
          }
        });
      }
    } catch (error) {
      console.error("Error loading image cache:", error);
    }
  };

  // Guardar caché en localStorage
  const updateStorage = (productId: string, url: string) => {
    try {
      const storedCache = localStorage.getItem("image-cache");
      const cache: StoredCache = storedCache ? JSON.parse(storedCache) : {};

      cache[productId] = {
        url,
        timestamp: Date.now(),
      };

      localStorage.setItem("image-cache", JSON.stringify(cache));
    } catch (error) {
      console.error("Error updating image cache:", error);
    }
  };

  // Función principal para obtener URLs de imágenes
  const getImageUrl = async (
    productId: string,
    imageUrl: string
  ): Promise<string> => {
    // Si ya está en caché, retornar inmediatamente
    if (imageCache.value[productId]) {
      return imageCache.value[productId];
    }

    try {
      // Obtener nueva URL
      const { url } = await getUrl({ path: imageUrl });
      const urlString = url.toString();

      // Actualizar caché en memoria y storage
      imageCache.value[productId] = urlString;
      updateStorage(productId, urlString);

      return urlString;
    } catch (error) {
      console.error(`Error loading image for product ${productId}:`, error);
      return "/api/placeholder/40/40"; // Fallback a imagen por defecto
    }
  };

  // Precargar un conjunto de imágenes
  const preloadImages = async (
    products: Array<{ id: string; imageUrl: string }>
  ) => {
    const loadPromises = products.map((product) => {
      if (product.imageUrl && !imageCache.value[product.id]) {
        return getImageUrl(product.id, product.imageUrl);
      }
      return Promise.resolve();
    });

    await Promise.all(loadPromises);
  };

  // Limpiar caché expirado
  const cleanExpiredCache = () => {
    try {
      const storedCache = localStorage.getItem("image-cache");
      if (storedCache) {
        const cache = JSON.parse(storedCache) as StoredCache;
        const now = Date.now();

        const updatedCache = Object.entries(cache).reduce<StoredCache>(
          (acc, [key, value]) => {
            if (now - value.timestamp < cacheDuration) {
              acc[key] = value;
            }
            return acc;
          },
          {}
        );

        localStorage.setItem("image-cache", JSON.stringify(updatedCache));
      }
    } catch (error) {
      console.error("Error cleaning cache:", error);
    }
  };

  // Cargar caché inicial al crear el composable
  loadCacheFromStorage();

  return {
    imageCache,
    getImageUrl,
    preloadImages,
    cleanExpiredCache,
  };
}
