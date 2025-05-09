<template>
    <MainLayout>
        <div class="product-detail-container">
            <!-- Breadcrumbs -->
            <Breadcrumbs :items="breadcrumbItems" />

            <div v-if="loading" class="loading-state">
                <span class="loader"></span>
            </div>

            <div v-else-if="error" class="error-state">
                Lo sentimos, ha ocurrido un error al cargar el producto.
            </div>

            <div v-else-if="!currentProduct" class="error-state not-found">
                <div class="error-content">
                    <h2>No encontramos el producto</h2>
                    <p>El producto que buscas no está disponible o no existe.</p>
                    <router-link to="/web-products" class="back-button">
                        Volver a productos
                    </router-link>
                </div>
            </div>

            <div v-else-if="currentProduct" class="product-detail">
                <div class="product-gallery">
                    <img :src="imageUrls[currentProduct.id] || '/api/placeholder/40/40'" :alt="currentProduct.name"
                        class="main-image" />
                </div>

                <div class="product-info">
                    <h1 class="brand-name">{{ currentProduct.brand }}</h1>
                    <h2 class="product-name">{{ currentProduct.name }}</h2>

                    <!-- Sección de precios y promoción -->
                    <div class="price-section">
                        <template v-if="isValidPromotion">
                            <p class="product-price">
                                <span class="current-price">S/{{ formatPrice(calculateDiscountedPrice(currentProduct))
                                    }}</span>
                                <span class="original-price">S/{{ formatPrice(currentProduct.originalPrice) }}</span>
                            </p>
                            <!-- Badge de descuento y fechas debajo del precio -->
                            <div class="promotion-info">
                                <div class="discount-badge">{{ formatDiscountBadge(currentProduct) }}</div>
                                <div class="promotion-dates" :class="{ 'today-only': isSingleDayPromotion }">
                                    {{ getPromotionDateText(currentProduct) }}
                                </div>
                            </div>
                        </template>
                        <template
                            v-else-if="hasExpiredPromotion(currentProduct) || hasUpcomingPromotion(currentProduct)">
                            <p class="product-price">S/{{ formatPrice(currentProduct.originalPrice) }}</p>
                        </template>
                        <template v-else>
                            <p class="product-price">S/{{ formatPrice(currentProduct.price) }}</p>
                        </template>
                    </div>

                    <!-- Stock Status -->
                    <div class="stock-status" :class="{ 'low-stock': isLowStock, 'out-of-stock': isOutOfStock }">
                        <span v-if="isOutOfStock">Producto agotado</span>
                        <span v-else-if="isLowStock">¡Últimas {{ currentProduct.stock }} unidades disponibles!</span>
                        <span v-else>Stock disponible</span>
                    </div>

                    <div class="product-description">
                        <h3>Descripción del Producto</h3>
                        <div class="formatted-description" v-html="formattedDescription"></div>
                    </div>

                    <div class="product-actions">
                        <div class="quantity-selector">
                            <button @click="decrementQuantity" class="quantity-btn"
                                :disabled="quantity <= 1 || isOutOfStock || cartLoading">
                                -
                            </button>
                            <input type="number" v-model="quantity" min="1" :max="currentProduct?.stock"
                                class="quantity-input" :disabled="isOutOfStock || cartLoading"
                                @change="validateQuantity" />
                            <button @click="incrementQuantity" class="quantity-btn"
                                :disabled="isMaxQuantityReached || isOutOfStock || cartLoading">
                                +
                            </button>
                        </div>

                        <button @click="addToCart" class="add-to-cart"
                            :disabled="isOutOfStock || !isValidQuantity || isAddingToCart" :class="{
                                'disabled': isOutOfStock || !isValidQuantity || isAddingToCart,
                                'loading': isAddingToCart
                            }">
                            {{ addToCartButtonText }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { useProducts } from '@/composables/useProducts';
import { usePromotions } from '../composables/usePromotions';
import type { Product } from '@/types/product.types';
import { useToast } from '../composables/useToast';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { useCart } from '@/composables/useCart';
import type { CartItem } from '@/types/cart.types';

const imageUrls = ref<Record<string, string>>({});
const route = useRoute();
const router = useRouter();
const { allProductsWeb, loading: productsLoading, error: productsError, loadAllProductsWeb } = useProducts();
const {
    activePromotions,
    loading: promotionsLoading,
    error: promotionsError,
    loadPromotions,
    calculateDiscountedPrice,
    formatPrice
} = usePromotions();
const {
    addToCart: addItemToCart,
    loading: cartLoading,
    error: cartError,
    canIncreaseQuantity
} = useCart();
const { showToast } = useToast();
const quantity = ref(1);
const isAddingToCart = ref(false);

// Función para formatear el badge de descuento según el tipo
const formatDiscountBadge = (product: Product): string => {
    if (!product.discountPercentage) return '';

    // Si el tipo de promoción es 'fixed', mostrar con S/
    if (product.promotionType === 'fixed') {
        return `- S/${product.discountPercentage.toFixed(2)}`;
    } else {
        // Por defecto usar porcentaje
        return `- ${product.discountPercentage}%`;
    }
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

const formattedDescription = computed(() => {
    return parseMarkdown(currentProduct.value?.description || '');
});

const isOutOfStock = computed(() =>
    currentProduct.value?.stock === 0
);

const loadImageUrls = async () => {
    if (currentProduct.value?.imageUrl) {
        try {
            const { url } = await getUrl({ path: currentProduct.value.imageUrl });
            imageUrls.value[currentProduct.value.id] = url.toString();
        } catch (error) {
            console.error("Error cargando imagen:", error);
        }
    }
};

const isSingleDayPromotion = computed(() => {
    return currentProduct.value?.promotionStartDate === currentProduct.value?.promotionEndDate;
});

const hasExpiredPromotion = (product: Product): boolean => {
    if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
        return false;
    }

    const today = getCurrentPeruDate();
    return today > product.promotionEndDate;
};

const hasUpcomingPromotion = (product: Product): boolean => {
    if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
        return false;
    }

    const today = getCurrentPeruDate();
    return today < product.promotionStartDate;
};

const isPromotionActive = (product: Product): boolean => {
    if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
        return false;
    }

    const today = getCurrentPeruDate();
    return product.promotionStartDate <= today && today <= product.promotionEndDate;
};

const getCurrentPeruDate = (): string => {
    const date = new Date();
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));

    const year = peruDate.getFullYear();
    const month = String(peruDate.getMonth() + 1).padStart(2, '0');
    const day = String(peruDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatDateToSpanish = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long'
    }).format(date);
};

const getPromotionDateText = (product: Product): string => {
    if (!product.promotionStartDate || !product.promotionEndDate) return '';

    const today = getCurrentPeruDate();

    if (product.promotionStartDate === product.promotionEndDate &&
        product.promotionStartDate === today) {
        return '¡Solo por hoy!';
    }

    return `Válido del ${formatDateToSpanish(product.promotionStartDate)} al ${formatDateToSpanish(product.promotionEndDate)}`;
};

const isValidPromotion = computed(() => {
    if (!currentProduct.value?.isPromoted ||
        !currentProduct.value.promotionStartDate ||
        !currentProduct.value.promotionEndDate) {
        return false;
    }

    // Only active promotions are valid (not upcoming or expired)
    return isPromotionActive(currentProduct.value);
});

const isLowStock = computed(() =>
    currentProduct.value?.stock !== undefined &&
    currentProduct.value.stock > 0 &&
    currentProduct.value.stock <= 5
);

const isMaxQuantityReached = computed(() => {
    if (!currentProduct.value) return true;
    return !canIncreaseQuantity(currentProduct.value) ||
        quantity.value >= currentProduct.value.stock;
});

const isValidQuantity = computed(() =>
    currentProduct.value?.stock !== undefined &&
    quantity.value > 0 &&
    quantity.value <= currentProduct.value.stock
);

const addToCartButtonText = computed(() => {
    if (isAddingToCart.value) return 'AGREGANDO...';
    if (isOutOfStock.value) return 'PRODUCTO AGOTADO';
    if (!isValidQuantity.value) return 'CANTIDAD NO VÁLIDA';
    return 'AÑADIR AL CARRITO';
});

const decrementQuantity = () => {
    if (quantity.value > 1) {
        quantity.value--;
    }
};

const incrementQuantity = () => {
    if (currentProduct.value && quantity.value < currentProduct.value.stock) {
        quantity.value++;
    }
};

const validateQuantity = () => {
    if (currentProduct.value) {
        if (quantity.value < 1) {
            quantity.value = 1;
        } else if (quantity.value > currentProduct.value.stock) {
            quantity.value = currentProduct.value.stock;
            showToast({
                type: 'warning',
                message: `Solo hay ${currentProduct.value.stock} unidades disponibles`
            });
        }
    }
};

watch(quantity, (newValue) => {
    validateQuantity();
});

const previousRoute = router.options.history.state.back;
const isFromPromotions = typeof previousRoute === 'string' && previousRoute.includes('/promotions');

const loading = computed(() => isFromPromotions ? promotionsLoading.value : productsLoading.value);
const error = computed(() => isFromPromotions ? promotionsError.value : productsError.value);

const currentProduct = computed(() => {
    const productId = route.params.id;
    if (isFromPromotions) {
        return activePromotions.value?.find(p => p.id === productId) || null;
    }
    return allProductsWeb.value?.find(p => p.id === productId) || null;
});

const isPromotionalProduct = computed(() => {
    return (isFromPromotions || isValidPromotion.value) && currentProduct.value !== null;
});

const breadcrumbItems = computed(() => {
    const baseItems = [
        { text: 'Inicio', to: '/' }
    ];

    // Get the previous route path and query
    const previousRoute = router.options.history.state.back;

    // Check if previous route is a category route
    if (typeof previousRoute === 'string' && previousRoute.includes('/category/')) {
        try {
            // Parse the URL to get the category name from query params
            const url = new URL(previousRoute, window.location.origin);
            const categoryName = url.searchParams.get('name');

            if (categoryName) {
                // Format the category name by replacing '+' with spaces
                const formattedCategoryName = decodeURIComponent(categoryName).replace(/\+/g, ' ');
                baseItems.push({
                    text: formattedCategoryName,
                    to: previousRoute
                });
            }
        } catch (error) {
            console.error('Error parsing category URL:', error);
        }
    } else if (typeof previousRoute === 'string' && previousRoute.includes('/brand/')) {
        try {
            const brandName = currentProduct.value.brand;

            if (brandName) {
                const formattedBrandName = decodeURIComponent(brandName).replace(/\+/g, ' ');
                baseItems.push({
                    text: formattedBrandName,
                    to: previousRoute
                });
            }
        } catch (error) {
            console.error('Error parsing category URL:', error);
        }
    } else if (isFromPromotions) {
        baseItems.push(
            { text: 'Productos', to: '/web-products' },
            { text: 'Promociones', to: '/promotions' }
        );
    } else {
        baseItems.push({ text: 'Productos', to: '/web-products' });
    }

    // Add current product as the last item
    baseItems.push({ text: currentProduct.value?.name || 'Producto', to: '' });

    return baseItems;
});

const addToCart = async () => {
    if (!currentProduct.value || !isValidQuantity.value) return;

    try {
        isAddingToCart.value = true;

        if (quantity.value <= currentProduct.value.stock) {
            // Determine the correct price to use
            let productPrice = currentProduct.value.price;

            if (isValidPromotion.value) {
                // Active promotion - use discounted price (with proper calculation based on type)
                productPrice = calculateDiscountedPrice(currentProduct.value);
            } else if (hasExpiredPromotion(currentProduct.value) || hasUpcomingPromotion(currentProduct.value)) {
                // Expired or upcoming promotion - use original price
                productPrice = currentProduct.value.originalPrice;
            }

            await addItemToCart(
                {
                    ...currentProduct.value,
                    price: productPrice,
                    originalPrice: currentProduct.value.originalPrice,
                },
                quantity.value
            );

            showToast({
                type: 'success',
                message: 'Producto añadido al carrito'
            });

            quantity.value = 1;
        } else {
            showToast({
                type: 'error',
                message: `No hay suficiente stock. Solo quedan ${currentProduct.value.stock} unidades`
            });
        }
    } catch (err) {
        console.error('Error al añadir al carrito:', err);
        showToast({
            type: 'error',
            message: 'Error al añadir el producto al carrito'
        });
    } finally {
        isAddingToCart.value = false;
    }
};

onMounted(async () => {
    if (isFromPromotions) {
        await loadPromotions();
    } else {
        await loadAllProductsWeb();
    }
});

watch(() => currentProduct.value, () => {
    loadImageUrls();
}, { immediate: true });
</script>

<style scoped>
.product-detail-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
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

.promotion-ended {
    margin-left: 1rem;
    padding: 4px 8px;
    background-color: #f3f4f6;
    color: #6b7280;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
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

.promotion-dates {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    background-color: #fff;
    color: #000;
    border: 1px solid #000;
    display: inline-block;
}

.promotion-dates.today-only {
    background-color: #ff0000;
    color: #fff;
    border: none;
    font-weight: bold;
}

.product-detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
}

.product-gallery {
    position: sticky;
    top: 20px;
    width: 100%;
    /* Establecemos un aspect ratio máximo de 1080:1350 */
    aspect-ratio: 1080/1350;
    overflow: hidden;
    border-radius: 8px;
}

.main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Esto hará que la imagen cubra el contenedor manteniendo su proporción */
    object-position: center;
    /* Centra la imagen vertical y horizontalmente */
    border-radius: 8px;
}

/* Para pantallas más pequeñas, mantenemos la proporción */
@media (max-width: 768px) {
    .product-gallery {
        aspect-ratio: 1080/1350;
        margin: 0 auto;
    }
}

.product-info {
    padding: 20px;
}

.brand-name {
    font-size: 1.2rem;
    color: #666;
    margin: 0;
}

.product-name {
    font-size: 2rem;
    margin: 10px 0;
}

.product-price {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 20px 0;
}

.product-price .original-price {
    margin-left: 8px;
    /* Ajusta el valor según necesites */
}

.product-description {
    margin: 30px 0;
}

.product-description h3 {
    font-size: 1.2rem;
    margin-bottom: 10px;
}

.product-description p {
    color: #666;
    line-height: 1.6;
}

.product-actions {
    margin-top: 30px;
}

.quantity-selector {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: fit-content;
}

.quantity-btn {
    background: none;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 1.2rem;
}

.quantity-btn:disabled {
    color: #ccc;
    cursor: not-allowed;
}

.quantity-input {
    width: 60px;
    text-align: center;
    border: none;
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
    padding: 10px;
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.add-to-cart {
    background-color: #000;
    color: white;
    border: none;
    padding: 15px 30px;
    width: 100%;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.add-to-cart:hover {
    background-color: #333;
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

.price-section {
    display: flex;
    flex-direction: column;
    /* Cambio clave: de row a column */
    gap: 0.5rem;
    margin: 20px 0;
}

.promotion-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.current-price {
    font-size: 1.8rem;
    font-weight: bold;
    color: #000;
}

.original-price {
    color: #999;
    text-decoration: line-through;
    font-size: 1.2rem;
}

.discount-badge {
    background-color: #000;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
}

.stock-status {
    margin: 15px 0;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.9rem;
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

.add-to-cart.disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.error-state.not-found {
    padding: 3rem 1rem;
    text-align: center;
    background-color: #ffffff;
    border-radius: 8px;
    margin: 2rem auto;
    max-width: 600px;
}

.error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.error-content h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 0.5rem;
}

.error-content p {
    color: #666;
    margin-bottom: 1.5rem;
}

.back-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #000;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.back-button:hover {
    background-color: #333;
}

@media (max-width: 768px) {
    .error-state.not-found {
        margin: 1rem;
        padding: 2rem 1rem;
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

@media (max-width: 768px) {
    .product-detail {
        grid-template-columns: 1fr;
    }

    .product-gallery {
        position: static;
    }
}
</style>