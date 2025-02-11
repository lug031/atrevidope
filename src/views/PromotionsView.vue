<template>
    <MainLayout>
        <div class="promotions-page">
            <Breadcrumbs :items="[
                { text: 'Inicio', to: '/' },
                { text: 'Productos', to: '/web-products' },
                { text: 'Promociones', to: '/promotions' }
            ]" />

            <h1 class="page-title">PROMOCIONES DEL MES</h1>

            <!-- Products Grid -->
            <div v-if="loading" class="loading-state">
                <div class="loader"></div>
            </div>

            <div v-else-if="error" class="error-state">
                {{ error }}
            </div>

            <div v-else class="products-grid">
                <div v-for="product in displayProducts" :key="product.id" class="product-card">
                    <router-link :to="{
                        name: 'ProductDetail',
                        params: { id: product.id },
                        state: { fromPromotions: true }
                    }" class="product-content">
                        <div class="discount-badge">
                            -{{ product.discountPercentage }}%
                        </div>

                        <div class="product-image">
                            <img :src="product.imageUrl || '/api/placeholder/300/300'" :alt="product.name">
                        </div>

                        <div class="product-info">
                            <h3 class="brand">{{ product.brand }}</h3>
                            <p class="name">{{ product.name }}</p>

                            <div class="price-container">
                                <div class="price-wrapper">
                                    <span class="current-price">S/{{ formatPrice(calculateDiscountedPrice(product))
                                        }}</span>
                                    <span class="original-price">S/{{ formatPrice(product.originalPrice) }}</span>
                                </div>
                            </div>

                            <!-- Stock status -->
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

                    <button @click.stop="addToCart(product)" class="add-to-cart"
                        :class="{ 'disabled': product.stock === 0 }" :disabled="product.stock === 0">
                        {{ product.stock === 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO' }}
                    </button>
                </div>
            </div>

            <div v-if="!loading && !error && displayProducts.length === 0" class="empty-state">
                No hay productos en promoción disponibles.
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import MainLayout from '@/layouts/MainLayout.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { usePromotions } from '../composables/usePromotions';
import type { Product } from '@/types/product.types';
import { useCartStore } from '@/stores/cart';
import { useToast } from '../composables/useToast';
import type { CartItem } from '@/types/cart.types';

// Setup del store y toast
const cartStore = useCartStore();
const { showToast } = useToast();
const {
    activePromotions,
    loading,
    error,
    loadPromotions,
    calculateDiscountedPrice,
    formatPrice,
} = usePromotions();

const displayProducts = computed(() => activePromotions.value);

const addToCart = (product: Product) => {
    if (!product.stock) {
        showToast({
            type: 'error',
            message: 'Producto agotado'
        });
        return;
    }

    const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: calculateDiscountedPrice(product),
        quantity: 1, // Por defecto añadimos 1 unidad desde la vista de promociones
        imageUrl: product.imageUrl
    };

    if (product.stock < 1) {
        showToast({
            type: 'error',
            message: 'No hay stock disponible'
        });
        return;
    }

    cartStore.addItem(cartItem);

    showToast({
        type: 'success',
        message: 'Producto añadido'
    });
};

onMounted(() => {
    loadPromotions();
});
</script>

<style scoped>
.promotions-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
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
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
}

.product-card {
    background: #fff;
    border-radius: 8px;
    padding: 1rem;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: transform 0.2s;
}

.product-card:hover {
    transform: translateY(-5px);
}

/* New styles for the router-link wrapper */
.product-content {
    display: block;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    flex: 1;
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
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    padding: 1rem;
}

.product-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
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
    color: #666;
    padding: 3rem;
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
    margin: 0.5rem 0;
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

.add-to-cart.disabled:hover {
    background-color: #ccc;
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