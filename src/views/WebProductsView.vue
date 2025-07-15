<template>
  <MainLayout>
    <div class="promotional-products">
      <!-- Updated Header Banner -->
      <div class="hero-banner-section">
        <router-link to="/promotions" class="hero-banner">
          <img src="/hero-banner.png" alt="Promociones" class="hero-image" />
          <div class="hero-overlay">
            <h1>PROMOCIONES</h1>
            <button class="discover-btn">Descubrir</button>
          </div>
        </router-link>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-container">
          <label>Ordenar por:</label>
          <select v-model="sortBy" class="sort-select">
            <option value="position">Posición</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name">Nombre</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="loading" class="loading-state">
        <span class="loader"></span>
      </div>

      <div v-else-if="error" class="error-state">
        Lo sentimos, ha ocurrido un error al cargar los productos.
      </div>

      <div v-else class="products-grid">
        <div v-for="product in processedProducts" :key="product.id" class="product-card">
          <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" class="product-content">
            <!-- Badge de promoción optimizado -->
            <div v-if="product.hasUpcomingPromotion" class="promotion-badge">
              <span class="promotion-date">Próximamente en promoción</span>
              <span class="promotion-discount">-{{ product.discountPercentage || 0 }}%</span>
              <span class="promotion-start">{{ product.formattedPromotionDate }}</span>
            </div>

            <div class="product-image">
              <img :src="product.imageUrl" :alt="product.name" loading="lazy" @error="handleImageError"
                class="product-img" />
            </div>

            <div class="product-info">
              <h3 class="brand-name">{{ product.brand }}</h3>
              <p class="product-name">{{ product.name }}</p>

              <!-- Descripción pre-procesada -->
              <div class="formatted-description" v-html="product.processedDescription" />

              <!-- Precios optimizados -->
              <div class="price-info" :class="product.priceClasses">
                <p class="product-price" v-html="product.priceDisplay"></p>
              </div>

              <!-- Stock Status optimizado -->
              <div class="stock-status" :class="product.stockClasses">
                <span>{{ product.stockMessage }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <div v-if="!loading && !error && productsWeb.length === 0" class="empty-state">
        No hay productos disponibles.
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useProducts } from '@/composables/useProducts';
import { useCartStore } from '@/stores/cart';
import { useToast } from '../composables/useToast';
import type { Product } from '@/types/product.types';
import { useImageCache } from '@/composables/useImageCache';

// Composables
const { imageCache, getImageUrl, preloadImages, getCachedImage } = useImageCache();
const { productsWeb, loadProductsWeb } = useProducts();
const cartStore = useCartStore();
const { showToast } = useToast();

// Reactive state
const sortBy = ref('position');
const loading = ref(true);
const error = ref<string | null>(null);

// Memoización de funciones pesadas
const memoizedCache = new Map();

const memoize = (fn: Function, key: string) => {
  return (...args: any[]) => {
    const cacheKey = `${key}_${JSON.stringify(args)}`;
    if (memoizedCache.has(cacheKey)) {
      return memoizedCache.get(cacheKey);
    }
    const result = fn(...args);
    memoizedCache.set(cacheKey, result);
    return result;
  };
};

// Funciones optimizadas con memoización
const truncateText = memoize((text: string, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  let truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    truncated = truncated.slice(0, lastSpace);
  }

  const boldCount = (truncated.match(/\*\*/g) || []).length;
  const italicCount = (truncated.match(/\*/g) || []).length;

  if (boldCount % 2 !== 0) {
    truncated = truncated.replace(/\*\*[^*]*$/, '');
  }
  if ((italicCount - boldCount * 2) % 2 !== 0) {
    truncated = truncated.replace(/\*[^*]*$/, '');
  }

  return truncated + '...';
}, 'truncateText');

const parseMarkdown = memoize((text: string): string => {
  if (!text) return '';

  return text
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\s*[-+*]\s+(.*)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+?)(?:<br>|$)/gm, (_, text) => {
      if (!/^<[h|p|ul|ol|li]/.test(text)) {
        return `<p>${text}</p>`;
      }
      return text;
    });
}, 'parseMarkdown');

// Funciones de fecha optimizadas
const getCurrentPeruDate = memoize((): string => {
  const date = new Date();
  const peruDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));
  const year = peruDate.getFullYear();
  const month = String(peruDate.getMonth() + 1).padStart(2, '0');
  const day = String(peruDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}, 'getCurrentPeruDate');

const formatPromotionDate = memoize((dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long'
  }).format(date);
}, 'formatPromotionDate');

// Funciones de promoción optimizadas
const hasUpcomingPromotion = (product: Product): boolean => {
  if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
    return false;
  }
  const currentDate = getCurrentPeruDate();
  if (currentDate >= product.promotionStartDate && currentDate <= product.promotionEndDate) {
    return false;
  }
  return product.promotionStartDate > currentDate;
};

const hasExpiredPromotion = (product: Product): boolean => {
  if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
    return false;
  }
  const currentDate = getCurrentPeruDate();
  return currentDate > product.promotionEndDate;
};

const isActivePromotion = (product: Product): boolean => {
  if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
    return false;
  }
  const currentDate = getCurrentPeruDate();
  return currentDate >= product.promotionStartDate && currentDate <= product.promotionEndDate;
};

// Computed principal con productos pre-procesados
const processedProducts = computed(() => {
  if (!productsWeb.value) return [];

  const productsToShow = productsWeb.value.filter(product => {
    if (!product.isPromoted) return true;
    if (!product.promotionStartDate || !product.promotionEndDate) return true;

    const currentDate = getCurrentPeruDate();
    if (currentDate >= product.promotionStartDate && currentDate <= product.promotionEndDate) {
      return false;
    }
    return true;
  });

  // Pre-procesar todos los productos
  const processed = productsToShow.map(product => {
    const hasUpcoming = hasUpcomingPromotion(product);
    const hasExpired = hasExpiredPromotion(product);
    const isActive = isActivePromotion(product);

    // Pre-procesar descripción
    const processedDescription = parseMarkdown(truncateText(product.description, 100));

    // Pre-procesar imagen
    const imageUrl = getCachedImage(product.id);

    // Pre-procesar precio
    let priceDisplay = '';
    if (hasUpcoming || hasExpired) {
      priceDisplay = `<span class="current-price">S/${product.originalPrice?.toFixed(2) || '0.00'}</span>`;
    } else if (isActive) {
      priceDisplay = `<span class="promotion-price">S/${product.price?.toFixed(2) || '0.00'}</span>
                      <span class="original-price">S/${product.originalPrice?.toFixed(2) || '0.00'}</span>`;
    } else {
      priceDisplay = `<span class="current-price">S/${product.price?.toFixed(2) || '0.00'}</span>`;
    }

    // Pre-procesar clases
    const priceClasses = {
      'has-promotion': hasUpcoming,
      'expired-promotion': hasExpired
    };

    const stockClasses = {
      'out-of-stock': product.stock === 0,
      'low-stock': product.stock > 0 && product.stock <= 5
    };

    // Pre-procesar mensaje de stock
    let stockMessage = '';
    if (product.stock === 0) {
      stockMessage = 'Agotado';
    } else if (product.stock <= 5) {
      stockMessage = `¡Últimas ${product.stock} unidades!`;
    } else {
      stockMessage = 'Stock disponible';
    }

    // Pre-procesar precio efectivo para ordenamiento
    let effectivePrice = 0;
    if (isActive) {
      effectivePrice = product.price || 0;
    } else if (hasUpcoming || hasExpired) {
      effectivePrice = product.originalPrice || 0;
    } else {
      effectivePrice = product.price || 0;
    }

    return {
      ...product,
      hasUpcomingPromotion: hasUpcoming,
      hasExpiredPromotion: hasExpired,
      isActivePromotion: isActive,
      processedDescription,
      imageUrl,
      priceDisplay,
      priceClasses,
      stockClasses,
      stockMessage,
      effectivePrice,
      formattedPromotionDate: hasUpcoming ? formatPromotionDate(product.promotionStartDate) : ''
    };
  });

  // Ordenar productos procesados
  return processed.sort((a, b) => {
    switch (sortBy.value) {
      case 'price-asc':
        return a.effectivePrice - b.effectivePrice;
      case 'price-desc':
        return b.effectivePrice - a.effectivePrice;
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default:
        if (a.hasUpcomingPromotion && !b.hasUpcomingPromotion) return -1;
        if (!a.hasUpcomingPromotion && b.hasUpcomingPromotion) return 1;
        return 0;
    }
  });
});

// Función para manejar errores de imagen
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/api/placeholder/800/500';
};

// Función para cargar imágenes de forma eficiente
const loadImageUrls = async () => {
  if (!productsWeb.value) return;

  // Precargar imágenes en background
  const schedulePreload = () => {
    preloadImages(
      productsWeb.value.map(product => ({
        id: product.id,
        imageUrl: product.imageUrl || ''
      }))
    );
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(schedulePreload);
  } else {
    setTimeout(schedulePreload, 100);
  }
};

// Función principal de carga
const loadProductsWebMounted = async () => {
  loading.value = true;
  error.value = null;

  try {
    await loadProductsWeb();
  } catch (err) {
    error.value = 'Hubo un error al cargar los productos.';
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  loadProductsWebMounted();
});

watch(() => productsWeb.value, loadImageUrls, { immediate: true });

// Limpiar caché al desmontar
onUnmounted(() => {
  memoizedCache.clear();
});
</script>

<style scoped>
.promotional-products {
  padding: 0 20px;
}

.formatted-description {
  line-height: 1.6;
  color: #374151;
}

.formatted-description h1,
.formatted-description h2,
.formatted-description h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.formatted-description h1 {
  font-size: 1.5em;
}

.formatted-description h2 {
  font-size: 1.25em;
}

.formatted-description h3 {
  font-size: 1.125em;
}

.formatted-description p {
  margin-bottom: 1em;
}

.formatted-description ul {
  margin: 1em 0;
  padding-left: 1.5em;
  list-style-type: disc;
}

.formatted-description li {
  margin-bottom: 0.5em;
}

.formatted-description a {
  color: #3b82f6;
  text-decoration: underline;
}

.formatted-description a:hover {
  color: #2563eb;
}

.formatted-description strong {
  font-weight: 600;
}

.formatted-description em {
  font-style: italic;
}

.hero-banner-section {
  margin-bottom: 30px;
}

.promotion-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #000;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 10;
}

.promotion-date {
  font-size: 0.75rem;
  font-weight: 500;
}

.promotion-discount {
  font-size: 1rem;
  font-weight: bold;
}

.promotion-start {
  font-size: 0.75rem;
  color: #ffd700;
}

.price-info.has-promotion {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-banner {
  position: relative;
  display: block;
  width: 100%;
  height: 200px;
  overflow: hidden;
  text-decoration: none;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hero-banner:hover .hero-image {
  transform: scale(1.05);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.hero-overlay h1 {
  color: white;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.discover-btn {
  background: white;
  color: black;
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.discover-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  background: #f0f0f0;
}

@media (max-width: 768px) {
  .hero-overlay h1 {
    font-size: 2rem;
  }

  .discover-btn {
    padding: 10px 25px;
    font-size: 1rem;
  }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f9fafb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 1.1rem;
}

.filter-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
  padding: 0 20px;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 20px;
}

.product-card {
  background: white;
  border: 1px solid #eee;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px;
  /* Optimización para scroll */
  contain: layout style paint;
  will-change: transform;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-content {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.product-image {
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  margin-bottom: 15px;
  overflow: hidden;
  border-radius: 4px;
  /* Optimización para imágenes */
  contain: layout;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
  /* Optimización para scroll */
  will-change: transform;
}

.product-content:hover .product-img {
  transform: scale(1.05);
}

.brand-name {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.product-name {
  font-size: 1.1rem;
  margin: 5px 0;
}

.product-price {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 10px 0;
}

.current-price {
  color: #333;
}

.promotion-price {
  color: #e53e3e;
  font-weight: bold;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 0.9em;
  margin-left: 8px;
}

.stock-status {
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin: 10px 0;
  background-color: #e8f5e9;
  color: #2e7d32;
}

.stock-status.low-stock {
  background-color: #fff3e0;
  color: #ef6c00;
}

.stock-status.out-of-stock {
  background-color: #ffebee;
  color: #c62828;
}

.loading-state {
  text-align: center;
  padding: 50px;
}

.error-state {
  text-align: center;
  color: red;
  padding: 50px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #000;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Optimizaciones adicionales para scroll */
.products-grid {
  /* Activar aceleración por hardware */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.product-card {
  /* Optimizar para repaint */
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style>