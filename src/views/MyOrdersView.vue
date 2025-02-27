<template>
    <MainLayout>
        <div class="orders-container">
            <div class="orders-header">
                <div class="header-content">
                    <h1>Mis Pedidos</h1>
                    <p v-if="!isAuthenticated" class="auth-message">
                        Para filtrar y ver tu historial completo de pedidos, inicia sesión o regístrate
                    </p>
                </div>
                <div v-if="isAuthenticated" class="filter-container">
                    <select v-model="selectedStatus" class="status-filter" @change="filterOrders" :disabled="loading">
                        <option value="all">Todos los pedidos</option>
                        <option value="pending">Pendientes</option>
                        <option value="processing">En proceso</option>
                        <option value="completed">Completados</option>
                        <option value="cancelled">Cancelados</option>
                    </select>
                    <div v-if="loading" class="filter-loading">
                        <Loader2Icon :size="16" class="animate-spin" />
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading && !filteredOrders.length" class="loading-state">
                <div class="loading-spinner"></div>
                <span>Cargando pedidos...</span>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-message">
                {{ error }}
            </div>

            <!-- Empty State -->
            <div v-else-if="!loading && !filteredOrders.length" class="empty-state">
                <p>No tienes pedidos {{ getEmptyStateMessage }}</p>
                <router-link v-if="selectedStatus === 'pending' || selectedStatus === 'all'" to="/web-products"
                    class="button-primary">
                    Ir a comprar
                </router-link>
            </div>

            <!-- Orders List -->
            <div v-else class="orders-list">
                <div v-for="order in filteredOrders" :key="order.id" class="order-card"
                    :class="getOrderCardClass(order.status)">
                    <!-- Order Header -->
                    <div class="order-header">
                        <div class="order-info">
                            <h3>Pedido #{{ order.id?.slice(-6) }}</h3>
                            <p class="order-date">
                                {{ new Date(order.createdAt!).toLocaleString('es-PE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
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
                                        :alt="getProductName(item)" class="product-img" />
                                </div>
                                <div class="quantity-badge">
                                    {{ item.quantity }}
                                </div>
                                <div class="item-details">
                                    <span class="item-name" v-html="truncateProductName(getProductName(item))"></span>
                                    <span class="item-brand">{{ getProductBrand(item) }}</span>
                                    <div class="price-info">
                                        <div class="price-group">
                                            <span class="original-price" v-if="hasDiscount(item)">
                                                S/. {{ getOriginalPrice(item)?.toFixed(2) }}
                                            </span>
                                            <span class="current-price">S/. {{ item.price.toFixed(2) }}</span>
                                        </div>
                                        <span class="discount-badge" v-if="hasDiscount(item)">
                                            -{{ getDiscountPercentage(item) }}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Information Section -->
                    <div class="payment-info-section" v-if="order.status !== 'cancelled'">
                        <div class="payment-header">
                            <div class="payment-title">
                                <CreditCardIcon :size="18" />
                                <h4>Información de pago</h4>
                            </div>
                            <div class="payment-method" v-if="order.paymentMethod">
                                <span class="method-label">Método:</span>
                                <div class="payment-method-display">
                                    <!-- Para tarjeta, mostrar nombre e icono -->
                                    <template v-if="order.paymentMethod === 'tarjeta'">
                                        <span class="method-value">Tarjeta</span>
                                        <div class="method-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                                <line x1="2" y1="10" x2="22" y2="10" />
                                            </svg>
                                        </div>
                                    </template>

                                    <!-- Para Yape, mostrar solo imagen -->
                                    <div v-else-if="order.paymentMethod === 'yape'" class="method-icon-container yape">
                                        <img src="/yape-icon.png" alt="Yape" class="method-icon-img" />
                                    </div>

                                    <!-- Para Plin, mostrar solo imagen -->
                                    <div v-else-if="order.paymentMethod === 'plin'" class="method-icon-container plin">
                                        <img src="/plin-icon.png" alt="Plin" class="method-icon-img" />
                                    </div>

                                    <!-- Para QR, mostrar solo imagen -->
                                    <div v-else-if="order.paymentMethod === 'qr'" class="method-icon-container qr">
                                        <img src="/qr-icon.png" alt="QR" class="method-icon-img" />
                                    </div>

                                    <!-- Para otros métodos no contemplados, mostrar nombre -->
                                    <span v-else class="method-value">{{ order.paymentMethod }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Pending Order Payment Message -->
                        <div v-if="order.status === 'pending'" class="payment-message pending">
                            <AlertCircleIcon :size="16" class="message-icon" />
                            <p>Su solicitud de link de pago ha sido generada. En breve nuestro equipo procesará su
                                pedido.</p>
                        </div>

                        <!-- Processing Order Payment Message -->
                        <div v-if="order.status === 'processing'" class="payment-status">
                            <div v-if="!order.linkPago" class="payment-message processing">
                                <Loader2Icon :size="16" class="message-icon animate-spin" />
                                <p>Su link de pago se está generando, pronto estará disponible.</p>
                            </div>

                            <div v-else class="payment-link-container">
                                <div class="payment-link-ready">
                                    <CheckCircleIcon :size="16" class="message-icon success" />
                                    <p>¡Su link de pago está listo! Haga clic en el botón para realizar el pago.</p>
                                </div>
                                <a :href="formatPaymentLink(order.linkPago)" target="_blank" class="payment-button">
                                    <CreditCardIcon :size="16" />
                                    Realizar pago
                                    <ArrowRightIcon :size="16" />
                                </a>
                            </div>
                        </div>

                        <!-- Completed Order Payment Message -->
                        <div v-if="order.status === 'completed'" class="payment-status">
                            <div class="payment-message completed">
                                <CheckCircleIcon :size="16" class="message-icon success" />
                                <p>Pago completado con éxito.</p>
                            </div>

                            <div v-if="order.linkPago" class="inactive-payment-link">
                                <span class="inactive-link-label">Referencia de pago:</span>
                                <span class="inactive-link-value">{{
                                    truncatePaymentLink(formatPaymentLink(order.linkPago)) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="payment-info-section cancelled" v-else>
                        <div class="payment-header">
                            <div class="payment-title">
                                <CreditCardIcon :size="18" />
                                <h4>Información de pago</h4>
                            </div>
                        </div>
                        <div class="payment-message cancelled">
                            <XCircleIcon :size="16" class="message-icon" />
                            <p>Este pedido ha sido cancelado. No se generará ningún enlace de pago.</p>
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

                    <div v-if="order.status === 'completed'" class="completion-message">
                        <div class="completion-main">
                            <span class="completion-icon">✨</span>
                            <p>¡Gracias por tu compra! Esperamos que disfrutes tus productos</p>
                        </div>
                        <div class="social-message">
                            <p>No olvides seguirnos en nuestras redes sociales</p>
                            <div class="social-links">
                                <a href="https://www.instagram.com/atrevido.pe" target="_blank"
                                    rel="noopener noreferrer" class="social-link">
                                    <InstagramIcon :size="20" />
                                </a>
                                <a href="https://www.tiktok.com/@atrevido.pe" target="_blank" rel="noopener noreferrer"
                                    class="social-link">
                                    <div class="tiktok-icon">
                                        <svg viewBox="0 0 24 24" width="20" height="20">
                                            <g fill="currentColor">
                                                <path
                                                    d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                            </g>
                                        </svg>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="order.status === 'processing'" class="processing-message">
                        <!-- <div class="processing-content">
                            <Loader2Icon :size="24" class="processing-icon" />
                            <div class="message-content">
                                <h4>¡Hemos recibido tu orden!</h4>
                                <p>Estamos preparando tu orden, nos comunicaremos contigo al numero/correo que
                                    ingresaste.</p>
                            </div>
                        </div> -->
                        <div class="estimated-time">
                            <ClockIcon :size="16" />
                            <span>Tiempo estimado de respuesta: 30min - 1hora</span>
                        </div>
                    </div>

                    <div class="whatsapp-button-container" v-if="order.status === 'pending'">
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useOrders } from '@/composables/useOrders';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import type { Order, OrderStatus } from '@/types/order.types';
import type { Product } from '@/types/product.types';
import MainLayout from '@/layouts/MainLayout.vue';
import {
    MessageCircle,
    Instagram as InstagramIcon,
    Facebook as FacebookIcon,
    Youtube as YoutubeIcon,
    Twitter as TwitterIcon,
    Loader2Icon, ClockIcon,
    CreditCardIcon,
    AlertCircleIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    XCircleIcon
} from 'lucide-vue-next';
import { getUrl } from 'aws-amplify/storage';
import { useToast } from '@/composables/useToast'

const auth = useAuthStore();
const { isAuthenticated, userEmail } = storeToRefs(auth);
const { getUserOrders } = useOrders();
const { showToast } = useToast()
const pollingOrderIds = ref<Set<string>>(new Set());
const POLLING_INTERVAL = 15000;
const selectedStatus = ref<string>('all');
const orders = ref<Order[]>([]);
const productImages = ref<Record<string, string>>({});
const orderProducts = ref<Record<string, Product>>({});
const loading = ref(true);
const error = ref<string | null>(null);

const truncatePaymentLink = (link: string, maxLength: number = 30): string => {
    if (!link) return '';
    if (link.length <= maxLength) return link;

    // Extrae el dominio principal para mejor legibilidad
    try {
        const url = new URL(link);
        return url.hostname + '/...';
    } catch (e) {
        // Si no es una URL válida, simplemente trunca
        return link.substring(0, maxLength) + '...';
    }
};

const startPaymentLinkPolling = () => {
    // Detener cualquier intervalo existente
    stopPaymentLinkPolling();

    // Filtrar órdenes en proceso que no tienen enlace de pago
    const processingOrdersWithoutLink = orders.value.filter(
        order => order.status === 'processing' && !order.linkPago && order.id
    );

    // Si no hay órdenes para consultar, no hacer nada
    if (processingOrdersWithoutLink.length === 0) return;

    // Añadir IDs al conjunto de consulta
    processingOrdersWithoutLink.forEach(order => {
        if (order.id) pollingOrderIds.value.add(order.id);
    });

    // Iniciar intervalo de consulta
    const intervalId = setInterval(checkPaymentLinks, POLLING_INTERVAL);

    // Almacenar el ID del intervalo para poder detenerlo después
    (window as any).paymentLinkPollingId = intervalId;
};

const stopPaymentLinkPolling = () => {
    if ((window as any).paymentLinkPollingId) {
        clearInterval((window as any).paymentLinkPollingId);
        (window as any).paymentLinkPollingId = null;
    }
};

const formatPaymentLink = (link: string): string => {
    if (!link) return '#';

    // Si el enlace ya comienza con http:// o https://, devolverlo tal cual
    if (link.startsWith('http://') || link.startsWith('https://')) {
        return link;
    }

    // Si comienza con www. o es otro tipo de dominio, añadir https://
    return `https://${link}`;
};

const checkPaymentLinks = async () => {
    if (pollingOrderIds.value.size === 0) {
        stopPaymentLinkPolling();
        return;
    }

    try {
        // Obtener las órdenes actualizadas
        const refreshedOrders = await getUserOrders(currentUserEmail.value || '');

        // Verificar si alguna orden ha recibido su enlace de pago o ha cambiado de estado
        let updatesFound = false;

        refreshedOrders.forEach(order => {
            if (order.id && pollingOrderIds.value.has(order.id)) {
                // Si la orden tiene enlace de pago o ha sido cancelada, dejar de consultarla
                if (order.linkPago || order.status === 'cancelled' || order.status === 'completed') {
                    pollingOrderIds.value.delete(order.id);
                    updatesFound = true;

                    // Si fue cancelada, mostrar notificación al usuario
                    if (order.status === 'cancelled') {
                        showCancellationNotification(order);
                    }
                }
            }
        });

        // Si hubo actualizaciones, actualizar la lista de órdenes
        if (updatesFound) {
            orders.value = refreshedOrders;
            await loadProductImages();
        }

        // Si no quedan órdenes por consultar, detener el polling
        if (pollingOrderIds.value.size === 0) {
            stopPaymentLinkPolling();
        }
    } catch (error) {
        console.error('Error al consultar enlaces de pago:', error);
    }
};

const showCancellationNotification = (order: Order) => {
    // Si tienes un sistema de notificaciones, úsalo aquí
    // Por ejemplo, usando el hook useToast que ya parece estar en uso
    if (typeof showToast === 'function') {
        showToast({
            type: 'warning',
            message: `El pedido #${order.id?.slice(-6)} ha sido cancelado.`
        });
    } else {
        // Fallback a una alerta simple si no hay sistema de notificaciones
        alert(`El pedido #${order.id?.slice(-6)} ha sido cancelado.`);
    }
};

const filteredOrders = computed(() => {
    if (selectedStatus.value === 'all') {
        return orders.value;
    }
    return orders.value.filter(order => order.status === selectedStatus.value);
});

const getEmptyStateMessage = computed(() => {
    if (selectedStatus.value === 'all') {
        return 'registrados';
    }
    const statusMessages = {
        pending: 'pendientes',
        processing: 'en proceso',
        completed: 'completados',
        cancelled: 'cancelados'
    };
    return statusMessages[selectedStatus.value as OrderStatus] || 'registrados';
});

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
            if (item.productSnapshot?.imageUrl) {
                // Si la imagen está en base64
                if (item.productSnapshot.imageUrl.startsWith('data:')) {
                    productImages.value[item.productID] = item.productSnapshot.imageUrl;
                } else {
                    // Si es una URL de S3
                    try {
                        const { url } = await getUrl({ path: item.productSnapshot.imageUrl });
                        productImages.value[item.productID] = url.toString();
                    } catch (error) {
                        console.error("Error loading product image:", error);
                    }
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

/*const getProductName = (productId: string) => {
    const product = products.value.find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
};*/

const getProductName = (item: any) => {
    return item.productSnapshot?.name || 'Producto no encontrado';
};

/*const getProductBrand = (productId: string) => {
    const product = products.value.find(p => p.id === productId);
    return product?.brand || '';
};*/

const getProductBrand = (item: any) => {
    return item.productSnapshot?.brand || '';
};

/*const hasDiscount = (productId: string) => {
    const product = products.value.find(p => p.id === productId);
    return product?.discountPercentage !== undefined && product.discountPercentage > 0;
};*/

const hasDiscount = (item: any) => {
    return item.productSnapshot?.discountPercentage > 0;
};

/*const getOriginalPrice = (productId: string) => {
    const product = products.value.find(p => p.id === productId);
    return product?.originalPrice;
};*/

const getOriginalPrice = (item: any) => {
    return item.productSnapshot?.originalPrice;
};

/*const getDiscountPercentage = (productId: string) => {
    const product = products.value.find(p => p.id === productId);
    return product?.discountPercentage || 0;
};*/

const getDiscountPercentage = (item: any) => {
    return item.productSnapshot?.discountPercentage || 0;
};

// Formatea el mensaje de WhatsApp para un pedido
const formatOrderWhatsAppMessage = (order: Order) => {
    console.log("order");
    console.log(order);
    const { customerInfo, items, subtotal, shipping, total } = order;
    const customerDetails =
        `*INFORMACIÓN DEL CLIENTE*\n` +
        `Nombre: ${customerInfo.firstName} ${customerInfo.lastName}\n` +
        `Email: ${customerInfo.email}\n` +
        `${customerInfo.documentType}: ${customerInfo.documentNumber}\n` +
        `Teléfono: ${customerInfo.phone}\n\n`;

    const itemsDetails = items.map((item: any) => {
        return `- ${item.productSnapshot.name} (${item.quantity}x) : S/. ${item.price.toFixed(2)}`;
    }).join('\n');

    type PaymentMethod = 'tarjeta' | 'qr' | 'plin' | 'yape';

    const paymentMethodMap: Record<PaymentMethod, string> = {
        tarjeta: 'Tarjeta de crédito/débito',
        qr: 'QR',
        plin: 'Plin',
        yape: 'Yape',
    };

    const paymentMethod = paymentMethodMap[order.paymentMethod as PaymentMethod] || order.paymentMethod;

    const totalsDetails =
        `\n*TOTALES*\n` +
        `Subtotal: S/. ${subtotal.toFixed(2)}\n` +
        `Envío: ${shipping > 0 ? `S/. ${shipping.toFixed(2)}` : 'Gratis'}\n` +
        `Total: S/. ${total.toFixed(2)}`;

    return encodeURIComponent(
        `${customerDetails}` +
        `*PRODUCTOS*\n${itemsDetails}\n\n` +
        `*MÉTODO DE PAGO*\n${paymentMethod}\n` +
        `${totalsDetails}`
    );
};

const openWhatsapp = (order: Order) => {
    const message = formatOrderWhatsAppMessage(order);
    const phoneNumber = '51934505566';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};

// Función para filtrar órdenes y refrescar datos
const filterOrders = async () => {
    // Detener cualquier consulta anterior en curso
    stopPaymentLinkPolling();

    // Resetear mensaje de error si existe
    error.value = null;

    // Mostrar estado de carga
    loading.value = true;

    try {
        // Obtener todos los pedidos actualizados
        const userOrders = await getUserOrders(currentUserEmail.value || '');

        // Actualizar la lista completa de órdenes
        orders.value = userOrders;

        // Cargar imágenes de productos
        await loadProductImages();

        // Si el filtro es "processing" o "all", iniciar el polling para enlaces de pago
        if (selectedStatus.value === 'processing' || selectedStatus.value === 'all') {
            startPaymentLinkPolling();
        }
    } catch (err) {
        console.error('Error al filtrar órdenes:', err);
        error.value = 'Hubo un error al actualizar los pedidos';
    } finally {
        loading.value = false;
    }
};

const loadOrders = async () => {
    if (!currentUserEmail.value) {
        loading.value = false;
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        const userOrders = await getUserOrders(currentUserEmail.value);
        orders.value = userOrders;
        await loadProductImages();

        // Iniciar el polling para las órdenes en proceso
        startPaymentLinkPolling();
    } catch (err) {
        //console.error('Error cargando órdenes:', err);
        error.value = 'Hubo un error al cargar los pedidos';
        orders.value = [];
    } finally {
        loading.value = false;
    }
};

onUnmounted(() => {
    // Detener el polling cuando el componente se desmonta
    stopPaymentLinkPolling();
});

onMounted(async () => {
    loadOrders();
});

watch(selectedStatus, () => {
    // Llamar a filterOrders para obtener los datos actualizados según el filtro
    filterOrders();
});
</script>

<style scoped>
.orders-container {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

.auth-message {
    color: #6B7280;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.tiktok-icon {
    display: flex;
    align-items: center;
    justify-content: center;
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

.orders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.filter-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
}

.status-filter {
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    background-color: white;
    font-size: 0.875rem;
    color: #4a5568;
    cursor: pointer;
    outline: none;
    transition: all 0.2s;
    min-width: 180px;
}

.status-filter:disabled {
    background-color: #f8fafc;
    cursor: not-allowed;
    opacity: 0.7;
}

.status-filter:hover:not(:disabled) {
    border-color: #cbd5e0;
}

.status-filter:focus:not(:disabled) {
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.filter-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a5568;
}

/*.status-filter:hover {
    border-color: #cbd5e0;
}

.status-filter:focus {
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}*/

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

.payment-info-section {
    margin-top: 1.5rem;
    padding: 1.25rem;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
}

.payment-message.cancelled {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
}

.payment-info-section.cancelled {
    background-color: #fef2f2;
    border-color: #fecaca;
}

.payment-info-section {
    margin-top: 1.5rem;
    padding: 1.25rem;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
}

.payment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.payment-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #111827;
}

.payment-title h4 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
}

.payment-method {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.method-label {
    font-size: 0.875rem;
    color: #6b7280;
}

.payment-method-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.method-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    background-color: #e5e7eb;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
}

.method-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: #4b5563;
}

.method-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 0.25rem;
    background-color: #f3f4f6;
    padding: 0.25rem;
    overflow: hidden;
}

.method-icon-container.yape {
    background-color: #f5f3ff;
}

.method-icon-container.plin {
    background-color: #eff6ff;
}

.method-icon-container.qr {
    background-color: #f3f4f6;
}

.method-icon-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.payment-message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.4;
}

.payment-message.pending {
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
}

.payment-message.processing {
    background-color: #dbeafe;
    color: #1e40af;
    border: 1px solid #bfdbfe;
}

.payment-message.completed {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
}

.message-icon {
    margin-top: 0.125rem;
}

.message-icon.success {
    color: #10b981;
}

.animate-spin {
    animation: spin 2s linear infinite;
}

.payment-status {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.payment-link-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.payment-link-ready {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem;
    border-radius: 0.375rem;
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
    font-size: 0.875rem;
    line-height: 1.4;
}

.payment-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background-color: #4f46e5;
    color: white;
    border-radius: 0.375rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
}

.payment-button:hover {
    background-color: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.inactive-payment-link {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    background-color: #f3f4f6;
    border-radius: 0.375rem;
    border: 1px dashed #d1d5db;
}

.inactive-link-label {
    font-size: 0.75rem;
    color: #6b7280;
}

.inactive-link-value {
    font-family: monospace;
    font-size: 0.875rem;
    color: #9ca3af;
}

@media (max-width: 640px) {
    .payment-method {
        margin-top: 0.5rem;
    }

    .payment-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .payment-button {
        width: 100%;
    }
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

.completion-message {
    margin-top: 1rem;
    padding: 1.5rem;
    background: linear-gradient(to right, #f0fdf4, #dcfce7);
    border-radius: 0.5rem;
    text-align: center;
    animation: fadeIn 0.5s ease-in-out;
    border: 1px solid #bbf7d0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.completion-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.completion-icon {
    font-size: 1.5rem;
    animation: sparkle 1.5s infinite;
}

.social-message {
    padding-top: 1rem;
    border-top: 1px dashed #86efac;
}

.social-message p {
    color: #059669;
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
}

.social-links {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 9999px;
    background: white;
    color: #059669;
    transition: all 0.2s ease;
}

.social-link:hover {
    transform: translateY(-2px);
    background: #059669;
    color: white;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes sparkle {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }

    100% {
        opacity: 1;
    }
}

@media (max-width: 640px) {
    .completion-message {
        padding: 1rem;
    }

    .social-links {
        gap: 0.75rem;
    }

    .social-link {
        width: 32px;
        height: 32px;
    }
}

.processing-message {
    margin-top: 1rem;
    padding: 1.5rem;
    background: linear-gradient(to right, #eff6ff, #dbeafe);
    border-radius: 0.5rem;
    animation: fadeIn 0.5s ease-in-out;
    border: 1px solid #bfdbfe;
}

.processing-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
}

.processing-icon {
    color: #3b82f6;
    animation: spin 2s linear infinite;
}

.message-content {
    flex: 1;
}

.message-content h4 {
    color: #1e40af;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
}

.message-content p {
    color: #3b82f6;
    font-size: 0.95rem;
    line-height: 1.4;
}

.estimated-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    /*padding-top: 0.75rem;
    border-top: 1px dashed #bfdbfe;*/
    color: #6b7280;
    font-size: 0.9rem;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 640px) {
    .processing-message {
        padding: 1rem;
    }

    .processing-content {
        gap: 0.75rem;
    }

    .message-content h4 {
        font-size: 1rem;
    }

    .message-content p {
        font-size: 0.9rem;
    }
}
</style>