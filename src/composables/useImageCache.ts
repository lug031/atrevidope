// useImageCache.ts
import { ref } from "vue";
import { getUrl } from "aws-amplify/storage";

interface ImageCache {
  url: string;
  timestamp: number;
  imageUrl: string;
}

export function useImageCache(cacheDuration = 24 * 60 * 60 * 1000) {
  const imageCache = ref<Record<string, string>>({});
  const memoryCache = ref<Record<string, ImageCache>>({});

  // Función principal para obtener URLs de imágenes
  const getImageUrl = async (
    productId: string,
    imageUrl: string
  ): Promise<string> => {
    // Si ya está en caché y no ha expirado, retornarlo
    const cached = memoryCache.value[productId];
    if (cached) {
      const now = Date.now();
      // Verificar si no ha expirado y la URL es la misma
      if (
        now - cached.timestamp < cacheDuration &&
        cached.imageUrl === imageUrl
      ) {
        imageCache.value[productId] = cached.url;
        return cached.url;
      }
    }

    // Si no está en caché o ha expirado, obtener nueva URL
    try {
      const { url } = await getUrl({ path: imageUrl });
      const urlString = url.toString();

      // Actualizar ambos caches
      imageCache.value[productId] = urlString;
      memoryCache.value[productId] = {
        url: urlString,
        timestamp: Date.now(),
        imageUrl: imageUrl,
      };

      return urlString;
    } catch (error) {
      console.error(`Error loading image for product ${productId}:`, error);
      return "/api/placeholder/800/500";
    }
  };

  // Precargar un conjunto de imágenes en paralelo (pero limitado)
  const preloadImages = async (
    products: Array<{ id: string; imageUrl: string }>
  ) => {
    // Procesar en lotes para evitar sobrecarga
    const batchSize = 5;
    const batches = [];

    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const loadPromises = batch.map((product) => {
        if (product.imageUrl) {
          return getImageUrl(product.id, product.imageUrl);
        }
        return Promise.resolve();
      });

      await Promise.all(loadPromises);
    }
  };

  // Precargar una imagen específica sin esperar
  const preloadImage = (productId: string, imageUrl: string) => {
    if (imageUrl && !imageCache.value[productId]) {
      getImageUrl(productId, imageUrl).catch(console.error);
    }
  };

  // Eliminar una imagen del caché
  const removeFromCache = (productId: string) => {
    delete imageCache.value[productId];
    delete memoryCache.value[productId];
  };

  // Limpiar caché expirado
  const cleanExpiredCache = (activeProductIds: string[]) => {
    const now = Date.now();

    Object.keys(memoryCache.value).forEach((productId) => {
      const cached = memoryCache.value[productId];

      // Eliminar si ha expirado o el producto ya no existe
      if (
        now - cached.timestamp >= cacheDuration ||
        !activeProductIds.includes(productId)
      ) {
        removeFromCache(productId);
      }
    });
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

  // Obtener imagen desde caché o placeholder
  const getCachedImage = (productId: string): string => {
    return imageCache.value[productId] || "/api/placeholder/800/500";
  };

  return {
    imageCache,
    getImageUrl,
    preloadImages,
    preloadImage,
    cleanExpiredCache,
    removeFromCache,
    validateAndUpdateImage,
    getCachedImage,
  };
}
