<template>
    <div class="dashboard">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <h3>Ventas Totales</h3>
                    <DollarSignIcon :size="24" />
                </div>
                <p class="stat-value">$45,678</p>
                <p class="stat-change positive">+12.5% vs mes anterior</p>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <h3>Pedidos</h3>
                    <PackageIcon :size="24" />
                </div>
                <p class="stat-value">234</p>
                <p class="stat-change positive">+8.3% vs mes anterior</p>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <h3>Clientes Nuevos</h3>
                    <UsersIcon :size="24" />
                </div>
                <p class="stat-value">56</p>
                <p class="stat-change negative">-2.1% vs mes anterior</p>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <h3>Productos Activos</h3>
                    <LayoutGridIcon :size="24" />
                </div>
                <p class="stat-value">1,245</p>
                <p class="stat-change positive">+5.7% vs mes anterior</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DollarSignIcon, PackageIcon, UsersIcon, LayoutGridIcon } from 'lucide-vue-next'
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
</style>