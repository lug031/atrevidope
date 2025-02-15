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
                                <div class="item-image">
                                    <img :src="productImages[item.productID] || '/api/placeholder/60/60'"
                                        :alt="getProductName(item.productID)" class="product-img" />
                                </div>
                                <div class="quantity-badge">
                                    {{ item.quantity }}
                                </div>
                                <div class="item-details">
                                    <span class="item-name"
                                        v-html="truncateProductName(getProductName(item.productID))"></span>
                                    <span class="item-brand">{{ getProductBrand(item.productID) }}</span>
                                    <div class="price-info">
                                        <div class="price-group">
                                            <span class="original-price" v-if="hasDiscount(item.productID)">
                                                S/. {{ getOriginalPrice(item.productID)?.toFixed(2) }}
                                            </span>
                                            <span class="current-price">S/. {{ item.price.toFixed(2) }}</span>
                                        </div>
                                        <span class="discount-badge" v-if="hasDiscount(item.productID)">
                                            -{{ getDiscountPercentage(item.productID) }}%
                                        </span>
                                    </div>
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
                    <div class="whatsapp-button-container">
                        <button @click="openWhatsapp(order)" class="button primary whatsapp-button">
                            <MessageCircle class="icon" /> Enviar pedido por WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useOrders } from '@/composables/useOrders';
import { useAuthStore } from '@/stores/auth';
import { useProducts } from '@/composables/useProducts';
import { storeToRefs } from 'pinia';
import type { Order, OrderStatus } from '@/types/order.types';
import type { Product } from '@/types/product.types';
import MainLayout from '@/layouts/MainLayout.vue';
import { MessageCircle } from 'lucide-vue-next';
import { getUrl } from 'aws-amplify/storage';

const auth = useAuthStore();
const { isAuthenticated, userEmail } = storeToRefs(auth);
const { products, loadProducts } = useProducts();
const { loading, error, getUserOrders } = useOrders();

const orders = ref<Order[]>([]);
const productImages = ref<Record<string, string>>({});
const orderProducts = ref<Record<string, Product>>({});

const currentUserEmail = computed(() => {
    if (isAuthenticated.value) {
        return userEmail.value;
    }
    return localStorage.getItem('userEmail') || '';
});

const getOrderCardClass = (status: OrderStatus) => {
    return `order-card-${status}`;
};

const loadProductImages = async () => {
    for (const order of orders.value) {
        for (const item of order.items) {
            const product = products.value.find(p => p.id === item.productID);
            if (product?.imageUrl) {
                try {
                    const { url } = await getUrl({ path: product.imageUrl });
                    productImages.value[item.productID] = url.toString();
                } catch (error) {
                    console.error("Error loading product image:", error);
                }
            }
        }
    }
};

const truncateProductName = (name: string, maxLength: number = 45): string => {
    if (!name) return '';

    const boldMatch = name.match(/\*\*(.*?)\*\*/);
    if (!boldMatch) {
        return name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
    }

    const boldContent = boldMatch[1];
    const boldStart = name.indexOf('**');
    const boldEnd = boldStart + boldMatch[0].length;

    if (boldEnd > maxLength) {
        const truncatedBold = boldContent.slice(0, maxLength - 5) + '...';
        return `**${truncatedBold}**`;
    } else {
        const remainingSpace = maxLength - boldEnd;
        if (remainingSpace > 3) {
            const remaining = name.slice(boldEnd, boldEnd + remainingSpace - 3) + '...';
            return `**${boldContent}**${remaining}`;
        } else {
            return `**${boldContent}**`;
        }
    }
};

const getStatusClass = (status: OrderStatus) => {
    return `status-tag-${status}`;
};

const getStatusText = (status: OrderStatus) => {
    const statusText: Record<OrderStatus, string> = {
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

const getProductBrand = (productId: string) => {
    const product = products.value.find(p => p.id === productId);
    return product?.brand || '';
};

const hasDiscount = (productId: string) => {
    const product = products.value.find(p => p.id === productId);
    return product?.discountPercentage !== undefined && product.discountPercentage > 0;
};

const getOriginalPrice = (productId: string) => {
    const product = products.value.find(p => p.id === productId);
    return product?.originalPrice;
};

const getDiscountPercentage = (productId: string) => {
    const product = products.value.find(p => p.id === productId);
    return product?.discountPercentage || 0;
};

// Formatea el mensaje de WhatsApp para un pedido
const formatOrderWhatsAppMessage = (order: Order) => {
    const { customerInfo, items, subtotal, shipping, total } = order;
    const customerDetails =
        `*INFORMACIÓN DEL CLIENTE*\n` +
        `Nombre: ${customerInfo.firstName} ${customerInfo.lastName}\n` +
        `Email: ${customerInfo.email}\n` +
        `${customerInfo.documentType}: ${customerInfo.documentNumber}\n` +
        `Teléfono: ${customerInfo.phone}\n\n`;

    const itemsDetails = items.map((item: any) => {
        const productName = getProductName(item.productID);
        return `- ${productName} (${item.quantity}x) : S/. ${item.price.toFixed(2)}`;
    }).join('\n');

    const totalsDetails =
        `\n*TOTALES*\n` +
        `Subtotal: S/. ${subtotal.toFixed(2)}\n` +
        `Envío: ${shipping > 0 ? `S/. ${shipping.toFixed(2)}` : 'Gratis'}\n` +
        `Total: S/. ${total.toFixed(2)}`;

    return encodeURIComponent(
        `${customerDetails}` +
        `*PRODUCTOS*\n${itemsDetails}\n` +
        `${totalsDetails}`
    );
};

const openWhatsapp = (order: Order) => {
    const message = formatOrderWhatsAppMessage(order);
    const phoneNumber = '51962224044';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};

onMounted(async () => {
    if (currentUserEmail.value) {
        try {
            await loadProducts();
            const userOrders = await getUserOrders(currentUserEmail.value);
            orders.value = userOrders;
            await loadProductImages();
        } catch (err) {
            console.error('Error cargando órdenes:', err);
            orders.value = [];
        }
    }
});
</script>

<style scoped>
.orders-container {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

.whatsapp-button {
    background-color: #23ad56;
    border: none;
    color: #fff;
    padding: 10px 20px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.whatsapp-button:hover {
    background-color: #1c8844;
}

.whatsapp-button .icon {
    width: 20px;
    height: 20px;
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
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 0.5rem;
}

.item-image {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 0.375rem;
    overflow: hidden;
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

.product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
}

.item-name {
    font-weight: 500;
    color: #0f172a;
    font-size: 1rem;
}

.item-name :deep(strong) {
    font-weight: 600;
}

.item-brand {
    color: #64748b;
    font-size: 0.875rem;
}

.item-price {
    font-weight: 600;
    color: #1f2937;
    font-size: 16px;
}

.price-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.price-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.original-price {
    font-size: 0.875rem;
    color: #94a3b8;
    text-decoration: line-through;
}

.current-price {
    font-weight: 600;
    color: #0f172a;
}

.discount-badge {
    padding: 0.25rem 0.5rem;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.quantity-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background: #e0e7ff;
    color: #4f46e5;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
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