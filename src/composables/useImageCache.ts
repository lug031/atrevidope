// useImageCache.ts
import { ref, onUnmounted } from "vue";
import { getUrl } from "aws-amplify/storage";

interface ImageCache {
  url: string;
  timestamp: number;
  imageUrl: string;
}

interface LoadingState {
  [key: string]: Promise<string>;
}

export function useImageCache(cacheDuration = 24 * 60 * 60 * 1000) {
  const imageCache = ref<Record<string, string>>({});
  const memoryCache = ref<Record<string, ImageCache>>({});
  const loadingPromises = ref<LoadingState>({});

  // Placeholder por defecto
  const defaultPlaceholder = "/api/placeholder/800/500";

  // Función principal para obtener URLs de imágenes
  const getImageUrl = async (
    productId: string,
    imageUrl: string
  ): Promise<string> => {
    if (!imageUrl) {
      return defaultPlaceholder;
    }

    // Si ya está en caché y no ha expirado, retornarlo
    const cached = memoryCache.value[productId];
    if (cached) {
      const now = Date.now();
      if (
        now - cached.timestamp < cacheDuration &&
        cached.imageUrl === imageUrl
      ) {
        imageCache.value[productId] = cached.url;
        return cached.url;
      }
    }

    // Si ya está cargando, retornar la promesa existente
    if (productId in loadingPromises.value) {
      return loadingPromises.value[productId];
    }

    // Crear nueva promesa de carga
    const loadingPromise = (async () => {
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

        // Limpiar promesa de carga
        delete loadingPromises.value[productId];

        return urlString;
      } catch (error) {
        console.error(`Error loading image for product ${productId}:`, error);

        // Limpiar promesa de carga incluso en error
        delete loadingPromises.value[productId];

        // Cachear el placeholder para evitar intentos repetidos
        const placeholderUrl = defaultPlaceholder;
        imageCache.value[productId] = placeholderUrl;
        memoryCache.value[productId] = {
          url: placeholderUrl,
          timestamp: Date.now(),
          imageUrl: imageUrl,
        };

        return placeholderUrl;
      }
    })();

    // Guardar promesa de carga
    loadingPromises.value[productId] = loadingPromise;

    return loadingPromise;
  };

  // Precargar un conjunto de imágenes con control de concurrencia
  const preloadImages = async (
    products: Array<{ id: string; imageUrl: string }>
  ) => {
    const maxConcurrency = 3; // Reducir concurrencia para evitar sobrecarga
    const queue = [...products];
    const active: Promise<void>[] = [];

    const processNext = async (): Promise<void> => {
      if (queue.length === 0) return;

      const product = queue.shift()!;

      if (product.imageUrl && !imageCache.value[product.id]) {
        try {
          await getImageUrl(product.id, product.imageUrl);
        } catch (error) {
          // Error ya manejado en getImageUrl
        }
      }

      // Procesar siguiente si hay más en la cola
      if (queue.length > 0) {
        return processNext();
      }
    };

    // Iniciar procesamiento concurrente
    while (active.length < maxConcurrency && queue.length > 0) {
      const promise = processNext();
      active.push(promise);
    }

    // Esperar a que terminen todas las promesas activas
    await Promise.all(active);
  };

  // Precargar una imagen específica de forma no bloqueante
  const preloadImage = (productId: string, imageUrl: string) => {
    if (
      imageUrl &&
      !imageCache.value[productId] &&
      !loadingPromises.value[productId]
    ) {
      // Usar requestIdleCallback para no bloquear el hilo principal
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => {
          getImageUrl(productId, imageUrl).catch(console.error);
        });
      } else {
        // Fallback para navegadores que no soportan requestIdleCallback
        setTimeout(() => {
          getImageUrl(productId, imageUrl).catch(console.error);
        }, 0);
      }
    }
  };

  // Eliminar una imagen del caché
  const removeFromCache = (productId: string) => {
    delete imageCache.value[productId];
    delete memoryCache.value[productId];
    delete loadingPromises.value[productId];
  };

  // Limpiar caché expirado de forma más eficiente
  const cleanExpiredCache = (activeProductIds: string[]) => {
    const now = Date.now();
    const activeSet = new Set(activeProductIds);

    // Limpiar memoria cache
    Object.keys(memoryCache.value).forEach((productId) => {
      const cached = memoryCache.value[productId];
      if (
        now - cached.timestamp >= cacheDuration ||
        !activeSet.has(productId)
      ) {
        removeFromCache(productId);
      }
    });

    // Limpiar promesas de carga huérfanas
    Object.keys(loadingPromises.value).forEach((productId) => {
      if (!activeSet.has(productId)) {
        delete loadingPromises.value[productId];
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

    const cached = memoryCache.value[productId];
    if (cached && cached.imageUrl !== imageUrl) {
      // La URL cambió, necesitamos recargar
      removeFromCache(productId);
      await getImageUrl(productId, imageUrl);
    } else if (!cached) {
      // No existe en caché, cargar
      await getImageUrl(productId, imageUrl);
    }
  };

  // Obtener imagen desde caché con mejor fallback
  const getCachedImage = (productId: string): string => {
    const cached = imageCache.value[productId];
    if (cached && cached !== defaultPlaceholder) {
      return cached;
    }

    // Si no está en caché, retornar placeholder pero iniciar carga en background
    const memCached = memoryCache.value[productId];
    if (memCached && memCached.imageUrl && !loadingPromises.value[productId]) {
      preloadImage(productId, memCached.imageUrl);
    }

    return cached || defaultPlaceholder;
  };

  // Función para limpiar recursos al desmontar
  const cleanup = () => {
    // Cancelar todas las promesas pendientes
    Object.keys(loadingPromises.value).forEach((productId) => {
      delete loadingPromises.value[productId];
    });

    // Limpiar caches
    imageCache.value = {};
    memoryCache.value = {};
  };

  // Función para obtener estadísticas del caché (útil para debug)
  const getCacheStats = () => {
    return {
      totalCached: Object.keys(imageCache.value).length,
      memorySize: Object.keys(memoryCache.value).length,
      loadingCount: Object.keys(loadingPromises.value).length,
      cacheHitRatio:
        Object.keys(imageCache.value).length /
        Math.max(Object.keys(memoryCache.value).length, 1),
    };
  };

  // Función para precarga inteligente basada en viewport
  const preloadImagesInViewport = (
    products: Array<{ id: string; imageUrl: string }>,
    viewportBuffer: number = 200
  ) => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback para navegadores sin soporte
      return preloadImages(products.slice(0, 10));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const productId = entry.target.getAttribute("data-product-id");
            const product = products.find((p) => p.id === productId);

            if (product && product.imageUrl) {
              preloadImage(product.id, product.imageUrl);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: `${viewportBuffer}px`,
        threshold: 0.1,
      }
    );

    return observer;
  };

  // Auto-limpieza periódica (opcional)
  const startPeriodicCleanup = (intervalMs: number = 5 * 60 * 1000) => {
    const interval = setInterval(() => {
      const activeIds = Object.keys(imageCache.value);
      cleanExpiredCache(activeIds);
    }, intervalMs);

    return () => clearInterval(interval);
  };

  // Limpiar al desmontar el componente
  onUnmounted(() => {
    cleanup();
  });

  return {
    imageCache,
    getImageUrl,
    preloadImages,
    preloadImage,
    cleanExpiredCache,
    removeFromCache,
    validateAndUpdateImage,
    getCachedImage,
    cleanup,
    getCacheStats,
    preloadImagesInViewport,
    startPeriodicCleanup,
  };
}
