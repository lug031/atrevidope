// useImageCache.ts
import { ref } from "vue";
import { getUrl } from "aws-amplify/storage";

interface ImageCache {
  url: string;
  timestamp: number;
  version: string;
}

interface StoredCache {
  [key: string]: ImageCache;
}

export function useImageCache(cacheDuration = 24 * 60 * 60 * 1000) {
  const imageCache = ref<Record<string, string>>({});

  // Cargar caché inicial desde localStorage
  const loadCacheFromStorage = () => {
    try {
      const storedCache = localStorage.getItem("image-cache");
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache) as StoredCache;
        const now = Date.now();

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

  // Guardar caché en localStorage con versión
  const updateStorage = (productId: string, url: string, version: string) => {
    try {
      const storedCache = localStorage.getItem("image-cache");
      const cache: StoredCache = storedCache ? JSON.parse(storedCache) : {};

      cache[productId] = {
        url,
        timestamp: Date.now(),
        version,
      };

      localStorage.setItem("image-cache", JSON.stringify(cache));
    } catch (error) {
      console.error("Error updating image cache:", error);
    }
  };

  // Generar versión única para una URL de imagen
  const generateImageVersion = (imageUrl: string): string => {
    return `${imageUrl}-${Date.now()}`;
  };

  // Obtener la versión almacenada de una imagen
  const getStoredVersion = (productId: string): string | null => {
    try {
      const storedCache = localStorage.getItem("image-cache");
      if (storedCache) {
        const cache = JSON.parse(storedCache) as StoredCache;
        return cache[productId]?.version || null;
      }
    } catch (error) {
      console.error("Error getting stored version:", error);
    }
    return null;
  };

  // Función principal para obtener URLs de imágenes
  const getImageUrl = async (
    productId: string,
    imageUrl: string
  ): Promise<string> => {
    const currentVersion = generateImageVersion(imageUrl);
    const storedVersion = getStoredVersion(productId);

    // Si la versión almacenada es diferente o no existe, actualizar el caché
    if (storedVersion !== currentVersion || !imageCache.value[productId]) {
      try {
        const { url } = await getUrl({ path: imageUrl });
        const urlString = url.toString();

        imageCache.value[productId] = urlString;
        updateStorage(productId, urlString, currentVersion);

        return urlString;
      } catch (error) {
        console.error(`Error loading image for product ${productId}:`, error);
        return "/api/placeholder/40/40";
      }
    }

    return imageCache.value[productId];
  };

  // Precargar un conjunto de imágenes
  const preloadImages = async (
    products: Array<{ id: string; imageUrl: string }>
  ) => {
    const loadPromises = products.map((product) => {
      if (product.imageUrl) {
        return getImageUrl(product.id, product.imageUrl);
      }
      return Promise.resolve();
    });

    await Promise.all(loadPromises);
  };

  // Eliminar una imagen del caché
  const removeFromCache = (productId: string) => {
    try {
      // Eliminar de la memoria
      delete imageCache.value[productId];

      // Eliminar del localStorage
      const storedCache = localStorage.getItem("image-cache");
      if (storedCache) {
        const cache = JSON.parse(storedCache) as StoredCache;
        delete cache[productId];
        localStorage.setItem("image-cache", JSON.stringify(cache));
      }
    } catch (error) {
      console.error("Error removing from cache:", error);
    }
  };

  // Limpiar caché expirado y entradas huérfanas
  const cleanExpiredCache = (activeProductIds: string[]) => {
    try {
      const storedCache = localStorage.getItem("image-cache");
      if (storedCache) {
        const cache = JSON.parse(storedCache) as StoredCache;
        const now = Date.now();

        const updatedCache = Object.entries(cache).reduce<StoredCache>(
          (acc, [key, value]) => {
            // Mantener solo si no ha expirado y el producto sigue existiendo
            if (
              now - value.timestamp < cacheDuration &&
              activeProductIds.includes(key)
            ) {
              acc[key] = value;
            }
            return acc;
          },
          {}
        );

        localStorage.setItem("image-cache", JSON.stringify(updatedCache));

        // Actualizar el caché en memoria
        imageCache.value = Object.entries(updatedCache).reduce(
          (acc, [key, value]) => {
            acc[key] = value.url;
            return acc;
          },
          {} as Record<string, string>
        );
      }
    } catch (error) {
      console.error("Error cleaning cache:", error);
    }
  };

  // Verificar y actualizar una imagen específica
  const validateAndUpdateImage = async (
    productId: string,
    imageUrl: string
  ): Promise<void> => {
    if (!imageUrl) {
      removeFromCache(productId);
      return;
    }

    await getImageUrl(productId, imageUrl);
  };

  loadCacheFromStorage();

  return {
    imageCache,
    getImageUrl,
    preloadImages,
    cleanExpiredCache,
    removeFromCache,
    validateAndUpdateImage,
  };
}
