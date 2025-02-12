<!-- PromotionalBanner.vue -->
<template>
    <div class="promo-banner-section">
        <div class="promo-banner">
            <div class="banner-content">
                <div class="main-text">
                    <h2 class="title">{{ product?.name }}</h2>
                    <div class="subtitle">
                        TENEMOS LOS MEJORES
                        <br />PRECIOS
                        <br />DEL MERCADO
                    </div>
                </div>
            </div>

            <div class="brand-logo">
                <img :src="brandLogo" alt="Brand Logo" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProducts } from '@/composables/useProducts';
import { useCartStore } from '@/stores/cart';
import { useToast } from '../composables/useToast';
import { getUrl } from 'aws-amplify/storage';
import type { CartItem } from '@/types/cart.types';

const { products } = useProducts();
const cartStore = useCartStore();
const { showToast } = useToast();
const imageUrls = ref<Record<string, string>>({});
const brandLogo = ref('/atrevido_logo.png');

// Suponiendo que quieres mostrar un producto específico
const product = ref(products.value?.find(p => p.brand === 'Sally Hansen'));

const loadImageUrls = async () => {
    if (product.value?.imageUrl) {
        try {
            const { url } = await getUrl({ path: product.value.imageUrl });
            imageUrls.value[product.value.id] = url.toString();
        } catch (error) {
            console.error("Error cargando imagen:", error);
        }
    }
};

onMounted(() => {
    loadImageUrls();
});
</script>

<style scoped>
.promo-banner-section {
    margin: 40px 0;
}

.promo-banner {
    position: relative;
    height: 600px;
    background: url('/hero-banner.png') center/cover;
    display: grid;
    grid-template-columns: 300px 1fr;
    overflow: hidden;
}

.product-preview {
    background: white;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 2;
}

.product-thumbnail {
    width: 200px;
    height: auto;
    margin-bottom: 20px;
}

.product-details {
    text-align: center;
}

.product-brand {
    font-weight: bold;
    margin-bottom: 10px;
}

.product-rating {
    color: gold;
    margin-bottom: 10px;
}

.product-price {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 15px;
}

.add-to-cart-btn {
    background: black;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
    background: #333;
}

.banner-content {
    padding: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.main-text {
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.title {
    font-size: 3rem;
    margin-bottom: 20px;
}

.subtitle {
    font-size: 2.5rem;
    line-height: 1.2;
    font-weight: bold;
}

.product-images {
    display: flex;
    gap: 20px;
    align-items: flex-end;
}

.product-display {
    height: 300px;
    object-fit: contain;
}

.brand-logo {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 200px; /* Más grande en web */
    transition: width 0.3s ease;
}

.brand-logo img {
    width: 100%;
    height: auto;
    object-fit: contain;
}

@media (max-width: 1024px) {
    .brand-logo {
        width: 150px; /* Tamaño medio para tablets */
    }
}

@media (max-width: 768px) {
    .brand-logo {
        width: 100px; /* Más pequeño para móviles */
        top: 15px;
        right: 15px;
    }
}

@media (max-width: 480px) {
    .brand-logo {
        width: 80px; /* Aún más pequeño para móviles pequeños */
        top: 10px;
        right: 10px;
    }
}

@media (max-width: 1024px) {
    .promo-banner {
        grid-template-columns: 1fr;
        height: auto;
    }

    .product-preview {
        display: none;
    }

    .banner-content {
        flex-direction: column;
        text-align: center;
    }

    .main-text {
        margin-bottom: 30px;
    }
}

@media (max-width: 768px) {
    .title {
        font-size: 2rem;
    }

    .subtitle {
        font-size: 1.8rem;
    }

    .product-images {
        flex-direction: column;
        align-items: center;
    }

    .product-display {
        height: 200px;
    }
}
</style>