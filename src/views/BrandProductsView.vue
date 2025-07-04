<template>
    <MainLayout>
        <!-- Loading state for the entire component -->
        <div v-if="loading" class="loading-state">
            <span class="loader"></span>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-state">
            {{ error }}
        </div>

        <!-- Content when data is loaded and brand is active -->
        <div v-else-if="currentBrand && currentBrand.active" class="brand-products">
            <!-- Header Section -->
            <div class="brand-header">
                <div class="brand-header-content">
                    <div v-if="currentBrand && currentBrand.logo" class="brand-logo">
                        <img :src="brandLogoUrl" :alt="currentBrand.name" />
                    </div>

                    <h1 class="brand-title">
                        <template v-if="loadingBrandName">
                            <span class="brand-title-loader">
                                <span class="dot"></span>
                                <span class="dot"></span>
                                <span class="dot"></span>
                            </span>
                        </template>
                        <template v-else>
                            {{ currentBrand?.name || 'Productos' }}
                        </template>
                    </h1>
                </div>
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
            <div v-if="sortedProducts.length === 0" class="empty-state">
                No hay productos disponibles de esta marca.
            </div>

            <div v-else class="products-grid">
                <div v-for="product in sortedProducts" :key="product.id" class="product-card">
                    <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" class="product-content">
                        <!-- Badge de promoción futura - Modificado para mostrar el tipo de descuento -->
                        <div v-if="hasUpcomingPromotion(product) && product.promotionStartDate" class="promotion-badge">
                            <span class="promotion-date">Próximamente en promoción</span>
                            <span class="promotion-discount">{{ formatDiscountBadge(product) }}</span>
                            <span class="promotion-start">{{ formatPromotionDate(product.promotionStartDate) }}</span>
                        </div>

                        <!-- Badge de promoción activa - Modificado para mostrar el tipo de descuento -->
                        <div v-if="hasActivePromotion(product)" class="active-promotion-badge"
                            :class="{ 'one-day-promotion': isOneDayPromotion(product) }">
                            <span class="promotion-text" v-if="isOneDayPromotion(product)">¡SOLO POR HOY!</span>
                            <span class="promotion-text" v-else>¡EN PROMOCIÓN!</span>
                            <span class="promotion-discount">{{ formatDiscountBadge(product) }}</span>
                            <span class="promotion-end" v-if="!isOneDayPromotion(product)">
                                Hasta {{ formatPromotionDate(product.promotionEndDate) }}
                            </span>
                        </div>

                        <div class="product-image">
                            <img :src="imageCache[product.id] || '/api/placeholder/40/40'" :alt="product.name"
                                loading="lazy" />
                        </div>

                        <div class="product-info">
                            <h3 class="brand-name">{{ product.brand }}</h3>
                            <p class="product-name">{{ product.name }}</p>
                            <div class="formatted-description"
                                v-html="parseMarkdown(truncateText(product.description, 100))" />

                            <!-- Precios -->
                            <div class="price-info" :class="{
                                'has-promotion': hasUpcomingPromotion(product),
                                'has-active-promotion': hasActivePromotion(product),
                                'has-expired-promotion': hasExpiredPromotion(product)
                            }">
                                <p class="product-price">
                                    <template v-if="hasActivePromotion(product)">
                                        <span class="original-price">S/{{ product.originalPrice.toFixed(2) }}</span>
                                        <span class="discounted-price">S/{{ calculateDiscountedPrice(product) }}</span>
                                    </template>
                                    <template v-else-if="hasUpcomingPromotion(product) || hasExpiredPromotion(product)">
                                        <span class="current-price">S/{{ product.originalPrice.toFixed(2) }}</span>
                                    </template>
                                    <template v-else>
                                        <span class="current-price">S/{{ product.price.toFixed(2) }}</span>
                                    </template>
                                </p>
                            </div>

                            <!-- Stock Status -->
                            <div class="stock-status" :class="{
                                'out-of-stock': product.stock === 0,
                                'low-stock': product.stock > 0 && product.stock <= 5
                            }">
                                <span v-if="product.stock === 0">Agotado</span>
                                <span v-else-if="product.stock <= 5">¡Últimas {{ product.stock }} unidades!</span>
                                <span v-else>Stock disponible</span>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Not available message -->
        <div v-else class="empty-brands-container">
            <div class="empty-brands-message">
                Esta marca no esta disponible en este momento.
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { useProducts } from '@/composables/useProducts';
import { useBrands } from '@/composables/useBrands';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/composables/useToast';
import type { Product } from '@/types/product.types';
import type { Brand } from '@/types/brand.types';
import { getUrl } from 'aws-amplify/storage';
import { useImageCache } from '@/composables/useImageCache';

const { imageCache, getImageUrl, preloadImages } = useImageCache();
const router = useRouter();
const route = useRoute();
const imageUrls = ref<Record<string, string>>({});
const { productsByBrand, loadProductsByBrand } = useProducts();
const { brandsCarousel, loadBrandsCarousel } = useBrands();
const cartStore = useCartStore();
const { showToast } = useToast();
const sortBy = ref('position');
const currentBrand = ref<Brand | null>(null);
const brandLogoUrl = ref<string>('');
const loading = ref(true);
const error = ref<string | null>(null);
const loadingBrandName = ref(true);

// Función para formatear el badge de descuento según el tipo
const formatDiscountBadge = (product: Product): string => {
    if (!product.discountPercentage) return '';

    // Si el tipo de promoción es 'fixed', mostrar con S/
    if (product.promotionType === 'fixed') {
        return `-S/${product.discountPercentage.toFixed(2)}`;
    } else {
        // Por defecto usar porcentaje
        return `-${product.discountPercentage}%`;
    }
};

const truncateText = (text: string, maxLength: number = 100): string => {
    if (!text) return '';

    // Si el texto es más corto que el máximo, retornarlo completo
    if (text.length <= maxLength) return text;

    // Cortar el texto hasta el máximo
    let truncated = text.slice(0, maxLength);

    // Asegurarse de no cortar a mitad de una palabra
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
        truncated = truncated.slice(0, lastSpace);
    }

    // Asegurarse de no cortar a mitad de un formato markdown
    const boldCount = (truncated.match(/\*\*/g) || []).length;
    const italicCount = (truncated.match(/\*/g) || []).length;

    // Si hay formatos markdown incompletos, ajustarlos
    if (boldCount % 2 !== 0) {
        truncated = truncated.replace(/\*\*[^*]*$/, '');
    }
    if ((italicCount - boldCount * 2) % 2 !== 0) {
        truncated = truncated.replace(/\*[^*]*$/, '');
    }

    return truncated + '...';
};

const parseMarkdown = (text: string): string => {
    if (!text) return '';

    return text
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\s*[-+*]\s+(.*)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // Wrap in paragraphs if not already wrapped
        .replace(/^(.+?)(?:<br>|$)/gm, (_, text) => {
            if (!/^<[h|p|ul|ol|li]/.test(text)) {
                return `<p>${text}</p>`;
            }
            return text;
        });
};

const hasExpiredPromotion = (product: Product): boolean => {
    if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
        return false;
    }

    const currentDate = getCurrentPeruDate();
    return currentDate > product.promotionEndDate;
};

const loadBrandLogo = async () => {
    if (currentBrand.value && currentBrand.value.logo) {
        try {
            const { url } = await getUrl({ path: currentBrand.value.logo });
            brandLogoUrl.value = url.toString();
        } catch (error) {
            console.error("Error cargando logo de marca:", error);
            brandLogoUrl.value = '';
        }
    }
};

const loadImageUrls = async () => {
    if (!productsByBrand.value) return;

    const productsToLoad = productsByBrand.value
        .filter(product => product.imageUrl)
        .map(product => ({
            id: product.id,
            imageUrl: product.imageUrl || ''
        }));

    await preloadImages(productsToLoad);
};

const isOneDayPromotion = (product: Product) => {
    if (!product.promotionStartDate || !product.promotionEndDate) {
        return false;
    }

    return product.promotionStartDate === product.promotionEndDate;
};

const hasActivePromotion = (product: Product) => {
    if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
        return false;
    }

    const currentDate = getCurrentPeruDate();
    return currentDate >= product.promotionStartDate && currentDate <= product.promotionEndDate;
};

// Función modificada para calcular el precio con descuento según el tipo
const calculateDiscountedPrice = (product: Product) => {
    if (!product.originalPrice || !product.discountPercentage) {
        return product.originalPrice || 0;
    }

    // Si el tipo de promoción es 'fixed', restar el monto directamente
    if (product.promotionType === 'fixed') {
        return Math.max(0, product.originalPrice - product.discountPercentage).toFixed(2);
    } else {
        // Descuento porcentual (comportamiento anterior)
        const discountMultiplier = 1 - (product.discountPercentage / 100);
        return (product.originalPrice * discountMultiplier).toFixed(2);
    }
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

const getCurrentPeruDate = (): string => {
    const date = new Date();
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));

    const year = peruDate.getFullYear();
    const month = String(peruDate.getMonth() + 1).padStart(2, '0');
    const day = String(peruDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatPromotionDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long'
    }).format(date);
};

// Función modificada para considerar el tipo de descuento
const getEffectivePrice = (product: Product): number => {
    // Si hay promoción activa, usar precio con descuento
    if (hasActivePromotion(product)) {
        if (product.promotionType === 'fixed') {
            // Descuento de monto fijo
            return Math.max(0, product.originalPrice - product.discountPercentage);
        } else {
            // Descuento porcentual
            const discountMultiplier = 1 - (product.discountPercentage / 100);
            return product.originalPrice * discountMultiplier;
        }
    }
    // Si es una promoción futura o expirada, usar originalPrice
    else if (hasUpcomingPromotion(product) || hasExpiredPromotion(product)) {
        return product.originalPrice || 0;
    }
    // En cualquier otro caso, usar precio normal
    return product.price || 0;
};

const sortedProducts = computed(() => {
    if (!productsByBrand.value) return [];

    return [...productsByBrand.value].sort((a, b) => {
        switch (sortBy.value) {
            case 'price-asc':
                return getEffectivePrice(a) - getEffectivePrice(b);
            case 'price-desc':
                return getEffectivePrice(b) - getEffectivePrice(a);
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            default:
                return 0;
        }
    });
});

const addToCart = (product: Product) => {
    if (!product.stock) {
        showToast({
            type: 'error',
            message: 'Producto agotado'
        });
        return;
    }

    /*const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
    };

    cartStore.addItem(cartItem);*/

    showToast({
        type: 'success',
        message: 'Producto añadido'
    });
};

const loadBrandInfo = async () => {
    loadingBrandName.value = true;
    await loadBrandsCarousel();
    const brandId = route.params.brandId as string;
    currentBrand.value = brandsCarousel.value.find(b => b.id === brandId) || null;
    await loadBrandLogo();
    loadingBrandName.value = false;
};

const loadBrandProducts = async () => {
    const brandId = route.params.brandId as string;
    if (!brandId) {
        router.push('/');
        return;
    }

    try {
        await loadProductsByBrand(brandId);
        await loadImageUrls(); // Cargar imágenes después de obtener los productos
    } catch (err) {
        console.error('Error al cargar productos de la marca:', err);
    }
};

const loadBrandProductsMounted = async () => {
    loading.value = true;
    error.value = null;

    try {
        await loadBrandInfo();
        await loadBrandProducts();
    } catch (err) {
        console.error('Error al cargar datos de la marca:', err);
        error.value = 'Hubo un error al cargar información de la marca.';
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    loadBrandProductsMounted();
});

watch(
    () => route.params.brandId,
    async (newBrandId) => {
        if (newBrandId) {
            loadBrandProductsMounted();
        }
    }
);

watch(
    () => productsByBrand.value,
    async (newProducts) => {
        if (newProducts && newProducts.length > 0) {
            await loadImageUrls();
        }
    },
    { immediate: true }
);
</script>

<style scoped>
.brand-products {
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

.brand-header {
    background: linear-gradient(to right, #1a1a1a, #2d2d2d);
    padding: 2.5rem 0;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
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

.brand-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, #b6b6b6, #505050);
}

.brand-header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.brand-logo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    overflow: hidden;
}

.brand-logo img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.brand-title {
    color: white;
    font-size: 2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 1rem;
}

/* Estilos heredados del WebProductsView */
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

/* Estilos para el badge de promoción activa */
.active-promotion-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #000000;
    /* Mismo color negro que el resto de la aplicación */
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
    /* Mismo amarillo dorado que usas en las promociones futuras */
}

/* Estilos para los precios en promoción activa */
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

.price-info .discounted-price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #000;
    /* Mismo color negro para mantener consistencia */
}

/* Asegurar que el badge no se superpongan si se muestran ambos */
@media (max-width: 768px) {
    .active-promotion-badge {
        top: 10px;
        right: 10px;
        padding: 6px 10px;
    }

    .promotion-badge {
        top: 10px;
        left: 10px;
        padding: 6px 10px;
    }
}

.active-promotion-badge.one-day-promotion {
    background-color: #0a0a0a;
    /* Rojo más intenso para destacar */
    box-shadow: 0 2px 8px rgba(76, 76, 76, 0.4);
    /* Sombra para dar énfasis */
    /*animation: pulse 1.5s infinite;*/
    /* Animación de pulso para llamar la atención */
}

.one-day-promotion .promotion-text {
    font-weight: 800;
    letter-spacing: 0.5px;
}

/* Animación de pulso para llamar la atención en promociones de un día */
@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
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
}

.product-card {
    background: white;
    border: 1px solid #eee;
    padding: 20px;
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
    border-radius: 8px;
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
    /* Altura fija para todas las imágenes */
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f8f8;
    margin-bottom: 15px;

    overflow: hidden;
    border-radius: 4px;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Mantiene la proporción y cubre el espacio */
    object-position: center;
    transition: transform 0.3s ease;
}

.product-content:hover .product-image img {
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

.add-to-cart {
    background-color: #000;
    color: white;
    border: none;
    padding: 12px 20px;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
    border-radius: 6px;
    font-weight: 500;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
}

.add-to-cart:hover {
    background-color: #333;
    transform: translateY(-2px);
}

.add-to-cart.disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
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

.empty-brands-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    padding: 2rem;
}

.empty-brands-message {
    text-align: center;
    padding: 3rem;
    background-color: #f9fafb;
    border-radius: 8px;
    color: #6b7280;
    font-size: 1.1rem;
    height: 100%;
    width: 100%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.brand-title-loader {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.dot {
    width: 8px;
    height: 8px;
    background-color: white;
    border-radius: 50%;
    display: inline-block;
    animation: pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
    animation-delay: 0.2s;
}

.dot:nth-child(3) {
    animation-delay: 0.4s;
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
    .brand-title {
        font-size: 1.5rem;
    }

    .brand-logo {
        width: 60px;
        height: 60px;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
        padding: 15px;
    }

    .product-card {
        padding: 15px;
    }

    .add-to-cart {
        padding: 10px 16px;
        font-size: 0.8rem;
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
    .brand-products {
        padding: 0 10px;
    }

    .brand-header {
        padding: 2rem 0;
    }

    .brand-logo {
        width: 50px;
        height: 50px;
    }

    .products-grid {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 10px;
    }
}
</style>