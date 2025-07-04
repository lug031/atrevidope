<template>
    <MainLayout>
        <div class="promotions-page">
            <Breadcrumbs :items="[
                { text: 'Inicio', to: '/' },
                { text: 'Productos', to: '/web-products' },
                { text: 'Promociones', to: '/promotions' }
            ]" />

            <h1 class="page-title">PROMOCIONES</h1>

            <div v-if="loading" class="loading-state">
                <div class="loader"></div>
            </div>

            <div v-else-if="error" class="error-state">
                {{ error }}
            </div>

            <div v-else class="products-grid">
                <div v-for="product in activePromotionsWithDates" :key="product.id" class="product-card">
                    <router-link :to="{
                        name: 'ProductDetail',
                        params: { id: product.id },
                        state: { fromPromotions: true }
                    }" class="product-content">
                        <!-- Badge de promoción activa -->
                        <div class="active-promotion-badge"
                            :class="{ 'one-day-promotion': isSingleDayPromotion(product) }">
                            <span class="promotion-text" v-if="isSingleDayPromotion(product)">¡SOLO POR HOY!</span>
                            <span class="promotion-text" v-else>¡EN PROMOCIÓN!</span>
                            <span class="promotion-discount">{{ formatDiscountBadge(product) }}</span>
                            <span class="promotion-end" v-if="!isSingleDayPromotion(product)">
                                Hasta {{ formatPromotionDate(product.promotionEndDate) }}
                            </span>
                        </div>

                        <div class="product-image">
                            <img :src="imageUrls[product.id] || '/api/placeholder/40/40'" :alt="product.name"
                                loading="lazy" />
                        </div>

                        <div class="product-info">
                            <h3 class="brand-name">{{ product.brand }}</h3>
                            <p class="product-name">{{ product.name }}</p>
                            <div class="formatted-description"
                                v-html="parseMarkdown(truncateText(product.description, 100))" />

                            <!-- Precios -->
                            <div class="price-info has-active-promotion">
                                <p class="product-price">
                                    <span class="original-price">S/{{ product.originalPrice.toFixed(2) }}</span>
                                    <span class="discounted-price">S/{{ calculateDiscountedPrice(product) }}</span>
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

            <div v-if="!loading && !error && activePromotionsWithDates.length === 0" class="empty-state">
                No hay productos en promoción disponibles.
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import MainLayout from '@/layouts/MainLayout.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { usePromotions } from '../composables/usePromotions';
import type { Product } from '@/types/product.types';
import { useCartStore } from '@/stores/cart';
import { useToast } from '../composables/useToast';
import type { CartItem } from '@/types/cart.types';
import { useProducts } from '@/composables/useProducts';
import { uploadData, getUrl } from 'aws-amplify/storage';

const imageUrls = ref<Record<string, string>>({});
const cartStore = useCartStore();
const { showToast } = useToast();
const {
    activePromotions,
    loadPromotions,
    calculateDiscountedPrice,
    formatPrice,
} = usePromotions();
const loading = ref(true);
const error = ref<string | null>(null);

const formatDateToSpanish = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long'
    }).format(date);
};

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

const formatPromotionDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long'
    }).format(date);
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

const isPromotionActive = (product: Product): boolean => {
    if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
        return false;
    }

    const todayStr = getCurrentPeruDate();

    return product.promotionStartDate <= todayStr && todayStr <= product.promotionEndDate;
};

const getCurrentPeruDate = (): string => {
    const date = new Date();
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));

    const year = peruDate.getFullYear();
    const month = String(peruDate.getMonth() + 1).padStart(2, '0');
    const day = String(peruDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const isSingleDayPromotion = (product: Product): boolean => {
    return product.promotionStartDate === product.promotionEndDate;
};

const getPromotionDateText = (product: Product): string => {
    if (!product.promotionStartDate || !product.promotionEndDate) return '';

    const today = getCurrentPeruDate();

    if (product.promotionStartDate === product.promotionEndDate) {
        if (product.promotionStartDate === today) {
            return '¡Solo por hoy!';
        }
        return `Solo el ${formatDateToSpanish(product.promotionStartDate)}`;
    }

    return `Válido del ${formatDateToSpanish(product.promotionStartDate)} al ${formatDateToSpanish(product.promotionEndDate)}`;
};

const isInCurrentMonth = (dateStr: string): boolean => {
    const [year, month] = dateStr.split('-').map(Number);
    const now = new Date();
    return month === (now.getMonth() + 1) && year === now.getFullYear();
};

const activePromotionsWithDates = computed(() => {
    return activePromotions.value.filter(product => {
        if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
            return false;
        }

        return isPromotionActive(product) &&
            (isInCurrentMonth(product.promotionStartDate) ||
                isInCurrentMonth(product.promotionEndDate));
    });
});

const loadImageUrls = async () => {
    for (const product of activePromotionsWithDates.value) {
        if (product.imageUrl) {
            try {
                const { url } = await getUrl({ path: product.imageUrl });
                imageUrls.value[product.id] = url.toString();
            } catch (error) {
                console.error("Error cargando imagen:", error);
            }
        }
    }
};

const addToCart = (product: Product) => {
    if (!product.stock) {
        showToast({
            type: 'error',
            message: 'Producto agotado'
        });
        return;
    }

    showToast({
        type: 'success',
        message: 'Producto añadido'
    });
};

const loadPromotionsMounted = async () => {
    loading.value = true;
    error.value = null;

    try {
        await loadPromotions();
    } catch (err) {
        error.value = 'Hubo un error al cargar las promociones.';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadPromotionsMounted();
});

watch(() => activePromotionsWithDates.value, () => {
    loadImageUrls();
}, { immediate: true });
</script>

<style scoped>
.promotions-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
}

.promotion-dates {
    position: absolute;
    top: 40px;
    left: 10px;
    background-color: #fff;
    color: #000;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    z-index: 1;
    border: 1px solid #000;
}

.promotion-dates.today-only {
    background-color: #ff0000;
    color: #fff;
    border: none;
    font-weight: bold;
}

.page-title {
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
    margin: 2rem 0;
    color: #000;
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

/* New styles for the router-link wrapper */
.product-content {
    display: block;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
}

.discount-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: #000;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    z-index: 1;
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
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.3s ease;
}

.product-content:hover .product-image img {
    transform: scale(1.05);
}

.product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.brand {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
    font-weight: 500;
}

.name {
    font-size: 0.9rem;
    margin: 0.5rem 0;
    color: #000;
    line-height: 1.2;
    height: 2.4em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.price-container {
    margin: 1rem 0;
    text-align: center;
}

.price-wrapper {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
}

.current-price {
    font-size: 1.1rem;
    font-weight: bold;
    color: #000;
}

.original-price {
    color: #999;
    text-decoration: line-through;
    font-size: 0.9rem;
}

.add-to-cart {
    width: 100%;
    padding: 0.75rem;
    background-color: #000;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    transition: background-color 0.2s;
    margin-top: 1rem;
}

.add-to-cart:hover {
    background-color: #333;
}

.loading-state {
    text-align: center;
    padding: 3rem;
}

.error-state {
    text-align: center;
    color: #ff0000;
    padding: 3rem;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    background-color: #f9fafb;
    border-radius: 8px;
    color: #6b7280;
    font-size: 1.1rem;
}

.loader {
    width: 48px;
    height: 48px;
    border: 4px solid #000;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    animation: rotation 1s linear infinite;
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

.add-to-cart.disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.add-to-cart.disabled:hover {
    background-color: #ccc;
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

.active-promotion-badge.one-day-promotion {
    background-color: #d61c1c;
    box-shadow: 0 2px 8px rgba(214, 28, 28, 0.4);
    animation: pulse 1.5s infinite;
}

.one-day-promotion .promotion-text {
    font-weight: 800;
    letter-spacing: 0.5px;
}

.brand-name {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
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
}

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

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.5;
    }

    50% {
        transform: scale(1.2);
        opacity: 1;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
        padding: 15px;
    }

    .product-card {
        padding: 15px;
    }

    .active-promotion-badge {
        top: 10px;
        right: 10px;
        padding: 6px 10px;
    }
}

@media (max-width: 480px) {
    .promotions-page {
        padding: 0 10px;
    }

    .products-grid {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 10px;
    }
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>