<template>
    <MainLayout>
        <div class="orders-container">
            <!-- Encabezado con título y filtros -->
            <div class="orders-header">
                <div class="header-content">
                    <h1 class="page-title">Mis Pedidos</h1>
                    <p v-if="!isAuthenticated" class="auth-message">
                        Para filtrar y ver tu historial completo de pedidos, inicia sesión o regístrate
                    </p>
                </div>

                <div v-if="isAuthenticated" class="filter-section">
                    <div class="filter-container">
                        <label for="status-filter" class="filter-label">Filtrar por:</label>
                        <div class="select-wrapper">
                            <select id="status-filter" v-model="selectedStatus" class="status-filter"
                                @change="filterOrders" :disabled="loading">
                                <option value="all">Todos los pedidos</option>
                                <option value="pending">Pendientes</option>
                                <option value="processing">En proceso</option>
                                <option value="completed">Completados</option>
                                <option value="cancelled">Cancelados</option>
                            </select>
                            <ChevronDownIcon :size="16" class="select-icon" />
                        </div>
                        <div v-if="loading" class="filter-loading">
                            <Loader2Icon :size="16" class="animate-spin" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estados de la interfaz -->
            <!-- Estado de carga -->
            <div v-if="loading && !filteredOrders.length" class="loading-state">
                <div class="spinner-container">
                    <div class="loading-spinner"></div>
                </div>
                <span>Cargando tus pedidos...</span>
            </div>

            <!-- Estado de error -->
            <div v-else-if="error" class="error-message">
                <AlertCircleIcon :size="24" />
                <p>{{ error }}</p>
                <button @click="loadOrders" class="retry-button">
                    <RefreshCwIcon :size="16" />
                    Reintentar
                </button>
            </div>

            <!-- Estado vacío -->
            <div v-else-if="!loading && !filteredOrders.length" class="empty-state">
                <div class="empty-icon">
                    <PackageIcon :size="48" />
                </div>
                <h3>No hay pedidos {{ getEmptyStateMessage }}</h3>
                <p>Parece que aún no tienes pedidos en esta categoría</p>
                <router-link v-if="selectedStatus === 'pending' || selectedStatus === 'all'" to="/web-products"
                    class="button-primary">
                    Explorar productos
                </router-link>
            </div>

            <!-- Lista de pedidos -->
            <div v-else class="orders-list">
                <!-- Pedido colapsable -->
                <div v-for="order in filteredOrders" :key="order.id" class="order-card">
                    <!-- Cabecera del pedido (siempre visible) con toggle de colapso -->
                    <div class="order-card-header" @click="toggleOrderVisible(order.id!)">
                        <div class="order-identifier">
                            <div class="order-number-container">
                                <ShoppingBagIcon :size="20" />
                                <h3 class="order-number">Pedido #{{ order.id?.slice(-6) }}</h3>
                            </div>
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
                        <div class="order-status-section">
                            <div class="status-tag" :class="getStatusClass(order.status)">
                                <span class="status-dot"></span>
                                {{ getStatusText(order.status) }}
                            </div>
                            <button class="toggle-button order-toggle">
                                <ChevronDownIcon :size="18" :class="{ 'rotate-icon': !orderVisible[order.id!] }" />
                            </button>
                        </div>
                    </div>

                    <!-- Contenido del pedido (colapsable) -->
                    <div class="order-content" v-show="order.id && orderVisible[order.id!]">
                        <!-- Progreso del pedido para pedidos en proceso 
                        <div v-if="order.status === 'processing'" class="order-progress">
                            <div class="progress-track">
                                <div class="progress-step completed">
                                    <div class="step-icon">
                                        <CheckIcon :size="16" />
                                    </div>
                                    <div class="step-label">Pedido recibido</div>
                                </div>
                                <div class="progress-line active"></div>
                                <div class="progress-step active">
                                    <div class="step-icon">
                                        <PackageIcon :size="16" />
                                    </div>
                                    <div class="step-label">En proceso</div>
                                </div>
                                <div class="progress-line"></div>
                                <div class="progress-step">
                                    <div class="step-icon">
                                        <TruckIcon :size="16" />
                                    </div>
                                    <div class="step-label">En camino</div>
                                </div>
                                <div class="progress-line"></div>
                                <div class="progress-step">
                                    <div class="step-icon">
                                        <HomeIcon :size="16" />
                                    </div>
                                    <div class="step-label">Entregado</div>
                                </div>
                            </div>
                        </div> -->

                        <!-- Sección de productos colapsable -->
                        <div class="products-section">
                            <div class="section-header" @click.stop="toggleProductsVisible(order.id!)">
                                <h4 class="section-title">
                                    <ShoppingCartIcon :size="18" />
                                    Productos ({{ order.items.length }})
                                </h4>
                                <button class="toggle-button">
                                    <ChevronDownIcon :size="18"
                                        :class="{ 'rotate-icon': !productsVisible[order.id!] }" />
                                </button>
                            </div>

                            <!-- Lista de productos colapsable -->
                            <div class="order-items" v-show="order.id && productsVisible[order.id!]">
                                <div v-for="item in order.items" :key="item.productID" class="order-item">
                                    <!-- Indicador de cantidad movido a la izquierda -->
                                    <div class="quantity-indicator">
                                        <span class="quantity-value">{{ item.quantity }}</span>
                                    </div>

                                    <div class="item-image">
                                        <img :src="productImages[item.productID] || '/api/placeholder/80/80'"
                                            :alt="getProductName(item)" class="product-img" />
                                    </div>

                                    <div class="item-details">
                                        <div class="item-info">
                                            <span class="item-brand">{{ getProductBrand(item) }}</span>
                                            <h3 class="item-name" v-html="truncateProductName(getProductName(item))">
                                            </h3>
                                        </div>
                                        <div class="item-price">
                                            <div class="price-display">
                                                <span class="original-price" v-if="hasDiscount(item)">
                                                    S/. {{ getOriginalPrice(item)?.toFixed(2) }}
                                                </span>
                                                <span class="current-price"
                                                    :class="{ 'promotional': hasDiscount(item) }">
                                                    S/. {{ item.price.toFixed(2) }}
                                                </span>
                                            </div>
                                            <div class="discount-tag" v-if="hasDiscount(item)">
                                                -{{ getDiscountPercentage(item) }}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sección de información de pago -->
                        <div class="payment-section" :class="{ 'cancelled': order.status === 'cancelled' }">
                            <h4 class="section-title">
                                <CreditCardIcon :size="18" />
                                Información de pago
                            </h4>

                            <div class="payment-content">
                                <!-- Método de pago -->
                                <div v-if="order.paymentMethod && order.status !== 'cancelled'"
                                    class="payment-method-display">
                                    <span class="method-label">Método:</span>

                                    <!-- Tarjeta 
                                    <div v-if="order.paymentMethod === 'tarjeta'" class="method-tag">
                                        <CreditCardIcon :size="16" />
                                        <span>Tarjeta</span>
                                    </div> -->

                                    <!-- Yape -->
                                    <div v-if="order.paymentMethod === 'yape'" class="method-tag method-yape">
                                        <img src="/yape-icon.png" alt="Yape" class="method-icon" />
                                        <span>Yape</span>
                                    </div>

                                    <!-- Plin -->
                                    <div v-else-if="order.paymentMethod === 'plin'" class="method-tag method-plin">
                                        <img src="/plin-icon.png" alt="Plin" class="method-icon" />
                                        <span>Plin</span>
                                    </div>

                                    <!-- IziPay -->
                                    <div v-else-if="order.paymentMethod === 'izipay'" class="method-tag method-izipay">
                                        <img src="/izipay.png" alt="izipay" class="method-icon" />
                                        <span>izipay</span>
                                    </div>

                                    <!-- Otros métodos -->
                                    <div v-else class="method-tag">
                                        <span>{{ order.paymentMethod }}</span>
                                    </div>
                                </div>

                                <!-- Mensajes según estado -->
                                <!-- Pedido pendiente -->
                                <div v-if="order.status === 'pending'" class="payment-message pending">
                                    <AlertCircleIcon :size="20" class="message-icon" />
                                    <p>Su solicitud de pedido ha sido registrada. En breve nuestro equipo procesará su
                                        pedido.</p>
                                </div>

                                <!-- Pedido en proceso -->
                                <div v-else-if="order.status === 'processing'" class="payment-status">
                                    <!-- Mensaje de espera -->
                                    <div v-if="order.paymentMethod === 'yape' || order.paymentMethod === 'plin'"
                                        class="payment-message processing">
                                        <Loader2Icon :size="20" class="message-icon animate-spin" />
                                        <p>Por favor, para continuar con su compra, realice el pago a través de
                                            <strong>{{ order.paymentMethod === 'yape' ? 'YAPE' : 'PLIN' }}</strong>.
                                            Una vez realizado, su pedido será procesado y nos comunicaremos con
                                            usted.
                                        </p>
                                    </div>

                                    <div v-else-if="order.paymentMethod === 'transferencia'"
                                        class="payment-message processing">
                                        <Loader2Icon :size="20" class="message-icon animate-spin" />
                                        <p>Por favor, para continuar con su compra, realice el pago a los siguientes
                                            numeros de cuenta.
                                            Una vez realizado, su pedido será procesado y nos comunicaremos con
                                            usted.
                                        </p>
                                    </div>

                                    <div v-else-if="order.paymentMethod === 'izipay' && !order.linkPago"
                                        class="payment-message processing">
                                        <Loader2Icon :size="16" class="message-icon animate-spin" />
                                        <p>Su link de pago se está generando, pronto estará disponible.</p>
                                    </div>

                                    <div v-else class="payment-link-container">
                                        <div class="payment-link-ready">
                                            <CheckCircleIcon :size="16" class="message-icon success" />
                                            <p>¡Su link de pago está listo! Haga clic en el botón para realizar el pago.
                                            </p>
                                        </div>
                                        <a :href="formatPaymentLink(order.linkPago || '')" target="_blank"
                                            class="payment-button">
                                            <CreditCardIcon :size="16" />
                                            Realizar pago
                                            <ArrowRightIcon :size="16" />
                                        </a>
                                    </div>

                                    <!-- <div v-else-if="order.paymentMethod === 'efectivo'"
                                            class="payment-message processing">
                                            <Loader2Icon :size="20" class="message-icon animate-spin" />
                                            <p>Estamos procesando su pedido. En breve nos comunicaremos con usted para
                                                coordinar la entrega.</p>
                                        </div> -->

                                    <!-- QR de pago -->
                                    <div v-if="(order.paymentMethod === 'yape' || order.paymentMethod === 'plin') && !order.linkPago"
                                        class="qr-payment-section">
                                        <div class="qr-container">
                                            <div class="qr-image-wrapper">
                                                <img :src="order.paymentMethod === 'yape' ? '/qr-yape.jpg' : '/qr-plin.jpg'"
                                                    :alt="`QR ${order.paymentMethod}`" class="payment-qr-code" />
                                            </div>
                                            <div class="qr-payment-details">
                                                <h5 class="qr-title">Datos de pago {{ order.paymentMethod === 'yape' ?
                                                    'Yape' : 'Plin' }}:</h5>
                                                <div class="payment-info-rows">
                                                    <div class="info-row">
                                                        <span class="info-label">Nombre:</span>
                                                        <span class="info-value">{{ order.paymentMethod === 'yape' ?
                                                            'Chion C. Kam G.' : 'Chion Chui Kam Gone' }}</span>
                                                    </div>
                                                    <div class="info-row">
                                                        <span class="info-label">Número:</span>
                                                        <span class="info-value">955 463 534</span>
                                                    </div>
                                                    <div class="info-row">
                                                        <span class="info-label">Monto:</span>
                                                        <span class="info-value highlight">S/ {{ order.total.toFixed(2)
                                                            }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Trasnferencia -->
                                    <div v-if="order.paymentMethod === 'transferencia' && !order.linkPago"
                                        class="bank-transfer-section">
                                        <div class="bank-transfer-container">
                                            <h5 class="transfer-title">Numeros de Cuenta Bancaria:</h5>

                                            <div class="bank-account-list">
                                                <!-- Interbank -->
                                                <div class="bank-account-card">
                                                    <div class="bank-header">
                                                        <img src="/interbank-logo.png" alt="Interbank"
                                                            class="bank-logo" />
                                                        <h6>Interbank</h6>
                                                    </div>
                                                    <div class="bank-details">
                                                        <div class="info-row">
                                                            <span class="info-label">Titular:</span>
                                                            <span class="info-value">Chion Kam</span>
                                                        </div>
                                                        <div class="info-row">
                                                            <span class="info-label">Ahorro soles:</span>
                                                            <span class="info-value">8983446586566</span>
                                                        </div>
                                                        <div class="info-row">
                                                            <span class="info-label">CCI soles:</span>
                                                            <span class="info-value">00389801344658656642</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- BCP -->
                                                <div class="bank-account-card">
                                                    <div class="bank-header">
                                                        <img src="/bcp-logo.png" alt="BCP" class="bank-logo" />
                                                        <h6>BCP</h6>
                                                    </div>
                                                    <div class="bank-details">
                                                        <div class="info-row">
                                                            <span class="info-label">Titular:</span>
                                                            <span class="info-value">Chion Kam</span>
                                                        </div>
                                                        <div class="info-row">
                                                            <span class="info-label">Ahorro soles:</span>
                                                            <span class="info-value">19102848201069</span>
                                                        </div>
                                                        <div class="info-row">
                                                            <span class="info-label">CCI soles:</span>
                                                            <span class="info-value">00219110284820106951</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- BBVA -->
                                                <div class="bank-account-card">
                                                    <div class="bank-header">
                                                        <img src="/bbva-logo.png" alt="BBVA" class="bank-logo" />
                                                        <h6>BBVA</h6>
                                                    </div>
                                                    <div class="bank-details">
                                                        <div class="info-row">
                                                            <span class="info-label">Titular:</span>
                                                            <span class="info-value">Jan Saona</span>
                                                        </div>
                                                        <div class="info-row">
                                                            <span class="info-label">Ahorro soles:</span>
                                                            <span class="info-value">0011-0814-0268366550</span>
                                                        </div>
                                                        <div class="info-row">
                                                            <span class="info-label">CCI soles:</span>
                                                            <span class="info-value">01181400026836655015</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="transfer-instructions">
                                                <p class="instruction-text">
                                                    <span class="highlight">Monto a transferir: S/ {{
                                                        order.total.toFixed(2) }}</span>
                                                </p>
                                                <p class="instruction-note">
                                                    Después de realizar la transferencia, envíanos un screenshot del
                                                    comprobante al WhatsApp 934 505 566 y tu número de pedido.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Pedido completado -->
                                <div v-else-if="order.status === 'completed'" class="payment-message completed">
                                    <CheckCircleIcon :size="20" class="message-icon success" />
                                    <p>
                                        {{ order.paymentMethod === 'yape' || order.paymentMethod === 'plin' ||
                                            order.paymentMethod === 'izipay' || order.paymentMethod === 'transferencia'
                                            ? 'Pago completado con éxito.'
                                            : 'Pedido entregado con éxito.' }}
                                    </p>
                                </div>

                                <!-- Pedido cancelado -->
                                <div v-else-if="order.status === 'cancelled'" class="payment-message cancelled">
                                    <XCircleIcon :size="20" class="message-icon" />
                                    <p>Este pedido ha sido cancelado.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Resumen del pedido -->
                        <div class="order-summary-section">
                            <h4 class="section-title">
                                <ReceiptIcon :size="18" />
                                Resumen
                            </h4>
                            <div class="summary-content">
                                <div class="summary-rows">
                                    <div class="summary-row">
                                        <span class="summary-label">Subtotal</span>
                                        <span class="summary-value">S/. {{ order.subtotal.toFixed(2) }}</span>
                                    </div>
                                    <!-- <div class="summary-row">
                                        <span class="summary-label">Envío</span>
                                        <span class="summary-value">{{ order.shipping > 0 ? `S/.
                                            ${order.shipping.toFixed(2)}` : 'Gratis' }}</span>
                                    </div> -->
                                    <div class="summary-row total">
                                        <span class="summary-label">Total</span>
                                        <span class="summary-value">S/. {{ order.total.toFixed(2) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Mensaje de pedido completado -->
                        <div v-if="order.status === 'completed'" class="completion-message">
                            <div class="completion-content">
                                <div class="completion-icon">✨</div>
                                <div class="completion-text">
                                    <h5>¡Gracias por tu compra!</h5>
                                    <p>Esperamos que disfrutes tus productos</p>
                                </div>
                            </div>
                            <div class="social-section">
                                <p>No olvides seguirnos en nuestras redes sociales</p>
                                <div class="social-links">
                                    <a href="https://www.instagram.com/atrevido.pe" target="_blank"
                                        rel="noopener noreferrer" class="social-link instagram">
                                        <InstagramIcon :size="20" />
                                    </a>
                                    <a href="https://www.tiktok.com/@atrevido.pe" target="_blank"
                                        rel="noopener noreferrer" class="social-link tiktok">
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

                        <!-- Información de tiempo estimado para pedidos en proceso -->
                        <div v-else-if="order.status === 'processing'" class="processing-info">
                            <div class="estimated-time">
                                <ClockIcon :size="16" />
                                <span>Tiempo estimado de respuesta: 30min - 1hora</span>
                            </div>
                        </div>

                        <!-- Botón de WhatsApp -->
                        <div class="order-actions" v-if="order.status === 'pending' || order.status === 'processing'">
                            <button @click="openWhatsapp(order)" class="action-button whatsapp">
                                <MessageCircle :size="18" /> Enviar pedido por WhatsApp
                            </button>
                        </div>
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
    ShoppingBag as ShoppingBagIcon,
    ShoppingCart as ShoppingCartIcon,
    Package as PackageIcon,
    Truck as TruckIcon,
    Home as HomeIcon,
    Check as CheckIcon,
    Receipt as ReceiptIcon,
    ChevronDown as ChevronDownIcon,
    RefreshCw as RefreshCwIcon,
    Loader2Icon,
    ClockIcon,
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
const productsVisible = ref<Record<string, boolean>>({});
const orderVisible = ref<Record<string, boolean>>({});

const initCollapseState = (orders: Order[]) => {
    orders.forEach(order => {
        if (order.id) {
            // Si es un pedido nuevo, configurar visibilidad por defecto
            if (!(order.id in productsVisible.value)) {
                productsVisible.value[order.id] = true; // Productos visibles por defecto
            }

            if (!(order.id in orderVisible.value)) {
                // Por defecto, mostrar contenido del pedido solo para pedidos pendientes o en proceso
                orderVisible.value[order.id] = (order.status === 'pending' || order.status === 'processing');
            }
        }
    });
};

// Función para alternar la visibilidad de productos para un pedido específico
const toggleProductsVisible = (orderId: string) => {
    if (orderId in productsVisible.value) {
        productsVisible.value[orderId] = !productsVisible.value[orderId];
    } else {
        productsVisible.value[orderId] = true;
    }
};

const toggleOrderVisible = (orderId: string) => {
    if (orderId in orderVisible.value) {
        orderVisible.value[orderId] = !orderVisible.value[orderId];
    } else {
        orderVisible.value[orderId] = true;
    }
};

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

    // Filtrar órdenes en proceso que no tienen enlace de pago Y órdenes pendientes
    const ordersToMonitor = orders.value.filter(
        order => ((order.status === 'processing' && !order.linkPago) ||
            order.status === 'pending') &&
            order.id
    );

    // Si no hay órdenes para consultar, no hacer nada
    if (ordersToMonitor.length === 0) return;

    // Añadir IDs al conjunto de consulta
    ordersToMonitor.forEach(order => {
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

        const currentOrdersMap = new Map();
        orders.value.forEach(order => {
            if (order.id) currentOrdersMap.set(order.id, order);
        });

        refreshedOrders.forEach(order => {
            if (order.id && pollingOrderIds.value.has(order.id)) {
                const currentOrder = currentOrdersMap.get(order.id);

                // Detectar cambios de estado o adición de enlace de pago
                if (currentOrder && (
                    currentOrder.status !== order.status ||
                    (!currentOrder.linkPago && order.linkPago)
                )) {
                    updatesFound = true;

                    // Mostrar notificación si corresponde
                    if (order.status === 'cancelled') {
                        showCancellationNotification(order);
                    } else if (currentOrder.status === 'pending' && order.status === 'processing') {
                        showStatusChangeNotification(order, 'processing');
                    } else if (currentOrder.status === 'processing' && order.status === 'completed') {
                        showStatusChangeNotification(order, 'completed');
                    }
                }

                // Dejar de monitorear si ya no es necesario
                if (order.linkPago || order.status === 'cancelled' || order.status === 'completed') {
                    pollingOrderIds.value.delete(order.id);
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
        console.error('Error al consultar estados de pedidos:', error);
    }
};

const showStatusChangeNotification = (order: Order, newStatus: string) => {
    const statusMessages = {
        'processing': `El pedido #${order.id?.slice(-6)} ahora está en proceso.`,
        'completed': `¡El pedido #${order.id?.slice(-6)} ha sido completado!`
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] ||
        `El estado del pedido #${order.id?.slice(-6)} ha cambiado a ${newStatus}.`;

    if (typeof showToast === 'function') {
        showToast({
            type: newStatus === 'processing' ? 'info' : 'success',
            message: message
        });
    }
};

const showCancellationNotification = (order: Order) => {
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

const getProductName = (item: any) => {
    return item.productSnapshot?.name || 'Producto no encontrado';
};

const getProductBrand = (item: any) => {
    return item.productSnapshot?.brand || '';
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
    return item.productSnapshot?.discountPercentage > 0 &&
        item.productSnapshot?.isPromoted &&
        isPromotionActive(item);
};

const getOriginalPrice = (item: any) => {
    if (hasDiscount(item)) {
        return item.productSnapshot?.originalPrice;
    }
    return null;
};

const getDiscountPercentage = (item: any) => {
    if (hasDiscount(item)) {
        return item.productSnapshot?.discountPercentage || 0;
    }
    return 0;
};

const formatDate = (date?: string | Date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Formatea el mensaje de WhatsApp para un pedido
const formatOrderWhatsAppMessage = (order: Order) => {
    const { status, customerInfo, items, subtotal, shipping, total } = order;
    const idPedido = `*MI ID PEDIDO ES:*\n` +
        `#` + order.id?.slice(-6);

    const statusOrder = `*ESTADO:*\n` +
        `${getStatusText(status)}`;
    const customerDetails =
        `*INFORMACIÓN DEL CLIENTE*\n` +
        `Nombre: ${customerInfo.firstName} ${customerInfo.lastName}\n` +
        `Email: ${customerInfo.email}\n` +
        `${customerInfo.documentType}: ${customerInfo.documentNumber}\n` +
        `Teléfono: ${customerInfo.phone}\n\n`;

    const itemsDetails = items.map((item: any) => {
        return `- ${item.productSnapshot.name} (${item.quantity}x) : S/. ${item.price.toFixed(2)}`;
    }).join('\n');

    type PaymentMethod = 'izipay' | 'transferencia' | 'plin' | 'yape' | 'efectivo';

    const paymentMethodMap: Record<PaymentMethod, string> = {
        izipay: 'Link de Pago izipay',
        transferencia: 'Transferencia bancaria',
        plin: 'Plin',
        yape: 'Yape',
        efectivo: 'Efectivo',
    };

    const paymentMethod = paymentMethodMap[order.paymentMethod as PaymentMethod] || order.paymentMethod;

    const totalsDetails =
        `\n*TOTALES*\n` +
        `Subtotal: S/. ${subtotal.toFixed(2)}\n` +
        /*`Envío: ${shipping > 0 ? `S/. ${shipping.toFixed(2)}` : 'Gratis'}\n` +*/
        `Total: S/. ${total.toFixed(2)}`;

    return encodeURIComponent(
        `${idPedido}\n\n` +
        `${statusOrder}\n\n` +
        `${customerDetails}` +
        `*PRODUCTOS*\n${itemsDetails}\n\n` +
        `*MÉTODO DE PAGO*\n${paymentMethod}\n` +
        `${totalsDetails}`
    );
};

const openWhatsapp = (order: Order) => {
    const message = formatOrderWhatsAppMessage(order);
    const phoneNumber = '51955463534';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};

// Función para filtrar órdenes y refrescar datos
const filterOrders = async () => {
    stopPaymentLinkPolling();
    error.value = null;
    loading.value = true;

    try {
        const userOrders = await getUserOrders(currentUserEmail.value || '');
        orders.value = userOrders;

        // Inicializar estados para cualquier pedido nuevo
        initCollapseState(userOrders);

        await loadProductImages();

        if (selectedStatus.value === 'processing' ||
            selectedStatus.value === 'pending' ||
            selectedStatus.value === 'all') {
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

        // Inicializar estados de colapso
        initCollapseState(userOrders);

        // Iniciar el polling para las órdenes en proceso
        startPaymentLinkPolling();
    } catch (err) {
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
/* Contenedor principal */
.orders-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

/* Encabezado de la página */
.orders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.25rem 0;
}

.auth-message {
    font-size: 0.875rem;
    color: #6B7280;
    margin-top: 0.25rem;
}

/* Filtros */
.filter-section {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.filter-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
}

.filter-label {
    font-size: 0.875rem;
    color: #4B5563;
    margin-right: 0.25rem;
}

.select-wrapper {
    position: relative;
}

.status-filter {
    padding: 0.6rem 2.5rem 0.6rem 1rem;
    border: 1px solid #E5E7EB;
    border-radius: 0.375rem;
    background-color: white;
    font-size: 0.875rem;
    color: #111827;
    cursor: pointer;
    min-width: 180px;
    appearance: none;
    transition: all 0.2s ease;
    outline: none;
}

.status-filter:hover:not(:disabled) {
    border-color: #D1D5DB;
}

.status-filter:focus:not(:disabled) {
    border-color: #272727;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.status-filter:disabled {
    background-color: #F9FAFB;
    cursor: not-allowed;
    opacity: 0.7;
}

.select-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6B7280;
    pointer-events: none;
}

.filter-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6B7280;
}

/* Estado de carga */
.loading-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 3rem 0;
    color: #6B7280;
    text-align: center;
}

.spinner-container {
    margin-bottom: 1rem;
}

.loading-spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid #E5E7EB;
    border-top: 3px solid #272727;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.order-content {
    animation: fadeIn 0.3s ease;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Estado de error */
.error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #FEF2F2;
    border: 1px solid #FEE2E2;
    color: #B91C1C;
    padding: 2rem;
    border-radius: 0.5rem;
    text-align: center;
    gap: 1rem;
}

.error-message p {
    margin: 0.5rem 0;
}

.retry-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: white;
    border: 1px solid #E5E7EB;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #4B5563;
    cursor: pointer;
    transition: all 0.2s ease;
}

.retry-button:hover {
    background-color: #F9FAFB;
    border-color: #D1D5DB;
}

/* Estado vacío */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 4rem 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.empty-icon {
    color: #9CA3AF;
    margin-bottom: 1.5rem;
}

.empty-state h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
}

.empty-state p {
    color: #6B7280;
    margin-bottom: 1.5rem;
}

.button-primary {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #272727;
    color: white;
    border-radius: 0.375rem;
    font-weight: 500;
    text-decoration: none;
    transition: background-color 0.2s ease;
    border: none;
    cursor: pointer;
}

.button-primary:hover {
    background-color: #4338CA;
    transform: translateY(-1px);
}

/* Lista de pedidos */
.orders-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.order-card {
    background: white;
    border-radius: 0.75rem;
    /*box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);*/
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid #E5E7EB;
}

.order-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Cabecera del pedido */
.order-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    cursor: pointer;
    user-select: none;
    background-color: #F9FAFB;
    transition: background-color 0.2s ease;
    border-bottom: 1px solid #E5E7EB;
}

.order-card-header:hover {
    background-color: #F3F4F6;
}

.order-identifier {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.order-number-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #111827;
}

.order-number {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
}

.order-date {
    font-size: 0.875rem;
    color: #6B7280;
    margin: 0;
}

.order-status-section {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.order-toggle {
    margin-left: 0.5rem;
}

.order-content {
    padding: 1.5rem;
    transition: max-height 0.5s ease;
}

.status-tag {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
}

.status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
}

.status-tag-pending {
    background-color: #FEF3C7;
    color: #92400E;
}

.status-tag-pending .status-dot {
    background-color: #F59E0B;
}

.status-tag-processing {
    background-color: #DBEAFE;
    color: #1E40AF;
}

.status-tag-processing .status-dot {
    background-color: #3B82F6;
}

.status-tag-completed {
    background-color: #D1FAE5;
    color: #065F46;
}

.status-tag-completed .status-dot {
    background-color: #10B981;
}

.status-tag-cancelled {
    background-color: #FEE2E2;
    color: #991B1B;
}

.status-tag-cancelled .status-dot {
    background-color: #EF4444;
}

/* Progress track */
.order-progress {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #F9FAFB;
    border-radius: 0.5rem;
}

.progress-track {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    z-index: 1;
    flex: 0 0 auto;
}

.step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: #F3F4F6;
    color: #9CA3AF;
    border: 2px solid #E5E7EB;
}

.step-label {
    font-size: 0.75rem;
    color: #6B7280;
    text-align: center;
    font-weight: 500;
    max-width: 5rem;
}

.progress-line {
    flex: 1;
    height: 2px;
    background-color: #E5E7EB;
    margin: 0 0.25rem;
    position: relative;
    top: -0.75rem;
}

.progress-step.active .step-icon {
    background-color: #EEF2FF;
    color: #272727;
    border-color: #C7D2FE;
}

.progress-step.active .step-label {
    color: #272727;
    font-weight: 600;
}

.progress-step.completed .step-icon {
    background-color: #272727;
    color: white;
    border-color: #272727;
}

.progress-line.active {
    background-color: #272727;
}

/* Sección de productos */
.products-section {
    margin-bottom: 1.5rem;
    border: 1px solid #E5E7EB;
    border-radius: 0.5rem;
    overflow: hidden;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background-color: #F9FAFB;
    cursor: pointer;
    user-select: none;
    position: relative;
    z-index: 2;
    transition: background-color 0.2s ease;
}

.section-header:hover {
    background-color: #F3F4F6;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
    border-bottom: none;
    padding-bottom: 0;
}

.toggle-button {
    background: none;
    border: none;
    color: #6B7280;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
}

.toggle-button:hover {
    background-color: #E5E7EB;
    color: #4B5563;
}

.rotate-icon {
    transform: rotate(-180deg);
    transition: transform 0.3s ease;
}

.order-items {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.order-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background-color: #F9FAFB;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
    align-items: center;
}

.order-item:hover {
    background-color: #F3F4F6;
}

.item-image {
    position: relative;
    width: 5rem;
    height: 5rem;
    flex-shrink: 0;
    border-radius: 0.375rem;
    overflow: hidden;
    background-color: white;
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

.product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.quantity-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    min-width: 2rem;
    height: 2rem;
    background-color: #272727;
    color: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.875rem;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-details {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
}

.item-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.item-brand {
    font-size: 0.75rem;
    color: #6B7280;
}

.item-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    margin: 0;
}

.item-name :deep(strong) {
    font-weight: 600;
}

.item-price {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.75rem;
}

.price-display {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.original-price {
    font-size: 0.75rem;
    color: #9CA3AF;
    text-decoration: line-through;
}

.current-price {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
}

.current-price.promotional {
    color: #DC2626;
}

.discount-tag {
    background-color: #FEE2E2;
    color: #B91C1B;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

/* Sección de pago */
.payment-section {
    margin-bottom: 1.5rem;
    padding: 1.25rem;
    background-color: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 0.5rem;
}

.payment-section.cancelled {
    background-color: #FEF2F2;
    border-color: #FECACA;
}

.payment-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.payment-method-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.method-label {
    font-size: 0.875rem;
    color: #6B7280;
}

.method-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background-color: #F3F4F6;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #4B5563;
}

.method-tag.method-yape {
    background-color: #F5F3FF;
    color: #5B21B6;
}

.method-tag.method-plin {
    background-color: #EFF6FF;
    color: #1E40AF;
}

.method-tag.method-izipay {
    background-color: #F3F4F6;
    color: #111827;
}

.method-icon {
    width: 1rem;
    height: 1rem;
    object-fit: contain;
}

.payment-message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem;
    border-radius: 0.375rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.4;
}

.payment-message.pending {
    background-color: #FEF3C7;
    color: #92400E;
    border: 1px solid #FDE68A;
}

.payment-message.processing {
    background-color: #DBEAFE;
    color: #1E40AF;
    border: 1px solid #BFDBFE;
}

.payment-message.completed {
    background-color: #D1FAE5;
    color: #065F46;
    border: 1px solid #A7F3D0;
}

.payment-message.cancelled {
    background-color: #FEE2E2;
    color: #991B1B;
    border: 1px solid #FECACA;
}

.message-icon {
    margin-top: 0.125rem;
    flex-shrink: 0;
}

.message-icon.success {
    color: #10B981;
}

.animate-spin {
    animation: spin 2s linear infinite;
}

/* QR de pago */
.qr-payment-section {
    margin-top: 1rem;
}

.qr-container {
    display: flex;
    gap: 1.5rem;
    background-color: white;
    border-radius: 0.5rem;
    padding: 1rem;
    border: 1px solid #E5E7EB;
}

.qr-image-wrapper {
    width: 8rem;
    height: 8rem;
    flex-shrink: 0;
}

.payment-qr-code {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.25rem;
    border: 1px solid #E5E7EB;
}

.qr-payment-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.qr-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
}

.payment-info-rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-label {
    font-size: 0.875rem;
    color: #6B7280;
    min-width: 5rem;
}

.info-value {
    font-size: 0.875rem;
    color: #111827;
    font-weight: 500;
}

.info-value.highlight {
    color: #272727;
    font-weight: 600;
}

/* Resumen del pedido */
.order-summary-section {
    margin-bottom: 1.5rem;
}

.summary-content {
    background-color: #F9FAFB;
    border-radius: 0.5rem;
    padding: 1rem;
}

.summary-rows {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #4B5563;
}

.summary-row.total {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid #E5E7EB;
}

.summary-label {
    color: #6B7280;
}

.summary-value {
    font-weight: 500;
}

/* Mensaje de finalización */
.completion-message {
    background: linear-gradient(to right, #F0FDF4, #DCFCE7);
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
    border: 1px solid #BBF7D0;
}

.completion-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.completion-icon {
    font-size: 1.5rem;
    animation: sparkle 1.5s infinite;
}

.completion-text h5 {
    font-size: 1rem;
    font-weight: 600;
    color: #065F46;
    margin: 0 0 0.25rem 0;
}

.completion-text p {
    font-size: 0.875rem;
    color: #047857;
    margin: 0;
}

.social-section {
    padding-top: 1rem;
    border-top: 1px dashed #86EFAC;
}

.social-section p {
    color: #059669;
    font-size: 0.875rem;
    margin: 0 0 0.75rem 0;
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
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: white;
    color: #059669;
    transition: all 0.2s ease;
}

.social-link:hover {
    transform: translateY(-2px);
}

.social-link.instagram:hover {
    background: #E1306C;
    color: white;
}

.social-link.tiktok:hover {
    background: #000000;
    color: white;
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

/* Información de procesamiento */
.processing-info {
    padding: 0.875rem;
    background-color: #EFF6FF;
    border-radius: 0.375rem;
    margin-bottom: 1.5rem;
    border: 1px solid #BFDBFE;
}

.estimated-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #1E40AF;
    font-size: 0.875rem;
}

/* Acciones de pedido */
.order-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.action-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.action-button.whatsapp {
    background-color: #25D366;
    color: white;
}

.action-button.whatsapp:hover {
    background-color: #128C7E;
    transform: translateY(-1px);
}

.bank-transfer-section {
    margin-top: 1.5rem;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
}

.transfer-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1a1a1a;
}

.bank-account-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.bank-account-card {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bank-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
}

.bank-logo {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.bank-header h6 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #1a1a1a;
}

.bank-details {
    font-size: 0.875rem;
}

.transfer-instructions {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.instruction-text {
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.instruction-note {
    font-size: 0.875rem;
    color: #6b7280;
}

.highlight {
    color: #53565b;
    font-weight: 600;
}

@media (max-width: 768px) {
    .bank-account-list {
        grid-template-columns: 1fr;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .orders-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .filter-section {
        width: 100%;
    }

    .filter-container {
        width: 100%;
    }

    .status-filter {
        width: 100%;
    }

    .order-card {
        padding: 1.25rem;
    }

    .order-card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .order-status-section {
        width: 100%;
        justify-content: space-between;
    }

    .progress-track {
        overflow-x: auto;
        padding: 0.5rem 0;
        justify-content: flex-start;
        min-width: 500px;
    }

    .qr-container {
        flex-direction: column;
        align-items: center;
    }

    .qr-payment-details {
        text-align: center;
    }

    .info-row {
        justify-content: center;
    }

    .order-actions {
        justify-content: center;
    }
}

@media (max-width: 640px) {
    .order-item {
        flex-wrap: wrap;
    }

    .quantity-indicator {
        order: 1;
    }

    .item-image {
        order: 2;
        width: 4rem;
        height: 4rem;
    }

    .item-details {
        order: 3;
        width: 100%;
        margin-top: 0.75rem;
    }
}
</style>