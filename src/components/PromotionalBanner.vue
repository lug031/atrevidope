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
                <router-link to="/web-products" class="discover-btn">
                    Descubrir
                </router-link>
            </div>

            <!-- <div class="brand-logo">
                <img :src="brandLogo" alt="Brand Logo" />
            </div> -->
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

const product = ref(products.value?.find(p => p.brand === 'Default'));

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

/*onMounted(() => {
    loadImageUrls();
});*/
</script>

<style scoped>
.promo-banner-section {
    margin: 40px 0;
}

.promo-banner {
    position: relative;
    height: 600px;
    background: url('/IMG_9395.png') center/cover;
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

.banner-content {
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.main-text {
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    margin-bottom: 30px;
}

.discover-btn {
    display: inline-block;
    background: white;
    color: black;
    padding: 15px 40px;
    border-radius: 30px;
    font-size: 1.2rem;
    font-weight: bold;
    text-decoration: none;
    transition: all 0.3s ease;
    text-transform: uppercase;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.discover-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
    background: #f0f0f0;
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

.brand-logo {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 200px;
    transition: width 0.3s ease;
}

.brand-logo img {
    width: 100%;
    height: auto;
    object-fit: contain;
}

@media (max-width: 1024px) {
    .brand-logo {
        width: 150px;
    }

    .promo-banner {
        grid-template-columns: 1fr;
        height: auto;
    }

    .product-preview {
        display: none;
    }
}

@media (max-width: 768px) {
    .brand-logo {
        width: 100px;
        top: 15px;
        right: 15px;
    }

    .title {
        font-size: 2rem;
    }

    .subtitle {
        font-size: 1.8rem;
    }

    .discover-btn {
        padding: 12px 30px;
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .brand-logo {
        width: 80px;
        top: 10px;
        right: 10px;
    }
}
</style>