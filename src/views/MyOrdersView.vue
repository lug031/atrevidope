<template>
    <MainLayout>
        <div class="orders-container">
            <div class="orders-header">
                <h1>Mis Pedidos</h1>
            </div>

            <!-- Loading State -->
            <div v-if="loading && !orders.length" class="loading-state">
                <div class="loading-spinner"></div>
                <span>Cargando pedidos...</span>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-message">
                {{ error }}
            </div>

            <!-- Empty State -->
            <div v-else-if="!loading && !orders.length" class="empty-state">
                <p>No tienes pedidos registrados</p>
                <router-link to="/web-products" class="button-primary">
                    Ir a comprar
                </router-link>
            </div>

            <!-- Orders List -->
            <div v-else class="orders-list">
                <div v-for="order in orders" :key="order.id" class="order-card"
                    :class="getOrderCardClass(order.status)">
                    <!-- Order Header -->
                    <div class="order-header">
                        <div class="order-info">
                            <h3>Pedido #{{ order.id?.slice(-6) }}</h3>
                            <p class="order-date">
                                {{ new Date(order.createdAt!).toLocaleDateString('es-PE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) }}
                            </p>
                        </div>
                        <div class="status-tag" :class="getStatusClass(order.status)">
                            {{ getStatusText(order.status) }}
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div class="order-items">
                        <div v-for="item in order.items" :key="item.productID" class="order-item">
                            <div class="item-container">
                                <div class="quantity-badge">
                                    {{ item.quantity }}
                                </div>
                                <div class="item-details">
                                    <span class="item-name">{{ getProductName(item.productID) }}</span>
                                    <span class="item-price">S/. {{ item.price.toFixed(2) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="order-summary">
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span>S/. {{ order.subtotal.toFixed(2) }}</span>
                        </div>
                        <div class="summary-row">
                            <span>Envío</span>
                            <span>{{ order.shipping > 0 ? `S/. ${order.shipping.toFixed(2)}` : 'Gratis' }}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>S/. {{ order.total.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useOrders } from '@/composables/useOrders';
import { useAuthStore } from '@/stores/auth';
import { useProducts } from '@/composables/useProducts';
import { storeToRefs } from 'pinia';
import type { Order, OrderStatus } from '@/types/order.types';
import MainLayout from '@/layouts/MainLayout.vue';

const auth = useAuthStore();
const { isAuthenticated, userEmail } = storeToRefs(auth);
const { products, loadProducts } = useProducts();
const { loading, error, getUserOrders } = useOrders();

const orders = ref<Order[]>([]);

const currentUserEmail = computed(() => {
    if (isAuthenticated.value) {
        return userEmail.value
    }
    return localStorage.getItem('userEmail') || ''
});

const getOrderCardClass = (status: OrderStatus) => {
    return `order-card-${status}`;
};

const getStatusClass = (status: OrderStatus) => {
    return `status-tag-${status}`;
};

const getStatusText = (status: OrderStatus) => {
    const statusText = {
        pending: 'Pendiente',
        processing: 'En proceso',
        completed: 'Completado',
        cancelled: 'Cancelado'
    };
    return statusText[status];
};

const getProductName = (productId: string) => {
    const product = products.value.find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
};

onMounted(async () => {
    if (currentUserEmail.value) {
        try {
            const userOrders = await getUserOrders(currentUserEmail.value);
            orders.value = userOrders;
        } catch (err) {
            console.error('Error cargando órdenes:', err);
            orders.value = [];
        }
    }
    await loadProducts();
});
</script>

<style scoped>
.orders-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
}

.orders-header h1 {
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 32px;
}

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32px 0;
}

.loading-state span {
    margin-left: 12px;
    color: #666;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f4f6;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.error-message {
    background-color: #fef2f2;
    border: 1px solid #fee2e2;
    color: #dc2626;
    padding: 16px;
    border-radius: 8px;
}

.empty-state {
    text-align: center;
    padding: 64px 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state p {
    color: #6b7280;
    margin-bottom: 16px;
    font-size: 16px;
}

.orders-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.order-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-left-width: 6px;
    border-radius: 8px;
    padding: 32px;
    transition: all 0.3s ease;
    width: 100%;
}

.order-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.order-card-pending {
    border-left-color: #fbbf24;
}

.order-card-processing {
    border-left-color: #60a5fa;
}

.order-card-completed {
    border-left-color: #34d399;
}

.order-card-cancelled {
    border-left-color: #ef4444;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
}

.order-info h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 8px;
}

.order-date {
    font-size: 14px;
    color: #6b7280;
}

.status-tag {
    padding: 8px 20px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid;
}

.status-tag-pending {
    background-color: #fef3c7;
    color: #92400e;
    border-color: #fde68a;
}

.status-tag-processing {
    background-color: #dbeafe;
    color: #1e40af;
    border-color: #bfdbfe;
}

.status-tag-completed {
    background-color: #d1fae5;
    color: #065f46;
    border-color: #a7f3d0;
}

.status-tag-cancelled {
    background-color: #fee2e2;
    color: #991b1b;
    border-color: #fecaca;
}

.order-items {
    border-top: 1px solid #f3f4f6;
    border-bottom: 1px solid #f3f4f6;
    margin: 24px 0;
    padding: 24px 0;
}

.order-item {
    padding: 16px;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.order-item:hover {
    background-color: #f9fafb;
}

.item-container {
    display: flex;
    align-items: center;
    gap: 20px;
}

.quantity-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    background-color: #f3f4f6;
    border-radius: 8px;
    font-weight: 600;
    color: #4b5563;
}

.item-details {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-name {
    font-weight: 500;
    color: #1f2937;
    font-size: 16px;
}

.item-price {
    font-weight: 600;
    color: #1f2937;
    font-size: 16px;
}

.order-summary {
    padding-top: 24px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 15px;
    color: #6b7280;
}

.summary-row.total {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f3f4f6;
}

.button-primary {
    display: inline-block;
    padding: 12px 32px;
    background-color: #000000;
    color: white;
    border-radius: 8px;
    font-weight: 500;
    text-decoration: none;
    transition: background-color 0.2s;
}

.button-primary:hover {
    background-color: #1f2937;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>