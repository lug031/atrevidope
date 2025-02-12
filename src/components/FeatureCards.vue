<!-- FeatureCards.vue -->
<template>
    <div class="features-section">
        <div class="features-grid">
            <div v-for="(feature, index) in features" :key="index" class="feature-card"
                @click="router.push(feature.link)">
                <div class="icon-container">
                    <component :is="feature.icon" class="feature-icon" />
                </div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
    ShoppingBagIcon,
    StoreIcon,
    TruckIcon,
    PercentIcon,
    GiftIcon,
    BookOpenIcon
} from 'lucide-vue-next';

const router = useRouter();

const features = [
    {
        title: 'Compra fácil y seguro',
        description: 'Paso a paso para comprar en la web',
        icon: ShoppingBagIcon,
        link: '/how-to-buy'
    },
    {
        title: 'Tiendas Físicas',
        description: 'Conoce nuestras tiendas',
        icon: StoreIcon,
        link: '/stores'
    },
    {
        title: 'Sigue tu pedido',
        description: 'Hazle seguimiento a tu pedido',
        icon: TruckIcon,
        link: '/track-order'
    },
    {
        title: 'Promociones del mes',
        description: 'Conoce nuestros descuentos',
        icon: PercentIcon,
        link: '/promotions'
    },
    {
        title: 'Beneficios',
        description: 'Conoce todos los beneficios que tenemos para ti',
        icon: GiftIcon,
        link: '/benefits'
    },
    {
        title: 'Blog',
        description: 'Descubre tutoriales, tips y contenido exclusivo',
        icon: BookOpenIcon,
        link: '/blog'
    }
];
</script>

<style scoped>
.features-section {
    padding: 60px 20px;
    background-color: #f8f8f8;
}

.features-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
}

.feature-card {
    background-color: #fff;
    padding: 30px;
    border-radius: 12px;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.icon-container {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    background-color: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.feature-card:hover .icon-container {
    background-color: #000;
    color: #fff;
}

.feature-icon {
    width: 30px;
    height: 30px;
}

.feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: #000;
}

.feature-description {
    font-size: 0.875rem;
    color: #666;
    line-height: 1.5;
}

@media (max-width: 768px) {
    .features-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }

    .feature-card {
        padding: 20px;
    }
}
</style>