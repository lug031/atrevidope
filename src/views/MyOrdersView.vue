// views/MyOrdersView.vue
<template>
    <MainLayout>
        <div class="orders-container">
            <h1 class="text-2xl font-bold mb-6">Mis Pedidos</h1>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-8">
                <div class="loading-spinner"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg">
                {{ error }}
            </div>

            <!-- Empty State -->
            <div v-else-if="!orders.length" class="text-center py-8">
                <p class="text-gray-500">No tienes pedidos registrados</p>
                <router-link to="/products" class="text-blue-600 hover:underline mt-2 inline-block">
                    Ir a comprar
                </router-link>
            </div>

            <!-- Orders List -->
            <div v-else class="space-y-6">
                <div v-for="order in orders" :key="order.id" class="order-card bg-white rounded-lg shadow-sm p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="font-semibold text-lg">Pedido #{{ order.id?.slice(-6) }}</h3>
                            <p class="text-sm text-gray-500">
                                {{ new Date(order.createdAt!).toLocaleDateString() }}
                            </p>
                        </div>
                        <div class="status-badge" :class="getStatusClass(order.status)">
                            {{ getStatusText(order.status) }}
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div class="border-t border-b py-4 my-4">
                        <div v-for="item in order.items" :key="item.productID"
                            class="flex justify-between items-center py-2">
                            <div class="flex items-center gap-4">
                                <span class="text-gray-600">{{ item.quantity }}x</span>
                                <span>{{ getProductName(item.productID) }}</span>
                            </div>
                            <span class="font-medium">S/. {{ item.price.toFixed(2) }}</span>
                        </div>
                    </div>

                    <!-- Order Totals -->
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Subtotal</span>
                            <span>S/. {{ order.subtotal.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Envío</span>
                            <span>{{ order.shipping > 0 ? `S/. ${order.shipping.toFixed(2)}` : 'Gratis' }}</span>
                        </div>
                        <div class="flex justify-between font-semibold mt-2 pt-2 border-t">
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
import { onMounted, ref } from 'vue';
import { useOrders } from '@/composables/useOrders';
import { useAuthStore } from '@/stores/auth';
import { useProducts } from '@/composables/useProducts';
import AdminLayout from '@/layouts/AdminLayout.vue';
import type { Order, OrderStatus } from '@/types/order.types';
import MainLayout from '@/layouts/MainLayout.vue';

const auth = useAuthStore();
const { products, loadProducts } = useProducts();
const { loading, error, getUserOrders } = useOrders();

const orders = ref<Order[]>([]);

const getStatusClass = (status: OrderStatus) => {
    const classes = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    return `px-3 py-1 rounded-full text-sm ${classes[status]}`;
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

const loadOrders = async () => {
    if (!auth.userEmail) return;

    try {
        const userOrders = await getUserOrders(auth.userEmail);
        orders.value = userOrders;
    } catch (err) {
        console.error('Error cargando órdenes:', err);
    }
};

onMounted(async () => {
    await loadProducts();
    await loadOrders();
});
</script>

<style scoped>
.orders-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.order-card {
    transition: transform 0.2s;
}

.order-card:hover {
    transform: translateY(-2px);
}

.loading-spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
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