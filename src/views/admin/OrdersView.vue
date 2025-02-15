<template>
    <div class="orders-page">
        <!-- Header y búsqueda -->
        <div class="header-actions">
            <div class="search-filter">
                <div class="search-box">
                    <SearchIcon :size="20" class="search-icon" />
                    <input type="text" placeholder="Buscar órdenes..." class="search-input" v-model="searchQuery" />
                </div>
            </div>
        </div>

        <!-- Estados de loading y error -->
        <div v-if="loading" class="loading-state">
            <Loader2Icon :size="40" class="animate-spin" />
            <p>Cargando órdenes...</p>
        </div>

        <div v-else-if="error" class="error-state">
            <AlertCircleIcon :size="40" class="text-red-500" />
            <p>{{ error }}</p>
            <button @click="loadOrders" class="retry-button">
                <RefreshCwIcon :size="20" />
                Intentar de nuevo
            </button>
        </div>

        <div v-else>
            <!-- Estadísticas -->
            <div class="stats-grid">
                <div class="stat-card">
                    <PackageIcon :size="24" class="stat-icon" />
                    <div class="stat-info">
                        <span class="stat-label">Total Órdenes</span>
                        <span class="stat-value">{{ orderStats.total }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <ClockIcon :size="24" class="stat-icon pending" />
                    <div class="stat-info">
                        <span class="stat-label">Pendientes</span>
                        <span class="stat-value">{{ orderStats.pending }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <CheckCircleIcon :size="24" class="stat-icon completed" />
                    <div class="stat-info">
                        <span class="stat-label">Completadas</span>
                        <span class="stat-value">{{ orderStats.completed }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <DollarSignIcon :size="24" class="stat-icon revenue" />
                    <div class="stat-info">
                        <span class="stat-label">Ingresos Totales</span>
                        <span class="stat-value">S/{{ formatPrice(orderStats.totalRevenue) }}</span>
                    </div>
                </div>
            </div>

            <!-- Tabla de órdenes -->
            <div class="table-container">
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>ID Orden</th>
                            <th>Cliente</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="order in filteredOrders" :key="order.id">
                            <td>
                                <span class="order-id">#{{ order.id?.slice(-6) }}</span>
                            </td>
                            <td>
                                <div class="customer-info">
                                    <span class="customer-name">
                                        {{ order.customerInfo.firstName }} {{ order.customerInfo.lastName }}
                                    </span>
                                    <span class="customer-email">{{ order.customerInfo.email }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="order-items">
                                    <span class="items-count">{{ order.items.length }} items</span>
                                    <button @click="showOrderDetails(order)" class="view-details-btn">
                                        Ver detalles
                                    </button>
                                </div>
                            </td>
                            <td>
                                <div class="order-total">
                                    <span class="total-amount">S/{{ formatPrice(order.total) }}</span>
                                    <span class="subtotal">Subtotal: S/{{ formatPrice(order.subtotal) }}</span>
                                </div>
                            </td>
                            <td>
                                <span :class="['status-badge', order.status]">
                                    {{ getStatusText(order.status) }}
                                </span>
                            </td>
                            <td>
                                <div class="order-date">
                                    <span class="date">{{ formatDate(order.createdAt) }}</span>
                                    <span class="time">{{ formatTime(order.createdAt) }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button v-if="order.status === 'pending'"
                                        @click="updateStatus(order.id, 'processing')" class="icon-button process"
                                        title="Procesar orden">
                                        <PlayIcon :size="18" />
                                    </button>
                                    <button v-if="order.status === 'processing'"
                                        @click="updateStatus(order.id, 'completed')" class="icon-button complete"
                                        title="Completar orden">
                                        <CheckIcon :size="18" />
                                    </button>
                                    <button v-if="['pending', 'processing'].includes(order.status)"
                                        @click="updateStatus(order.id, 'cancelled')" class="icon-button cancel"
                                        title="Cancelar orden">
                                        <XIcon :size="18" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal de detalles -->
        <Modal v-if="showDetailsModal" title="Detalles de la Orden" @close="showDetailsModal = false">
            <div class="order-details">
                <div class="section customer-details">
                    <h3>Información del Cliente</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="label">Nombre:</span>
                            <span class="value">{{ selectedOrder?.customerInfo.firstName }} {{
                                selectedOrder?.customerInfo.lastName }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Email:</span>
                            <span class="value">{{ selectedOrder?.customerInfo.email }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Teléfono:</span>
                            <span class="value">{{ selectedOrder?.customerInfo.phone }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Documento:</span>
                            <span class="value">{{ selectedOrder?.customerInfo.documentType }} {{
                                selectedOrder?.customerInfo.documentNumber }}</span>
                        </div>
                    </div>
                </div>

                <div class="section items-details">
                    <h3>Items de la Orden</h3>
                    <div class="items-list">
                        <div v-for="item in selectedOrder?.items" :key="item.productID" class="order-item">
                            <div class="item-info">
                                <img :src="productImages[item.productID] || '/api/placeholder/60/60'"
                                    :alt="orderProducts[item.productID]?.name" class="item-image" />
                                <div class="item-details">
                                    <div class="item-header">
                                        <span class="item-name"
                                            v-html="truncateProductName(orderProducts[item.productID]?.name)"></span>
                                        <span class="item-brand">{{ orderProducts[item.productID]?.brand }}</span>
                                    </div>
                                    <div class="item-pricing">
                                        <div class="quantity-info">
                                            <span class="item-quantity">Cantidad: {{ item.quantity }}</span>
                                            <span class="stock-info" v-if="orderProducts[item.productID]">
                                                Stock disponible: {{ orderProducts[item.productID].stock }}
                                            </span>
                                        </div>
                                        <div class="price-details">
                                            <div class="price-group">
                                                <span class="original-price"
                                                    v-if="orderProducts[item.productID]?.originalPrice !== item.price">
                                                    S/{{ formatPrice(orderProducts[item.productID]?.originalPrice) }}
                                                </span>
                                                <span class="current-price">S/{{ formatPrice(item.price) }}</span>
                                            </div>
                                            <span class="discount-badge"
                                                v-if="orderProducts[item.productID]?.discountPercentage > 0">
                                                -{{ orderProducts[item.productID]?.discountPercentage }}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="item-total">
                                <span class="total-label">Subtotal</span>
                                <span class="total-amount">S/{{ formatPrice(item.subtotal) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="order-summary">
                        <div class="summary-item">
                            <span>Subtotal</span>
                            <span>S/{{ formatPrice(selectedOrder?.subtotal) }}</span>
                        </div>
                        <div class="summary-item">
                            <span>Envío</span>
                            <span>S/{{ formatPrice(selectedOrder?.shipping) }}</span>
                        </div>
                        <div class="summary-item total">
                            <span>Total</span>
                            <span>S/{{ formatPrice(selectedOrder?.total) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getUrl } from 'aws-amplify/storage'
import { useProducts } from '@/composables/useProducts'
import type { Product } from '@/types/product.types'
import { useOrders } from '@/composables/useOrders'
import {
    SearchIcon,
    Loader2Icon,
    AlertCircleIcon,
    RefreshCwIcon,
    PackageIcon,
    ClockIcon,
    CheckCircleIcon,
    DollarSignIcon,
    PlayIcon,
    CheckIcon,
    XIcon
} from 'lucide-vue-next'
import type { Order } from '@/types/order.types'
import Modal from '@/components/Modal.vue'
import { useToast } from '@/composables/useToast'

const {
    orders,
    loading,
    error,
    loadOrders,
    updateOrderStatus,
    orderStats
} = useOrders()

const { showToast } = useToast()

const searchQuery = ref('')
const showDetailsModal = ref(false)
const selectedOrder = ref<Order | null>(null)
const orderProducts = ref<Record<string, Product>>({})
const productImages = ref<Record<string, string>>({})

const { products, loadProducts } = useProducts()

const loadOrderProducts = async () => {
    if (!selectedOrder.value) return

    // Si los productos no están cargados, cargarlos primero
    if (products.value.length === 0) {
        await loadProducts()
    }

    // Asociar productos con items de la orden
    selectedOrder.value.items.forEach(item => {
        const product = products.value.find(p => p.id === item.productID)
        if (product) {
            orderProducts.value[item.productID] = product
        }
    })
}

const loadProductImages = async () => {
    if (!selectedOrder.value) return

    for (const item of selectedOrder.value.items) {
        const product = orderProducts.value[item.productID]
        if (product?.imageUrl) {
            try {
                const { url } = await getUrl({ path: product.imageUrl })
                productImages.value[item.productID] = url.toString()
            } catch (error) {
                console.error("Error loading product image:", error)
            }
        }
    }
}

const filteredOrders = computed(() => {
    if (!searchQuery.value) return orders.value

    const query = searchQuery.value.toLowerCase()
    return orders.value.filter(order =>
        order.customerInfo.firstName.toLowerCase().includes(query) ||
        order.customerInfo.lastName.toLowerCase().includes(query) ||
        order.customerInfo.email.toLowerCase().includes(query) ||
        order.id?.toLowerCase().includes(query)
    )
})

const formatPrice = (price?: number) => {
    return price?.toFixed(2) ?? '0.00'
}

const formatDate = (date?: string | Date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const formatTime = (date?: string | Date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getStatusText = (status: Order['status']) => {
    const statusMap = {
        pending: 'Pendiente',
        processing: 'En Proceso',
        completed: 'Completada',
        cancelled: 'Cancelada'
    }
    return statusMap[status]
}

const showOrderDetails = async (order: Order) => {
    selectedOrder.value = order
    showDetailsModal.value = true
    await loadOrderProducts()
    await loadProductImages()
}

const truncateProductName = (name: string, maxLength: number = 15): string => {
    if (!name) return '';

    // Si el nombre es más corto que el máximo, devolverlo tal cual
    if (name.length <= maxLength) return name;

    // Buscar los marcadores de markdown
    const boldMatch = name.match(/\*\*(.*?)\*\*/);
    if (!boldMatch) {
        // Si no hay formato markdown, simplemente truncar
        return name.slice(0, maxLength) + '...';
    }

    // Extraer el contenido dentro de los asteriscos
    const boldContent = boldMatch[1];
    const boldStart = name.indexOf('**');
    const boldEnd = boldStart + boldMatch[0].length;

    if (boldEnd > maxLength) {
        // Si el contenido en negrita es demasiado largo, truncarlo
        const truncatedBold = boldContent.slice(0, maxLength - 5) + '...'; // -5 para los ** y ...
        return `**${truncatedBold}**`;
    } else {
        // Si hay espacio después del contenido en negrita
        const remainingSpace = maxLength - boldEnd;
        if (remainingSpace > 3) { // Si hay espacio para más texto
            const remaining = name.slice(boldEnd, boldEnd + remainingSpace - 3) + '...';
            return `**${boldContent}**${remaining}`;
        } else {
            // Si no hay suficiente espacio, solo mostrar el contenido en negrita
            return `**${boldContent}**`;
        }
    }
}

const updateStatus = async (orderId: string | undefined, newStatus: Order['status']) => {
    if (!orderId) return

    try {
        await updateOrderStatus(orderId, newStatus)
        showToast({
            type: 'success',
            message: `Orden ${orderId.slice(-6)} actualizada a ${getStatusText(newStatus)}`
        })
    } catch (error) {
        showToast({
            type: 'error',
            message: 'Error al actualizar el estado de la orden'
        })
    }
}

onMounted(async () => {
    await loadOrders()
})
</script>

<style scoped>
.orders-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Stats Section */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-icon {
    color: #6366f1;
}

.stat-icon.pending {
    color: #eab308;
}

.stat-icon.completed {
    color: #22c55e;
}

.stat-icon.revenue {
    color: #06b6d4;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-label {
    font-size: 0.875rem;
    color: #64748b;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
}

/* Header and Search */
.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.search-filter {
    display: flex;
    gap: 1rem;
    align-items: center;
    width: 100%;
}

.search-box {
    position: relative;
    flex: 1;
    min-width: 0;
}

.search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
}

.search-input {
    width: 100%;
    padding: 0.5rem 1rem 0.5rem 2.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    transition: border-color 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: #6366f1;
}

/* Table Styles */
.table-container {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
    width: 100%;
}

.orders-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1000px;
}

.orders-table th,
.orders-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.orders-table th {
    background: #f8fafc;
    font-weight: 500;
    color: #64748b;
    position: sticky;
    top: 0;
    z-index: 10;
}

.orders-table tr:hover {
    background-color: #f8fafc;
}

/* Order ID */
.order-id {
    font-family: monospace;
    font-weight: 500;
    color: #6366f1;
}

/* Customer Info */
.customer-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.customer-name {
    font-weight: 500;
    color: #0f172a;
}

.customer-email {
    font-size: 0.875rem;
    color: #64748b;
}

/* Order Items */
.order-items {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.items-count {
    font-size: 0.875rem;
    color: #64748b;
}

.view-details-btn {
    padding: 0.25rem 0.5rem;
    background: #f1f5f9;
    border: none;
    border-radius: 0.25rem;
    color: #6366f1;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.view-details-btn:hover {
    background: #e2e8f0;
}

/* Order Total */
.order-total {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.total-amount {
    font-weight: 500;
    color: #0f172a;
}

.subtotal {
    font-size: 0.875rem;
    color: #64748b;
}

/* Status Badge */
.status-badge {
    display: inline-flex;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
}

.status-badge.pending {
    background: #fef9c3;
    color: #854d0e;
}

.status-badge.processing {
    background: #dbeafe;
    color: #1e40af;
}

.status-badge.completed {
    background: #dcfce7;
    color: #166534;
}

.status-badge.cancelled {
    background: #fee2e2;
    color: #991b1b;
}

/* Order Date */
.order-date {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.date {
    color: #0f172a;
}

.time {
    font-size: 0.875rem;
    color: #64748b;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.icon-button {
    padding: 0.5rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.icon-button.process {
    color: #6366f1;
    background: #e0e7ff;
}

.icon-button.process:hover {
    background: #c7d2fe;
}

.icon-button.complete {
    color: #22c55e;
    background: #dcfce7;
}

.icon-button.complete:hover {
    background: #bbf7d0;
}

.icon-button.cancel {
    color: #ef4444;
    background: #fee2e2;
}

.icon-button.cancel:hover {
    background: #fecaca;
}

/* Loading State */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    gap: 1rem;
}

/* Error State */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    gap: 1rem;
}

.retry-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.retry-button:hover {
    background: #dc2626;
}

/* Order Details Modal */
.order-details {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.section h3 {
    color: #0f172a;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-item .label {
    font-size: 0.875rem;
    color: #64748b;
}

.detail-item .value {
    color: #0f172a;
    font-weight: 500;
}

.items-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
}

.order-item:hover {
    background: #f1f5f9;
}

.item-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.item-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 0.375rem;
    background: #e2e8f0;
}

.item-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
}

.item-name {
    font-weight: 500;
    color: #0f172a;
}

.item-pricing {
    display: block;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.item-quantity {
    font-size: 0.875rem;
    color: #64748b;
}

.price-details {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.original-price {
    font-size: 0.875rem;
    color: #94a3b8;
    text-decoration: line-through;
}

.current-price {
    font-weight: 500;
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

.item-total {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    min-width: 120px;
}

.total-label {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
}

.total-amount {
    font-weight: 600;
    color: #0f172a;
}

.order-summary {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    color: #64748b;
}

.summary-item.total {
    font-weight: 600;
    color: #0f172a;
    font-size: 1.125rem;
    padding-top: 0.75rem;
    border-top: 1px dashed #e2e8f0;
}

/* Responsive Styles */
@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(100%, 1fr));
    }

    .search-filter {
        flex-direction: column;
        width: 100%;
        gap: 0.5rem;
    }

    .search-box {
        width: 100%;
    }

    .table-container {
        margin: 0 -1rem;
        width: calc(100% + 2rem);
        border-radius: 0;
    }

    .orders-table {
        min-width: 700px;
    }

    .orders-table th,
    .orders-table td {
        padding: 0.75rem;
    }

    .action-buttons {
        flex-direction: column;
    }
}
</style>