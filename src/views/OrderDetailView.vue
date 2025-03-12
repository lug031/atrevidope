<template>
    <MainLayout>
        <div class="order-detail-container">
            <!-- Cabecera con botón de volver -->
            <div class="detail-header">
                <button @click="goBack" class="back-button">
                    <ArrowLeftIcon :size="20" />
                    <span>Volver</span>
                </button>
                <h1 class="page-title">Detalles del Pedido</h1>
            </div>

            <!-- Estados de la interfaz -->
            <!-- Estado de carga -->
            <div v-if="loading" class="loading-state">
                <div class="spinner-container">
                    <div class="loading-spinner"></div>
                </div>
                <span>Cargando detalles del pedido...</span>
            </div>

            <!-- Estado de error -->
            <div v-else-if="error" class="error-message">
                <AlertCircleIcon :size="24" />
                <p>{{ error }}</p>
                <button @click="loadOrder" class="retry-button">
                    <RefreshCwIcon :size="16" />
                    Reintentar
                </button>
            </div>

            <!-- Estado de orden no encontrada -->
            <div v-else-if="!order" class="not-found-state">
                <div class="not-found-icon">
                    <SearchIcon :size="48" />
                </div>
                <h3>Pedido no encontrado</h3>
                <p>No se encontró el pedido con el ID especificado</p>
                <router-link to="/my-orders" class="button-primary">
                    Ver mis pedidos
                </router-link>
            </div>

            <!-- Contenido del pedido -->
            <div v-else class="order-content">
                <!-- Cabecera de la orden -->
                <div class="order-card-header">
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
                    </div>
                </div>

                <!-- Sección de productos -->
                <div class="products-section">
                    <div class="section-header">
                        <h4 class="section-title">
                            <ShoppingCartIcon :size="18" />
                            Productos ({{ order.items.length }})
                        </h4>
                    </div>

                    <!-- Lista de productos -->
                    <div class="order-items">
                        <div v-for="item in order.items" :key="item.productID" class="order-item">
                            <!-- Indicador de cantidad -->
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
                                        <span class="current-price" :class="{ 'promotional': hasDiscount(item) }">
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
                        <div v-if="order.paymentMethod && order.status !== 'cancelled'" class="payment-method-display">
                            <span class="method-label">Método:</span>

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
                                <span>Izipay</span>
                            </div>

                            <!-- Otros métodos -->
                            <div v-else class="method-tag">
                                <span>{{ order.paymentMethod }}</span>
                            </div>
                        </div>

                        <!-- Enlaces de pago -->
                        <div v-if="order.paymentMethod === 'izipay' && order.status === 'processing'"
                            class="payment-links-section">
                            <div v-if="!order.linkPago" class="payment-message processing">
                                <Loader2Icon :size="16" class="message-icon animate-spin" />
                                <p>Su link de pago se está generando, pronto estará disponible.</p>
                            </div>

                            <div v-else-if="order.linkPago" class="payment-links">
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

                        <!-- Mensajes según estado -->
                        <!-- Pedido pendiente -->
                        <div v-if="order.status === 'pending'" class="payment-message pending">
                            <AlertCircleIcon :size="20" class="message-icon" />
                            <p>Su solicitud de pedido ha sido registrada. En breve nuestro equipo procesará su pedido.
                            </p>
                        </div>

                        <!-- Pedido en proceso -->
                        <div v-else-if="order.status === 'processing'" class="payment-status">
                            <!-- Mensaje de espera -->
                            <div v-if="order.paymentMethod === 'yape' || order.paymentMethod === 'plin'"
                                class="payment-message processing">
                                <Loader2Icon :size="20" class="message-icon animate-spin" />
                                <p>Por favor, para continuar con su compra, realice el pago a través de
                                    <strong>{{ order.paymentMethod === 'yape' ? 'YAPE' : 'PLIN' }}</strong>.
                                    Una vez realizado, su pedido será procesado y nos comunicaremos con usted.
                                </p>
                            </div>

                            <div v-else-if="order.paymentMethod === 'transferencia'" class="payment-message processing">
                                <Loader2Icon :size="20" class="message-icon animate-spin" />
                                <p>Por favor, para continuar con su compra, realice el pago a los siguientes numeros de
                                    cuenta.
                                    Una vez realizado, su pedido será procesado y nos comunicaremos con usted.
                                </p>
                            </div>

                            <!-- QR de pago -->
                            <div v-if="(order.paymentMethod === 'yape' || order.paymentMethod === 'plin') && !order.linkPago"
                                class="qr-payment-section">
                                <div class="qr-container">
                                    <div class="qr-image-wrapper">
                                        <img :src="order.paymentMethod === 'yape' ? '/qr-yape.jpg' : '/qr-plin.jpg'"
                                            :alt="`QR ${order.paymentMethod}`" class="payment-qr-code" />
                                    </div>
                                    <div class="qr-payment-details">
                                        <h5 class="qr-title">Datos de pago {{ order.paymentMethod === 'yape' ? 'Yape' :
                                            'Plin' }}:</h5>
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

                            <!-- Transferencia -->
                            <div v-if="order.paymentMethod === 'transferencia' && !order.linkPago"
                                class="bank-transfer-section">
                                <div class="bank-transfer-container">
                                    <h5 class="transfer-title">Numeros de Cuenta Bancaria:</h5>

                                    <div class="bank-account-list">
                                        <!-- Interbank -->
                                        <div class="bank-account-card">
                                            <div class="bank-header">
                                                <img src="/interbank-logo.png" alt="Interbank" class="bank-logo" />
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
                                            <span class="highlight">Monto a transferir: S/ {{ order.total.toFixed(2)
                                            }}</span>
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

                <!-- Información del Cliente 
                <div class="customer-section">
                    <h4 class="section-title">
                        <UserIcon :size="18" />
                        Información del Cliente
                    </h4>
                    <div class="customer-details">
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Nombre completo</span>
                                <span class="info-value">{{ order.customerInfo.firstName }} {{
                                    order.customerInfo.lastName }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Email</span>
                                <span class="info-value">{{ order.customerInfo.email }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Teléfono</span>
                                <span class="info-value">{{ order.customerInfo.phone }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Documento</span>
                                <span class="info-value">{{ order.customerInfo.documentType }}: {{
                                    order.customerInfo.documentNumber }}</span>
                            </div>
                        </div>
                    </div>
                </div> -->

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

                            <div v-if="order.paymentMethod === 'izipay'" class="summary-row">
                                <span class="summary-label">Comisión Izipay (4%)</span>
                                <span class="summary-value">S/. {{ (order.subtotal * 0.04).toFixed(2) }}</span>
                            </div>

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
                            <a href="https://www.instagram.com/atrevido.pe" target="_blank" rel="noopener noreferrer"
                                class="social-link instagram">
                                <InstagramIcon :size="20" />
                            </a>
                            <a href="https://www.tiktok.com/@atrevido.pe" target="_blank" rel="noopener noreferrer"
                                class="social-link tiktok">
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
                    <button @click="openWhatsapp" class="action-button whatsapp">
                        <MessageCircleIcon :size="18" /> Enviar pedido por WhatsApp
                    </button>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrders } from '@/composables/useOrders';
import { useToast } from '@/composables/useToast';
import type { Order, OrderStatus } from '@/types/order.types';
import MainLayout from '@/layouts/MainLayout.vue';
import {
    MessageCircleIcon,
    InstagramIcon,
    ShoppingBagIcon,
    ShoppingCartIcon,
    SearchIcon,
    UserIcon,
    CheckIcon,
    ReceiptIcon,
    ArrowLeftIcon,
    RefreshCwIcon,
    Loader2Icon,
    ClockIcon,
    CreditCardIcon,
    AlertCircleIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    XCircleIcon
} from 'lucide-vue-next';
import { getUrl } from 'aws-amplify/storage';

const route = useRoute();
const router = useRouter();
const { getOrderDetails } = useOrders();
const { showToast } = useToast();

const POLLING_INTERVAL = 15000; // 15 segundos
const shouldPoll = ref(true);
let intervalId: string | number | NodeJS.Timeout | null | undefined = null;

const orderId = ref(route.params.id as string);
const order = ref<Order | null>(null);
const productImages = ref<Record<string, string>>({});
const loading = ref(true);
const error = ref<string | null>(null);

const checkOrderUpdates = async () => {
    if (!shouldPoll.value || !orderId.value) return;

    try {
        const updatedOrder = await getOrderDetails(orderId.value);

        if (order.value && updatedOrder) {
            // Verificar si hay cambios en el estado o en el link de pago
            const stateChanged = order.value.status !== updatedOrder.status;
            const paymentLinkAdded = !order.value.linkPago && updatedOrder.linkPago;

            if (stateChanged || paymentLinkAdded) {
                // Mostrar notificación según el cambio
                if (stateChanged) {
                    showStatusChangeNotification(updatedOrder);
                } else if (paymentLinkAdded) {
                    showToast({
                        type: 'info',
                        message: 'El link de pago ya está disponible.'
                    });
                }

                // Actualizar la orden con los nuevos datos
                order.value = updatedOrder;
                await loadProductImages();
            }
        }
    } catch (error) {
        console.error('Error al verificar actualizaciones de la orden:', error);
    }
};

const showStatusChangeNotification = (updatedOrder: any) => {
    const statusMessages = {
        'processing': `El pedido ahora está en proceso.`,
        'completed': `¡El pedido ha sido completado!`,
        'cancelled': `El pedido ha sido cancelado.`
    };

    const newStatus = updatedOrder.status;
    const message = statusMessages[newStatus as keyof typeof statusMessages] || `El estado del pedido ha cambiado a ${getStatusText(newStatus)}.`;
    const type = newStatus === 'completed' ? 'success' :
        newStatus === 'cancelled' ? 'warning' : 'info';

    showToast({
        type,
        message
    });
};

// Cargar los detalles de la orden
const loadOrder = async () => {
    if (!orderId.value) {
        error.value = 'ID de pedido no proporcionado';
        loading.value = false;
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        const orderData = await getOrderDetails(orderId.value);
        order.value = orderData;

        if (orderData && orderData.customerInfo && orderData.customerInfo.email) {
            localStorage.setItem('userEmail', orderData.customerInfo.email);
        }

        await loadProductImages();
    } catch (err) {
        console.error('Error al cargar el pedido:', err);
        error.value = 'No se pudo cargar la información del pedido';
    } finally {
        loading.value = false;
    }
};

// Volver a la página anterior
const goBack = () => {
    router.push('/my-orders');
};

// Cargar imágenes de productos
const loadProductImages = async () => {
    if (!order.value) return;

    for (const item of order.value.items) {
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
};

// Formato para el link de pago
const formatPaymentLink = (link: string): string => {
    if (!link) return '#';

    // Si el enlace ya comienza con http:// o https://, devolverlo tal cual
    if (link.startsWith('http://') || link.startsWith('https://')) {
        return link;
    }

    // Si comienza con www. o es otro tipo de dominio, añadir https://
    return `https://${link}`;
};

// Obtener clase CSS según estado
const getStatusClass = (status: OrderStatus) => {
    return `status-tag-${status}`;
};

// Obtener texto según estado
const getStatusText = (status: OrderStatus) => {
    const statusText: Record<OrderStatus, string> = {
        pending: 'Pendiente',
        processing: 'En proceso',
        completed: 'Completado',
        cancelled: 'Cancelado'
    };
    return statusText[status];
};

// Funciones para producto
const getProductName = (item: any) => {
    return item.productSnapshot?.name || 'Producto no encontrado';
};

const getProductBrand = (item: any) => {
    return item.productSnapshot?.brand || '';
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

// Funciones para promociones
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

// Formatea el mensaje de WhatsApp para un pedido
const formatOrderWhatsAppMessage = () => {
    if (!order.value) return '';

    const { status, customerInfo, items, subtotal, total } = order.value;
    const idPedido = `*MI ID PEDIDO ES:*\n` +
        `#` + order.value.id?.slice(-6);

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

    const paymentMethod = paymentMethodMap[order.value.paymentMethod as PaymentMethod] || order.value.paymentMethod;

    const izipayCommission = order.value.paymentMethod === 'izipay' ?
        (order.value.subtotal * 0.04).toFixed(2) : 0;
    const izipayCommissionText = order.value.paymentMethod === 'izipay' ?
        `Comisión Izipay (4%): S/. ${izipayCommission}\n` : '';

    const totalsDetails =
        `\n*TOTALES*\n` +
        `Subtotal: S/. ${subtotal.toFixed(2)}\n` +
        izipayCommissionText +
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

// Abrir WhatsApp con el mensaje del pedido
const openWhatsapp = () => {
    const message = formatOrderWhatsAppMessage();
    const phoneNumber = '51934505566';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};

// Cargar los datos al montar el componente
onMounted(() => {
    loadOrder();
    intervalId = setInterval(checkOrderUpdates, POLLING_INTERVAL);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    shouldPoll.value = false;
});

watch(() => order.value?.status, (newStatus) => {
    if (newStatus === 'completed' || newStatus === 'cancelled') {
        shouldPoll.value = false;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    } else {
        shouldPoll.value = true;
        if (!intervalId) {
            intervalId = setInterval(checkOrderUpdates, POLLING_INTERVAL);
        }
    }
});
</script>

<style scoped>
.order-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

/* Cabecera con botón de volver */
.detail-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid #E5E7EB;
    border-radius: 0.375rem;
    background-color: white;
    color: #4B5563;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.back-button:hover {
    background-color: #F9FAFB;
    border-color: #D1D5DB;
}

.page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

/* Estados de la interfaz */
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

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Error state */
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

/* Not found state */
.not-found-state {
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

.not-found-icon {
    color: #9CA3AF;
    margin-bottom: 1.5rem;
}

.not-found-state h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
}

.not-found-state p {
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

/* Contenido del pedido */
.order-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Cabecera de la orden */
.order-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    background-color: #F9FAFB;
    border-radius: 0.5rem;
    border: 1px solid #E5E7EB;
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

/* Sección de productos */
.products-section {
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
    border-bottom: 1px solid #E5E7EB;
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

.item-image {
    position: relative;
    width: 5rem;
    height: 5rem;
    flex-shrink: 0;
    border-radius: 0.375rem;
    overflow: hidden;
    background-color: white;
}

.product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
    margin-top: 1rem;
}

.payment-method-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

.payment-links-section {
    margin-top: 1rem;
}

.payment-links {
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

/* Transferencia bancaria */
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

/* Sección de información del cliente */
.customer-section {
    padding: 1.25rem;
    background-color: white;
    border: 1px solid #E5E7EB;
    border-radius: 0.5rem;
}

.customer-details {
    margin-top: 1rem;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

/* Resumen del pedido */
.order-summary-section {
    padding: 1.25rem;
    background-color: white;
    border: 1px solid #E5E7EB;
    border-radius: 0.5rem;
}

.summary-content {
    background-color: #F9FAFB;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-top: 1rem;
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

/* Responsive */
@media (max-width: 768px) {
    .detail-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .order-card-header {
        flex-direction: column;
        gap: 1rem;
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

    .bank-account-list {
        grid-template-columns: 1fr;
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