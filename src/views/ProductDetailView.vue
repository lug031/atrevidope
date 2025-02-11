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

            <div v-else-if="currentProduct" class="product-detail">
                <div class="product-gallery">
                    <img :src="currentProduct.imageUrl || '/api/placeholder/400/400'" :alt="currentProduct.name"
                        class="main-image" />
                </div>

                <div class="product-info">
                    <h1 class="brand-name">{{ currentProduct.brand }}</h1>
                    <h2 class="product-name">{{ currentProduct.name }}</h2>
                    <div class="price-section">
                        <template v-if="isPromotionalProduct">
                            <p class="product-price">
                                <span class="current-price">S/{{ formatPrice(calculateDiscountedPrice(currentProduct))
                                    }}</span>
                                <span class="original-price">S/{{ formatPrice(currentProduct.originalPrice) }}</span>
                            </p>
                            <div class="discount-badge">-{{ currentProduct.discountPercentage }}%</div>
                        </template>
                        <template v-else>
                            <p class="product-price">S/{{ currentProduct.price.toFixed(2) }}</p>
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
                        <p>{{ currentProduct.description }}</p>
                    </div>

                    <div class="product-actions">
                        <div class="quantity-selector">
                            <button @click="decrementQuantity" class="quantity-btn"
                                :disabled="quantity <= 1 || isOutOfStock">
                                -
                            </button>
                            <input type="number" v-model="quantity" min="1" :max="currentProduct.stock"
                                class="quantity-input" :disabled="isOutOfStock" @change="validateQuantity" />
                            <button @click="incrementQuantity" class="quantity-btn"
                                :disabled="isMaxQuantityReached || isOutOfStock">
                                +
                            </button>
                        </div>

                        <button @click="addToCart" class="add-to-cart" :disabled="isOutOfStock || !isValidQuantity"
                            :class="{ 'disabled': isOutOfStock || !isValidQuantity }">
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

const route = useRoute();
const router = useRouter();
const { products, loading: productsLoading, error: productsError, loadProductsWeb } = useProducts();
const {
    activePromotions,
    loading: promotionsLoading,
    error: promotionsError,
    loadPromotions,
    calculateDiscountedPrice,
    formatPrice
} = usePromotions();
const { showToast } = useToast();
const quantity = ref(1);

/*PRUEBA CART*/
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/types/cart.types';
const cartStore = useCartStore()

// Stock-related computed properties
const isOutOfStock = computed(() =>
    currentProduct.value?.stock === 0
);

const isLowStock = computed(() =>
    currentProduct.value?.stock !== undefined &&
    currentProduct.value.stock > 0 &&
    currentProduct.value.stock <= 5
);

const isMaxQuantityReached = computed(() =>
    currentProduct.value?.stock !== undefined &&
    quantity.value >= currentProduct.value.stock
);

const isValidQuantity = computed(() =>
    currentProduct.value?.stock !== undefined &&
    quantity.value > 0 &&
    quantity.value <= currentProduct.value.stock
);

const addToCartButtonText = computed(() => {
    if (isOutOfStock.value) return 'PRODUCTO AGOTADO';
    if (!isValidQuantity.value) return 'CANTIDAD NO VÁLIDA';
    return 'AÑADIR AL CARRITO';
});

// Quantity control methods
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

// Watch for changes in quantity
watch(quantity, (newValue) => {
    validateQuantity();
});

// Previous route check
const previousRoute = router.options.history.state.back;
const isFromPromotions = typeof previousRoute === 'string' && previousRoute.includes('/promotions');

// Loading and error states
const loading = computed(() => isFromPromotions ? promotionsLoading.value : productsLoading.value);
const error = computed(() => isFromPromotions ? promotionsError.value : productsError.value);

// Current product computation
const currentProduct = computed(() => {
    const productId = route.params.id;
    if (isFromPromotions) {
        return activePromotions.value?.find(p => p.id === productId) || null;
    }
    return products.value?.find(p => p.id === productId) || null;
});

const isPromotionalProduct = computed(() => {
    return isFromPromotions && currentProduct.value !== null;
});

const breadcrumbItems = computed(() => {
    const baseItems = [
        { text: 'Inicio', to: '/' },
        { text: 'Productos', to: '/web-products' }
    ];

    if (isFromPromotions) {
        baseItems.push({ text: 'Promociones', to: '/promotions' });
    }

    baseItems.push({ text: currentProduct.value?.name || 'Producto', to: '' });

    return baseItems;
});

const addToCart = () => {
    if (currentProduct.value && isValidQuantity.value) {
        if (quantity.value <= currentProduct.value.stock) {
            const cartItem: CartItem = {
                id: currentProduct.value.id,
                name: currentProduct.value.name,
                price: isPromotionalProduct.value
                    ? calculateDiscountedPrice(currentProduct.value)
                    : currentProduct.value.price,
                quantity: quantity.value,
                imageUrl: currentProduct.value.imageUrl
            };

            cartStore.addItem(cartItem);

            showToast({
                type: 'success',
                message: 'Producto añadido'
            });
        } else {
            showToast({
                type: 'error',
                message: `No hay suficiente stock. Solo quedan ${currentProduct.value.stock} unidades`
            });
        }
    }
};

onMounted(async () => {
    if (isFromPromotions) {
        await loadPromotions();
    } else {
        await loadProductsWeb();
    }
});
</script>

<style scoped>
/* Styles remain unchanged */
.product-detail-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.product-detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 20px;
}

.product-gallery {
    position: sticky;
    top: 20px;
}

.main-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
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
    align-items: center;
    gap: 1rem;
    margin: 20px 0;
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