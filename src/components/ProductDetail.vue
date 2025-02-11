<!-- ProductDetail.vue -->
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

            <div v-else-if="product" class="product-detail">
                <div class="product-gallery">
                    <img :src="product.imageUrl || '/api/placeholder/400/400'" :alt="product.name" class="main-image" />
                </div>

                <div class="product-info">
                    <h1 class="brand-name">{{ product.brand }}</h1>
                    <h2 class="product-name">{{ product.name }}</h2>
                    <p class="product-price">S/{{ product.price.toFixed(2) }}</p>

                    <div class="product-description">
                        <h3>Descripción del Producto</h3>
                        <p>{{ product.description }}</p>
                    </div>

                    <div class="product-actions">
                        <div class="quantity-selector">
                            <button @click="quantity > 1 && quantity--" class="quantity-btn" :disabled="quantity <= 1">
                                -
                            </button>
                            <input type="number" v-model="quantity" min="1" class="quantity-input" />
                            <button @click="quantity++" class="quantity-btn">
                                +
                            </button>
                        </div>

                        <button @click="addToCart" class="add-to-cart">
                            AÑADIR AL CARRITO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { useProducts } from '@/composables/useProducts';
import type { Product } from '@/types/product.types';

const route = useRoute();
const { products, loading, error, loadProductsWeb } = useProducts();
const quantity = ref(1);

const product = computed(() => {
    if (!products.value) return null;
    return products.value.find(p => p.id === route.params.id);
});

const breadcrumbItems = computed(() => [
    { text: 'Inicio', to: '/' },
    { text: 'Promocionales', to: '/promotions' },
    { text: product.value?.name || 'Producto', to: '' }
]);

const addToCart = () => {
    if (product.value) {
        // TODO: Implementar lógica del carrito
        console.log('Añadir al carrito:', {
            product: product.value,
            quantity: quantity.value
        });
    }
};

onMounted(() => {
    loadProductsWeb();
});
</script>

<style scoped>
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