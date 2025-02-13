<template>
    <div class="dashboard">
        <div class="stats-grid">
            <div class="stat-card disabled">
                <div class="stat-header">
                    <h3>Ventas Totales</h3>
                    <DollarSignIcon :size="24" />
                </div>
                <p class="stat-value">$0</p>
                <p class="stat-change positive">+0% vs mes anterior</p>
            </div>

            <div class="stat-card disabled">
                <div class="stat-header">
                    <h3>Pedidos</h3>
                    <PackageIcon :size="24" />
                </div>
                <p class="stat-value">0</p>
                <p class="stat-change positive">+0% vs mes anterior</p>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <h3>Productos Activos</h3>
                    <LayoutGridIcon :size="24" />
                </div>
                <p class="stat-value">{{ activeProductsCount }}</p>
                <p class="stat-change" :class="getChangeClass(activeProductsChange)">
                    {{ formatChange(activeProductsChange) }} vs mes anterior
                </p>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <h3>Productos en Promoción</h3>
                    <TagIcon :size="24" />
                </div>
                <p class="stat-value">{{ promotionalProductsCount }}</p>
                <div class="promotion-details">
                    <span class="upcoming-promotions">
                        {{ upcomingPromotionsCount }} próximas
                    </span>
                    <span class="active-promotions">
                        {{ currentPromotionsCount }} activas
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
    DollarSignIcon,
    PackageIcon,
    UsersIcon,
    LayoutGridIcon,
    TagIcon
} from 'lucide-vue-next'
import { useProducts } from '@/composables/useProducts'

const { products, loadProducts } = useProducts()

// Productos activos
const activeProductsCount = computed(() => {
    return products.value?.filter(product => product.active).length || 0
})

// Cambio en productos activos (simulado por ahora)
const activeProductsChange = ref(5.7)

// Productos en promoción
const promotionalProductsCount = computed(() => {
    return products.value?.filter(product => product.isPromoted).length || 0
})

// Promociones próximas
const upcomingPromotionsCount = computed(() => {
    const today = getCurrentPeruDate()
    return products.value?.filter(product =>
        product.isPromoted &&
        product.promotionStartDate &&
        product.promotionStartDate > today
    ).length || 0
})

// Promociones activas
const currentPromotionsCount = computed(() => {
    const today = getCurrentPeruDate()
    return products.value?.filter(product =>
        product.isPromoted &&
        product.promotionStartDate &&
        product.promotionEndDate &&
        product.promotionStartDate <= today &&
        product.promotionEndDate >= today
    ).length || 0
})

const getCurrentPeruDate = (): string => {
    const date = new Date();
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));

    const year = peruDate.getFullYear();
    const month = String(peruDate.getMonth() + 1).padStart(2, '0');
    const day = String(peruDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getChangeClass = (change: number): string => {
    return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
}

const formatChange = (change: number): string => {
    const prefix = change > 0 ? '+' : ''
    return `${prefix}${change.toFixed(1)}%`
}

onMounted(async () => {
    await loadProducts()
})
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.stat-header h3 {
    font-size: 1rem;
    font-weight: 500;
    color: #666;
    margin: 0;
}

.stat-value {
    font-size: 1.875rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0.5rem 0;
}

.stat-change {
    font-size: 0.875rem;
    margin: 0;
}

.stat-change.positive {
    color: #10b981;
}

.stat-change.negative {
    color: #ef4444;
}

.stat-change.neutral {
    color: #9ca3af;
}

.promotion-details {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.5rem;
}

.upcoming-promotions {
    color: #f59e0b;
}

.active-promotions {
    color: #10b981;
}

.stat-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f5f5f5;
    pointer-events: none;
}

.stat-card.disabled .stat-header h3,
.stat-card.disabled .stat-value,
.stat-card.disabled .stat-change {
    color: #999;
}

.stat-card.disabled:hover {
    transform: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>