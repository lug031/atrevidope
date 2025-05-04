<template>
    <div class="orders-page">
        <!-- Header y búsqueda -->
        <div class="header-actions">
            <div class="search-filter">
                <div class="search-box">
                    <SearchIcon :size="20" class="search-icon" />
                    <input type="text" placeholder="Buscar pedidos..." class="search-input" v-model="searchQuery" />
                </div>
            </div>
            <div class="action-buttons-container">
                <!-- Botón para crear un nuevo pedido -->
                <button @click="openCreateOrderModal" class="create-button">
                    <PlusIcon :size="20" />
                </button>
                <button @click="loadOrders" class="refresh-button" :disabled="loading">
                    <RefreshCwIcon :size="20" :class="{ 'animate-spin': loading }" />
                </button>
            </div>
        </div>

        <!-- Estados de loading y error -->
        <div v-if="loading" class="loading-state">
            <Loader2Icon :size="40" class="animate-spin" />
            <p>Cargando pedidos...</p>
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
                        <span class="stat-label">Total Pedidos</span>
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
                            <!-- Encabezado de fecha sorteable -->
                            <th @click="toggleSort('createdAt')" class="sortable-header">
                                Fecha
                                <span class="sort-icon">{{ getSortIcon('createdAt') }}</span>
                            </th>
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
        <ModalOrder v-if="showDetailsModal" title="Detalles de la Orden" @close="showDetailsModal = false">
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
                                    :alt="item.productSnapshot?.name" class="item-image" />
                                <div class="item-details">
                                    <div class="item-header">
                                        <span class="item-name"
                                            v-html="truncateProductName(item.productSnapshot?.name)"></span>
                                        <span class="item-brand">{{ item.productSnapshot?.brand }}</span>
                                    </div>
                                    <div class="item-pricing">
                                        <div class="quantity-info">
                                            <span class="item-quantity">Cantidad: {{ item.quantity }}</span>
                                            <!-- Ya no mostramos stock actual -->
                                        </div>
                                        <div class="price-details">
                                            <div class="price-group">
                                                <span class="original-price" v-if="hasDiscount(item)">
                                                    S/{{ formatPrice(getOriginalPrice(item)) }}
                                                </span>
                                                <span class="current-price"
                                                    :class="{ 'promotional': hasDiscount(item) }">
                                                    S/{{ formatPrice(item.price) }}
                                                </span>
                                            </div>
                                            <span class="discount-badge" v-if="hasDiscount(item)">
                                                {{ item.productSnapshot?.promotionType === 'fixed'
                                                    ? '-S/' + (item.productSnapshot?.discountPercentage || 0).toFixed(2)
                                                : '-' + (item.productSnapshot?.discountPercentage || 0) + '%' }}
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

                    <h3>Detalles de Pago</h3>
                    <div class="pago-info">
                        <div class="detail-item">
                            <span class="label">Método de Pago:</span>
                            <span class="value">{{ selectedOrder?.paymentMethod || 'No especificado' }}</span>
                        </div>
                        <div v-if="selectedOrder?.paymentMethod === 'izipay'" class="payment-link-container">
                            <div class="payment-link-field">
                                <span class="label">Link de Pago:</span>
                                <div class="link-input-group">
                                    <input type="text" v-model="paymentLinkInput" class="payment-link-input"
                                        placeholder="Ingrese el enlace de pago"
                                        :disabled="selectedOrder?.status !== 'processing'" />
                                    <button @click="updatePaymentLink" class="update-link-button"
                                        :disabled="updateLinkLoading || selectedOrder?.status !== 'processing'">
                                        <span v-if="!updateLinkLoading">Enviar</span>
                                        <Loader2Icon v-else :size="16" class="animate-spin" />
                                    </button>
                                </div>
                                <span v-if="selectedOrder?.status !== 'processing'" class="status-warning">
                                    Solo se puede actualizar el enlace de pago cuando la orden está en proceso
                                </span>
                            </div>
                            <div v-if="selectedOrder?.linkPago" class="current-link">
                                <span class="current-link-label">Enlace actual:</span>
                                <a :href="selectedOrder.linkPago" target="_blank" class="current-link-value">
                                    {{ truncateLink(selectedOrder.linkPago) }}
                                    <ExternalLinkIcon :size="14" class="external-link-icon" />
                                </a>
                            </div>

                            <!-- Reemplazar la sección del Link Corto en la template -->
                            <!-- Reemplazar la sección del Link Corto en la template -->
                            <div class="payment-link-field">
                                <span class="label">Link Corto:</span>
                                <div v-if="selectedOrder?.linkShort" class="current-link horizontal">
                                    <a :href="selectedOrder.linkShort" target="_blank" class="current-link-value">
                                        {{ truncateLink(selectedOrder.linkShort) }}
                                        <ExternalLinkIcon :size="14" class="external-link-icon" />
                                    </a>
                                    <button @click="copyLinkToClipboard(selectedOrder.linkShort)" class="copy-button"
                                        title="Copiar al portapapeles">
                                        <ClipboardIcon :size="16" />
                                    </button>
                                </div>
                                <div v-else class="no-link-message">
                                    No hay link corto disponible
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="order-summary">
                        <div class="summary-item">
                            <span>Subtotal</span>
                            <span>S/{{ formatPrice(selectedOrder?.subtotal) }}</span>
                        </div>
                        <div v-if="selectedOrder?.paymentMethod === 'izipay'" class="summary-item">
                            <span class="summary-label">Comisión Izipay (4%)</span>
                            <span class="summary-value">S/. {{ (selectedOrder?.subtotal * 0.04).toFixed(2) }}</span>
                        </div>
                        <!-- <div class="summary-item">
                            <span>Envío</span>
                            <span>S/{{ formatPrice(selectedOrder?.shipping) }}</span>
                        </div>-->
                        <div class="summary-item total">
                            <span>Total</span>
                            <span>S/{{ formatPrice(selectedOrder?.total) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </ModalOrder>
    </div>
    <StockErrorModal :show="showStockModal" :invalidProducts="stockErrorProducts" @close="showStockModal = false" />

    <!-- Modal de Creación de Pedido -->
    <CreateOrderModal :show="showCreateModal" @close="closeCreateOrderModal" @order-created="handleOrderCreated" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
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
    XIcon,
    ExternalLinkIcon,
    PlusIcon
} from 'lucide-vue-next'
import type { Order } from '@/types/order.types'
import ModalOrder from '@/components/ModalOrder.vue'
import { useToast } from '@/composables/useToast'
import { useOrderStore } from '@/stores/order';
import { useOrderValidation } from '@/composables/useOrderValidation';
import StockErrorModal from '@/components/StockErrorModal.vue'
import CreateOrderModal from '@/components/CreateOrderModal.vue'
import { ClipboardIcon } from 'lucide-vue-next';

const { orders, loading, error, loadOrders, updateOrderStatus, orderStats, getOrderDetails } = useOrders()
const { validateOrderStock } = useOrderValidation();

const { showToast } = useToast()
const showStockModal = ref(false);
interface StockErrorProduct {
    id: string;
    name: string;
    requested: number;
    available: number;
    error?: string;
}

const stockErrorProducts = ref<StockErrorProduct[]>([]);
const orderStore = useOrderStore();
const paymentLinkInput = ref('');
const updateLinkLoading = ref(false);

// Referencias para el link corto
const shortLinkInput = ref('');
const shortLinkUpdateLoading = ref(false);

const searchQuery = ref('')
const showDetailsModal = ref(false)
const selectedOrder = ref<Order | null>(null)
const productImages = ref<Record<string, string>>({})

// Estado para el modal de creación de pedidos
const showCreateModal = ref(false);

const sortField = ref<keyof Order>('createdAt')
const sortDirection = ref('desc')

const toggleSort = (field: any) => {
    if (sortField.value === field) {
        // Si ya estamos ordenando por este campo, cambiamos la dirección
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        // Si es un nuevo campo, establecemos el campo y dirección por defecto
        sortField.value = field
        sortDirection.value = 'desc' // Por defecto de más reciente a más antiguo
    }
}

const copyLinkToClipboard = async (link: any) => {
    try {
        await navigator.clipboard.writeText(link);
        showToast({
            type: 'success',
            message: 'Link copiado al portapapeles'
        });
    } catch (err) {
        console.error('Error al copiar:', err);
        showToast({
            type: 'error',
            message: 'No se pudo copiar el link'
        });
    }
};

const loadOrderProducts = async () => {
    if (!selectedOrder.value) return
    // Ya no necesitamos cargar productos existentes
}

// Función para actualizar solo el enlace corto
const updateShortLink = async () => {
    if (!selectedOrder.value?.id || !shortLinkInput.value) return;

    if (selectedOrder.value.status !== 'processing') {
        showToast({
            type: 'warning',
            message: 'Solo se puede actualizar el enlace corto cuando la orden está en proceso'
        });
        return;
    }

    shortLinkUpdateLoading.value = true;
    try {
        const updatedOrder = await orderStore.updateOrderShortLink(
            selectedOrder.value.id,
            shortLinkInput.value
        );

        // Actualizar el orden seleccionado con la información actualizada
        selectedOrder.value = updatedOrder;

        showToast({
            type: 'success',
            message: 'Enlace corto actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar el enlace corto:', error);
        showToast({
            type: 'error',
            message: 'Error al actualizar el enlace corto'
        });
    } finally {
        shortLinkUpdateLoading.value = false;
    }
};

// Función para truncar enlaces largos para mostrarlos
const truncateLink = (link: string, maxLength: number = 40): string => {
    if (!link) return '';
    if (link.length <= maxLength) return link;

    return link.substring(0, maxLength) + '...';
};

const isPromotionActive = (item: any) => {
    if (!item.productSnapshot?.isPromoted ||
        !item.productSnapshot?.promotionStartDate ||
        !item.productSnapshot?.promotionEndDate) {
        return false;
    }

    const today = getCurrentPeruDate();
    return today >= item.productSnapshot.promotionStartDate &&
        today <= item.productSnapshot.promotionEndDate;
};

const getCurrentPeruDate = () => {
    const date = new Date();
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));

    const year = peruDate.getFullYear();
    const month = String(peruDate.getMonth() + 1).padStart(2, '0');
    const day = String(peruDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const hasDiscount = (item: any) => {
    return isPromotionActive(item) && item.productSnapshot?.discountPercentage > 0;
};

const getOriginalPrice = (item: any) => {
    if (hasDiscount(item)) {
        return item.productSnapshot?.originalPrice;
    }
    return null;
};

const getDiscountPercentage = (item: any) => {
    if (hasDiscount(item)) {
        // Si es un descuento de tipo fijo, calculamos el porcentaje equivalente
        if (item.productSnapshot?.promotionType === 'fixed') {
            const originalPrice = item.productSnapshot?.originalPrice || 0;
            if (originalPrice <= 0) return 0;

            // Calculamos qué porcentaje representa el monto fijo sobre el precio original
            const fixedAmount = item.productSnapshot?.discountPercentage || 0;
            return Math.round((fixedAmount / originalPrice) * 100);
        } else {
            // Si es un descuento porcentual, retornamos el valor directamente
            return item.productSnapshot?.discountPercentage || 0;
        }
    }
    return 0;
};

const formatDiscount = (item: any) => {
    if (!hasDiscount(item)) return '';

    if (item.productSnapshot?.promotionType === 'fixed') {
        return `S/${(item.productSnapshot?.discountPercentage || 0).toFixed(2)}`;
    } else {
        return `${item.productSnapshot?.discountPercentage || 0}%`;
    }
};

const loadProductImages = async () => {
    if (!selectedOrder.value) return

    for (const item of selectedOrder.value.items) {
        if (item.productSnapshot?.imageUrl) {
            if (item.productSnapshot.imageUrl.startsWith('data:')) {
                // Si la imagen está en base64
                productImages.value[item.productID] = item.productSnapshot.imageUrl;
            } else {
                // Si es una URL de S3
                try {
                    const { url } = await getUrl({ path: item.productSnapshot.imageUrl })
                    productImages.value[item.productID] = url.toString()
                } catch (error) {
                    console.error("Error loading product image:", error)
                }
            }
        }
    }
}

const filteredOrders = computed(() => {
    let result = orders.value

    // Aplicar filtro de búsqueda
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(order =>
            order.customerInfo.firstName.toLowerCase().includes(query) ||
            order.customerInfo.lastName.toLowerCase().includes(query) ||
            order.customerInfo.email.toLowerCase().includes(query) ||
            order.id?.toLowerCase().includes(query)
        )
    }

    // Aplicar ordenamiento
    if (sortField.value) {
        result = [...result].sort((a, b) => {
            let valA, valB

            // Manejar campos anidados como createdAt
            if (sortField.value === 'createdAt') {
                valA = new Date(a.createdAt || 0).getTime()
                valB = new Date(b.createdAt || 0).getTime()
            } else {
                // Para otros campos si los agregas en el futuro
                valA = a[sortField.value as keyof Order]
                valB = b[sortField.value as keyof Order]
            }

            // Comparar valores
            if (sortDirection.value === 'asc') {
                if (valA === undefined || valB === undefined) return 0;
                return valA > valB ? 1 : -1;
            } else {
                if (valA === undefined || valB === undefined) return 0;
                return valA < valB ? 1 : -1;
            }
        })
    }

    return result
})

// Función auxiliar para mostrar el indicador de dirección de ordenamiento
const getSortIcon = (field: string) => {
    if (sortField.value !== field) return null
    return sortDirection.value === 'asc' ? '↑' : '↓'
}

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

    // Inicializar los inputs con los valores existentes
    paymentLinkInput.value = order.linkPago || '';
    shortLinkInput.value = order.linkShort || '';
}

const updatePaymentLink = async () => {
    if (!selectedOrder.value?.id || !paymentLinkInput.value) return;

    if (selectedOrder.value.status !== 'processing') {
        showToast({
            type: 'warning',
            message: 'Solo se puede actualizar el enlace de pago cuando la orden está en proceso'
        });
        return;
    }

    updateLinkLoading.value = true;
    try {
        const updatedOrder = await orderStore.updateOrderPaymentLink(
            selectedOrder.value.id,
            paymentLinkInput.value
        );

        // Actualizar el orden seleccionado con la información actualizada
        selectedOrder.value = updatedOrder;

        showToast({
            type: 'success',
            message: 'Enlace de pago actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar el enlace de pago:', error);
        showToast({
            type: 'error',
            message: 'Error al actualizar el enlace de pago'
        });
    } finally {
        updateLinkLoading.value = false;
    }
};

const truncateProductName = (name: string, maxLength: number = 100): string => {
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

const updateStatus = async (orderId: any, newStatus: any) => {
    if (!orderId) return;

    // Solo validar stock cuando se cambia a completado
    if (newStatus === 'completed') {
        try {
            // Obtener la orden actual
            const order = await getOrderDetails(orderId);

            if (!order) {
                showToast({
                    type: 'error',
                    message: 'No se pudo obtener la información del pedido'
                });
                return;
            }

            // Validar stock para la orden
            const { valid, invalidProducts } = await validateOrderStock(order);

            if (!valid) {
                // Configurar y mostrar el modal
                stockErrorProducts.value = invalidProducts;
                showStockModal.value = true;
                return; // Detener el proceso de actualización
            }
        } catch (error) {
            console.error('Error al validar stock:', error);
            showToast({
                type: 'error',
                message: 'Error al validar el stock de los productos'
            });
            return;
        }
    }

    // Si todo está bien, continuar con la actualización normal
    try {
        await updateOrderStatus(orderId, newStatus);
        showToast({
            type: 'success',
            message: `Orden ${orderId.slice(-6)} actualizada a ${getStatusText(newStatus)}`
        });
    } catch (error) {
        showToast({
            type: 'error',
            message: 'Error al actualizar el estado de la orden'
        });
    }
};

// Funciones para gestionar el modal de creación de pedidos
const openCreateOrderModal = () => {
    showCreateModal.value = true;
};

const closeCreateOrderModal = () => {
    showCreateModal.value = false;
};

const handleOrderCreated = async (newOrder: Order) => {
    await loadOrders(); // Recargar la lista de pedidos
    showToast({
        type: 'success',
        message: `Pedido #${newOrder.id?.slice(-6)} creado exitosamente`
    });
};

onMounted(async () => {
    await loadOrders()
})

watch(
    () => selectedOrder.value,
    (newOrder) => {
        if (newOrder) {
            paymentLinkInput.value = newOrder.linkPago || '';
            shortLinkInput.value = newOrder.linkShort || '';
        }
    }
);
</script>

<style scoped>
.orders-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.current-link.horizontal {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
    flex-direction: row;
    /* Asegura que los elementos se muestren en línea */
}

.current-link-value {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    color: #6366f1;
    text-decoration: none;
    word-break: break-all;
    flex: 1;
}

.copy-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    /* Evita que el botón se encoja */
}

.copy-button:hover {
    background-color: #e5e7eb;
    color: #1f2937;
}

.no-link-message {
    font-size: 0.875rem;
    color: #94a3b8;
    font-style: italic;
    margin-top: 0.25rem;
}

/* Botón de crear pedido y contenedor de botones */
.action-buttons-container {
    margin-left: 1rem;
    display: flex;
    gap: 0.75rem;
}

.create-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #22c55e;
    border: none;
    border-radius: 0.375rem;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.create-button:hover {
    background-color: #16a34a;
}

/* Estilos para la sección de detalles de pago */
.payment-details {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
}

.pago-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.payment-link-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.payment-link-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.link-input-group {
    display: flex;
    gap: 0.5rem;
}

.payment-link-input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.2s;
}

.payment-link-input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
}

.update-link-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    background-color: #6366f1;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    min-width: 100px;
}

.update-link-button:hover:not(:disabled) {
    background-color: #4f46e5;
}

.update-link-button:disabled {
    background-color: #c7d2fe;
    cursor: not-allowed;
}

.current-link {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.5rem;
}

.current-link-label {
    font-size: 0.75rem;
    color: #64748b;
}

.current-link-value {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    color: #6366f1;
    text-decoration: none;
    word-break: break-all;
}

.current-link-value:hover {
    text-decoration: underline;
}

.external-link-icon {
    color: #94a3b8;
}

.status-warning {
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.25rem;
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

.current-price.promotional {
    color: #e53e3e;
}

.status-badge.completed {
    background: #dcfce7;
    color: #166534;
}

.status-badge.cancelled {
    background: #fee2e2;
    color: #991b1b;
}

/* Estilos para encabezados sorteables */
.sortable-header {
    cursor: pointer;
    user-select: none;
    position: relative;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.sortable-header:hover {
    background-color: #e5e7eb;
}

.sort-icon {
    margin-left: 0.5rem;
    font-weight: bold;
    font-size: 0.875rem;
    color: #383838;
}

/* Opcional: añadir un indicador visual para mostrar que es sorteable */
.sortable-header::after {
    content: '';
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    margin-left: 0.25rem;
    opacity: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    transition: opacity 0.2s ease;
}

.sortable-header:hover::after {
    opacity: 0.5;
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

.refresh-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #f1f5f9;
    border: none;
    border-radius: 0.375rem;
    color: #64748b;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
    background-color: #e2e8f0;
    color: #1e293b;
}

.refresh-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>