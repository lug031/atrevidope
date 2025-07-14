<template>
    <MainLayout>
        <div class="category-products">
            <!-- Header Section -->
            <div class="category-header">
                <h1 class="category-title">{{ $route.query.name || 'Productos' }}</h1>
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

            <div v-else-if="processedProducts.length === 0" class="empty-state">
                No hay productos disponibles en esta categoría.
            </div>

            <div v-else class="products-grid">
                <div v-for="product in processedProducts" :key="product.id" class="product-card">
                    <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" class="product-content">
                        <!-- Badge de promoción futura optimizado -->
                        <div v-if="product.hasUpcomingPromotion" class="promotion-badge">
                            <span class="promotion-date">Próximamente en promoción</span>
                            <span class="promotion-discount">{{ product.formattedDiscountBadge }}</span>
                            <span class="promotion-start">{{ product.formattedPromotionDate }}</span>
                        </div>

                        <!-- Badge de promoción activa optimizado -->
                        <div v-if="product.hasActivePromotion" class="active-promotion-badge"
                            :class="{ 'one-day-promotion': product.isOneDayPromotion }">
                            <span class="promotion-text">{{ product.promotionText }}</span>
                            <span class="promotion-discount">{{ product.formattedDiscountBadge }}</span>
                            <span class="promotion-end" v-if="product.promotionEndText">
                                {{ product.promotionEndText }}
                            </span>
                        </div>

                        <div class="product-image">
                            <img :src="product.optimizedImageUrl" :alt="product.name" loading="lazy"
                                @error="handleImageError" class="product-img" />
                        </div>

                        <div class="product-info">
                            <h3 class="brand-name">{{ product.brand }}</h3>
                            <p class="product-name">{{ product.name }}</p>
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
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { useProducts } from '@/composables/useProducts';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/composables/useToast';
import type { Product } from '@/types/product.types';
import { useImageCache } from '@/composables/useImageCache';

// Composables
const { imageCache, getImageUrl, preloadImages, getCachedImage } = useImageCache();
const router = useRouter();
const route = useRoute();
const { productsByCategory, loadProductsByCategory } = useProducts();
const cartStore = useCartStore();
const { showToast } = useToast();

// Reactive state
const sortBy = ref('position');
const loading = ref(true);
const error = ref<string | null>(null);

// Memoización para funciones pesadas
const memoCache = new Map<string, any>();

const memoize = <T extends (...args: any[]) => any>(fn: T, keyPrefix: string): T => {
    return ((...args: any[]) => {
        const key = `${keyPrefix}_${JSON.stringify(args)}`;
        if (memoCache.has(key)) {
            return memoCache.get(key);
        }
        const result = fn(...args);
        memoCache.set(key, result);
        return result;
    }) as T;
};

// Funciones memoizadas
const truncateText = memoize((text: string, maxLength: number = 100): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    let truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
        truncated = truncated.slice(0, lastSpace);
    }

    // Validar markdown
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

const formatDiscountBadge = memoize((discountPercentage: number | undefined, promotionType: string | undefined): string => {
    if (!discountPercentage) return '';

    if (promotionType === 'fixed') {
        return `-S/${discountPercentage.toFixed(2)}`;
    } else {
        return `-${discountPercentage}%`;
    }
}, 'formatDiscountBadge');

// Funciones de promoción
const isOneDayPromotion = (product: Product): boolean => {
    if (!product.promotionStartDate || !product.promotionEndDate) {
        return false;
    }
    return product.promotionStartDate === product.promotionEndDate;
};

const hasActivePromotion = (product: Product): boolean => {
    if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
        return false;
    }
    const currentDate = getCurrentPeruDate();
    return currentDate >= product.promotionStartDate && currentDate <= product.promotionEndDate;
};

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

const calculateDiscountedPrice = (product: Product): number => {
    if (!product.originalPrice || !product.discountPercentage) {
        return product.originalPrice || 0;
    }

    if (product.promotionType === 'fixed') {
        return Math.max(0, product.originalPrice - product.discountPercentage);
    } else {
        const discountMultiplier = 1 - (product.discountPercentage / 100);
        return product.originalPrice * discountMultiplier;
    }
};

// Computed principal con productos pre-procesados
const processedProducts = computed(() => {
    if (!productsByCategory.value?.length) return [];

    const processed = productsByCategory.value.map(product => {
        const hasActive = hasActivePromotion(product);
        const hasUpcoming = hasUpcomingPromotion(product);
        const hasExpired = hasExpiredPromotion(product);
        const isOneDay = isOneDayPromotion(product);

        // Pre-procesar imagen
        const optimizedImageUrl = getCachedImage(product.id);

        // Pre-procesar descripción
        const processedDescription = parseMarkdown(truncateText(product.description, 100));

        // Pre-procesar badge de descuento
        const formattedDiscountBadge = formatDiscountBadge(product.discountPercentage, product.promotionType);

        // Pre-procesar texto de promoción
        const promotionText = isOneDay ? '¡SOLO POR HOY!' : '¡EN PROMOCIÓN!';

        // Pre-procesar fecha de promoción
        const formattedPromotionDate = hasUpcoming ? formatPromotionDate(product.promotionStartDate) : '';
        const promotionEndText = hasActive && !isOneDay ? `Hasta ${formatPromotionDate(product.promotionEndDate)}` : '';

        // Pre-procesar precio
        let priceDisplay = '';
        if (hasActive) {
            const discountedPrice = calculateDiscountedPrice(product).toFixed(2);
            priceDisplay = `<span class="original-price" style="font-size: 0.9rem; color: #666; text-decoration: line-through; margin-right: 6px;">S/${product.originalPrice?.toFixed(2) || '0.00'}</span>
                           <span class="discounted-price" style="font-size: 1.2rem; font-weight: bold; color: #000;">S/${discountedPrice}</span>`;
        } else if (hasUpcoming || hasExpired) {
            priceDisplay = `<span class="current-price" style="font-size: 1.2rem; font-weight: bold; color: #1a1a1a;">S/${product.originalPrice?.toFixed(2) || '0.00'}</span>`;
        } else {
            priceDisplay = `<span class="current-price" style="font-size: 1.2rem; font-weight: bold; color: #1a1a1a;">S/${product.price?.toFixed(2) || '0.00'}</span>`;
        }

        // Pre-procesar clases
        const priceClasses = {
            'has-promotion': hasUpcoming,
            'has-active-promotion': hasActive,
            'has-expired-promotion': hasExpired
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
        if (hasActive) {
            effectivePrice = calculateDiscountedPrice(product);
        } else if (hasUpcoming || hasExpired) {
            effectivePrice = product.originalPrice || 0;
        } else {
            effectivePrice = product.price || 0;
        }

        return {
            ...product,
            // Estados de promoción
            hasActivePromotion: hasActive,
            hasUpcomingPromotion: hasUpcoming,
            hasExpiredPromotion: hasExpired,
            isOneDayPromotion: isOneDay,
            // Propiedades optimizadas
            optimizedImageUrl,
            processedDescription,
            formattedDiscountBadge,
            promotionText,
            formattedPromotionDate,
            promotionEndText,
            priceDisplay,
            priceClasses,
            stockClasses,
            stockMessage,
            effectivePrice
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
    if (!productsByCategory.value?.length) return;

    // Precargar imágenes en background
    const schedulePreload = () => {
        preloadImages(
            productsByCategory.value.map(product => ({
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
const loadCategoryProducts = async () => {
    const categoryId = route.params.categoryId as string;
    if (!categoryId) {
        router.push('/');
        return;
    }

    try {
        await loadProductsByCategory(categoryId);
    } catch (err) {
        console.error('Error al cargar productos de categoría:', err);
        throw err;
    }
};

const loadCategoryProductsMounted = async () => {
    loading.value = true;
    error.value = null;

    try {
        await loadCategoryProducts();
    } catch (err) {
        error.value = 'Hubo un error al cargar productos de la categoría.';
    } finally {
        loading.value = false;
    }
};

// Lifecycle hooks
onMounted(() => {
    loadCategoryProductsMounted();
});

watch(
    () => route.params.categoryId,
    (newCategoryId) => {
        if (newCategoryId) {
            loadCategoryProductsMounted();
        }
    }
);

watch(
    () => productsByCategory.value,
    loadImageUrls,
    { immediate: true }
);

// Limpiar caché al desmontar
onUnmounted(() => {
    memoCache.clear();
});
</script>

<style scoped>
.category-products {
    padding: 0 20px;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    background-color: #f9fafb;
    border-radius: 8px;
    color: #6b7280;
    font-size: 1.1rem;
}

.category-header {
    background: linear-gradient(to right, #1a1a1a, #2d2d2d);
    padding: 2.5rem 0;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
}

.category-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, #b6b6b6, #505050);
}

.category-title {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    color: white;
    font-size: 2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.formatted-description {
    line-height: 1.6;
    color: #374151;
    font-size: 0.9rem;
    margin: 5px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.formatted-description :deep(h1),
.formatted-description :deep(h2),
.formatted-description :deep(h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
}

.formatted-description :deep(p) {
    margin: 0;
    display: inline;
}

.formatted-description :deep(strong) {
    font-weight: 600;
    color: #444;
}

.formatted-description :deep(em) {
    font-style: italic;
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

.active-promotion-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #000000;
    color: #fff;
    padding: 8px 12px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    z-index: 10;
}

.active-promotion-badge .promotion-text {
    font-size: 0.75rem;
    font-weight: 500;
}

.active-promotion-badge .promotion-discount {
    font-size: 1rem;
    font-weight: bold;
}

.active-promotion-badge .promotion-end {
    font-size: 0.75rem;
    color: #ffd700;
}

.price-info.has-active-promotion {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.price-info .original-price {
    font-size: 0.9rem;
    color: #666;
    text-decoration: line-through;
    margin-right: 6px;
}

.price-info.has-expired-promotion {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.price-info.has-expired-promotion .current-price {
    font-size: 1.2rem;
    font-weight: bold;
}

.price-info .discounted-price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #000;
}

.active-promotion-badge.one-day-promotion {
    background-color: #0a0a0a;
    box-shadow: 0 2px 8px rgba(76, 76, 76, 0.4);
}

.one-day-promotion .promotion-text {
    font-weight: 800;
    letter-spacing: 0.5px;
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
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background-color: white;
    color: #1a1a1a;
    font-size: 0.9rem;
    transition: all 0.2s;
    cursor: pointer;
}

.sort-select:hover {
    border-color: #cbd5e1;
}

.sort-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
    padding: 20px;
    /* Optimizaciones para scroll */
    transform: translateZ(0);
    backface-visibility: hidden;
    contain: layout style paint;
}

.product-card {
    background: white;
    border: 1px solid #eee;
    padding: 20px;
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
    border-radius: 8px;
    /* Optimizaciones para rendimiento */
    contain: layout style paint;
    will-change: transform;
    backface-visibility: hidden;
    transform: translateZ(0);
}

.product-card:hover {
    transform: translateY(-5px) translateZ(0);
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
    color: #1a1a1a;
    font-weight: 500;
}

.product-price {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 10px 0;
    color: #1a1a1a;
}

.current-price {
    color: #333;
}

.stock-status {
    text-align: center;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    margin: 10px 0;
    background-color: #e8f5e9;
    color: #2e7d32;
    font-weight: 500;
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
    color: #ef4444;
    padding: 50px;
    background-color: #fee2e2;
    border-radius: 8px;
    margin: 20px;
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

/* Responsive */
@media (max-width: 768px) {
    .category-title {
        font-size: 1.5rem;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
        padding: 15px;
    }

    .product-card {
        padding: 15px;
    }

    .filter-section {
        padding: 0 15px;
    }

    .sort-select {
        padding: 6px 10px;
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .category-products {
        padding: 0 10px;
    }

    .category-header {
        padding: 2rem 0;
    }

    .products-grid {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 10px;
    }
}
</style>