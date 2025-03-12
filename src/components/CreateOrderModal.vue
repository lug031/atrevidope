<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h2>Crear Nuevo Pedido</h2>
                <button @click="closeModal" class="close-button">
                    <XIcon :size="20" />
                </button>
            </div>

            <div class="modal-content">
                <div v-if="loading" class="loading-state">
                    <Loader2Icon :size="30" class="animate-spin" />
                    <p>Procesando...</p>
                </div>
                <div v-else-if="orderCreated" class="success-state">
                    <div class="success-icon">
                        <CheckCircleIcon :size="60" class="text-green-500" />
                    </div>
                    <h3 class="success-title">¡Pedido creado exitosamente!</h3>
                    <p class="success-message">El pedido ha sido registrado con el ID: <span class="order-id">{{
                        orderId.slice(-6) }}</span></p>

                    <div class="short-link-container">
                        <p class="short-link-label">Link del pedido:</p>
                        <div class="link-copy-container">
                            <input type="text" :value="shortLink" readonly class="short-link-input" />
                            <button @click="copyLinkToClipboard" class="copy-button" :class="{ 'copied': copySuccess }">
                                <span v-if="!copySuccess">
                                    <ClipboardIcon :size="18" />
                                </span>
                                <span v-else>
                                    <CheckIcon :size="18" />
                                </span>
                            </button>
                        </div>
                        <p class="short-link-help">
                            Este link permite acceder directamente a los detalles de este pedido.
                            Compártelo con el cliente para que pueda ver el estado de su pedido.
                        </p>
                    </div>

                    <div class="success-actions">
                        <button @click="finishAndClose" class="button primary">
                            Finalizar
                        </button>
                    </div>
                </div>
                <div v-else>
                    <!-- Formulario con pestañas -->
                    <div class="tabs">
                        <button @click="currentTab = 'customer'"
                            :class="['tab-button', { active: currentTab === 'customer' }]">
                            <UserIcon :size="16" />
                            Datos del Cliente
                        </button>
                        <button @click="currentTab = 'products'"
                            :class="['tab-button', { active: currentTab === 'products' }]"
                            :disabled="!isCustomerInfoValid">
                            <ShoppingBagIcon :size="16" />
                            Productos
                        </button>
                        <button @click="currentTab = 'payment'"
                            :class="['tab-button', { active: currentTab === 'payment' }]" :disabled="!isProductsValid">
                            <CreditCardIcon :size="16" />
                            Pago
                        </button>
                    </div>

                    <!-- Pestaña de información del cliente -->
                    <div v-if="currentTab === 'customer'" class="tab-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="firstName">Nombre *</label>
                                <input type="text" id="firstName" v-model="orderData.customerInfo.firstName"
                                    placeholder="Nombre del cliente" required />
                            </div>

                            <div class="form-group">
                                <label for="lastName">Apellido *</label>
                                <input type="text" id="lastName" v-model="orderData.customerInfo.lastName"
                                    placeholder="Apellido del cliente" required />
                            </div>

                            <div class="form-group">
                                <label for="email">Email *</label>
                                <input type="email" id="email" v-model="orderData.customerInfo.email"
                                    placeholder="correo@ejemplo.com" required />
                            </div>

                            <div class="form-group">
                                <label for="phone">Teléfono *</label>
                                <input type="tel" id="phone" v-model="orderData.customerInfo.phone"
                                    placeholder="999 999 999" required />
                            </div>

                            <div class="form-group">
                                <label for="documentType">Tipo de documento *</label>
                                <select id="documentType" v-model="orderData.customerInfo.documentType" required>
                                    <option value="DNI">DNI</option>
                                    <option value="CE">CE</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="documentNumber">Número de documento *</label>
                                <input type="text" id="documentNumber" v-model="orderData.customerInfo.documentNumber"
                                    placeholder="12345678" required />
                            </div>

                            <div class="form-group">
                                <label for="invoiceType">Tipo de comprobante *</label>
                                <select id="invoiceType" v-model="orderData.customerInfo.invoiceType" required>
                                    <option value="boleta">Boleta</option>
                                    <!-- <option value="factura">Factura</option>m -->
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="shippingMethod">Método de envío *</label>
                                <select id="shippingMethod" v-model="orderData.customerInfo.shippingMethod" required>
                                    <option value="regular">Regular</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button @click="closeModal" class="cancel-button">Cancelar</button>
                            <button @click="currentTab = 'products'" class="next-button"
                                :disabled="!isCustomerInfoValid">
                                Siguiente
                                <ArrowRightIcon :size="16" />
                            </button>
                        </div>
                    </div>

                    <!-- Pestaña de productos -->
                    <div v-if="currentTab === 'products'" class="tab-content">
                        <div class="product-search">
                            <input type="text" v-model="productSearchQuery" placeholder="Buscar productos..."
                                class="product-search-input" />
                            <div v-if="productSearchQuery && filteredProducts.length > 0"
                                class="product-search-results">
                                <div v-for="product in filteredProducts" :key="product.id" class="product-search-item"
                                    @click="addProductToOrder(product)">
                                    <img :src="productImages[product.id] || '/api/placeholder/40/40'"
                                        :alt="product.name" class="product-image" />
                                    <div class="product-details">
                                        <span class="product-name">{{ product.name }}</span>
                                        <span class="product-price">S/{{ formatPrice(product.price) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="selected-products">
                            <h3 v-if="orderData.items.length > 0">Productos seleccionados</h3>
                            <div v-if="orderData.items.length === 0" class="no-products">
                                <ShoppingBagIcon :size="40" class="text-gray-300" />
                                <p>No hay productos seleccionados</p>
                                <p class="help-text">Busque y añada productos desde el buscador superior</p>
                            </div>
                            <div v-else class="product-list">
                                <div v-for="(item, index) in orderData.items" :key="index" class="product-item">
                                    <img :src="item.productID && productImages[item.productID] || '/api/placeholder/50/50'"
                                        :alt="item.productSnapshot.name" class="product-image" />
                                    <div class="product-details">
                                        <div class="product-info">
                                            <span class="product-name">{{ item.productSnapshot.name }}</span>
                                            <span class="product-price">S/{{ formatPrice(item.price) }}</span>
                                        </div>
                                        <div class="quantity-controls">
                                            <button @click="decreaseQuantity(index)" class="quantity-button">-</button>
                                            <span class="quantity">{{ item.quantity }}</span>
                                            <button @click="increaseQuantity(index)" class="quantity-button">+</button>
                                            <button @click="removeProduct(index)" class="remove-button">
                                                <TrashIcon :size="16" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-if="orderData.items.length > 0" class="order-summary">
                                <div class="summary-row">
                                    <span>Subtotal</span>
                                    <span>S/{{ formatPrice(orderData.subtotal) }}</span>
                                </div>
                                <!-- <div class="summary-row">
                                    <span>Envío</span>
                                    <span>S/{{ formatPrice(orderData.shipping) }}</span>
                                </div> -->
                                <div class="summary-row total">
                                    <span>Total</span>
                                    <span>S/{{ formatPrice(orderData.total) }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button @click="currentTab = 'customer'" class="back-button">
                                <ArrowLeftIcon :size="16" />
                                Atrás
                            </button>
                            <button @click="currentTab = 'payment'" class="next-button" :disabled="!isProductsValid">
                                Siguiente
                                <ArrowRightIcon :size="16" />
                            </button>
                        </div>
                    </div>

                    <!-- Pestaña de pago -->
                    <div v-if="currentTab === 'payment'" class="tab-content">
                        <div class="payment-section">
                            <h3>Método de pago</h3>
                            <div class="payment-methods">
                                <div v-for="method in paymentMethods" :key="method.value"
                                    :class="['payment-method', { selected: orderData.customerInfo.paymentMethod === method.value }]"
                                    @click="selectPaymentMethod(method.value as PaymentMethod)">
                                    <div class="payment-method-icon">
                                        <component :is="method.icon" :size="24" />
                                    </div>
                                    <span class="payment-method-name">{{ method.label }}</span>
                                </div>
                            </div>

                            <!-- <div v-if="orderData.customerInfo.paymentMethod === 'izipay'" class="payment-link-field">
                                <label for="paymentLink">Link de Pago (opcional)</label>
                                <input type="text" id="paymentLink" v-model="linkPago" placeholder="https://..." />
                            </div>

                            <div v-if="orderData.customerInfo.paymentMethod === 'izipay'" class="payment-link-field">
                                <label for="shortLink">Link Corto (opcional)</label>
                                <input type="text" id="shortLink" v-model="linkShort"
                                    placeholder="https://acortar.link/..." />
                            </div>-->

                            <div class="order-summary payment-summary">
                                <h3>Resumen del pedido</h3>
                                <div class="summary-info">
                                    <div class="summary-row">
                                        <span>Cliente:</span>
                                        <span>{{ orderData.customerInfo.firstName }} {{ orderData.customerInfo.lastName
                                            }}</span>
                                    </div>
                                    <div class="summary-row">
                                        <span>Productos:</span>
                                        <span>{{ orderData.items.length }} items</span>
                                    </div>
                                    <div class="summary-row">
                                        <span>Subtotal:</span>
                                        <span>S/{{ formatPrice(orderData.subtotal) }}</span>
                                    </div>
                                    <div v-if="orderData.customerInfo.paymentMethod === 'izipay'"
                                        class="summary-row izipay-commission">
                                        <span>Comisión Izipay (4%)</span>
                                        <span>S/{{ formatPrice(orderData.subtotal * 0.04) }}</span>
                                    </div>
                                    <!-- <div class="summary-row">
                                        <span>Envío:</span>
                                        <span>S/{{ formatPrice(orderData.shipping) }}</span>
                                    </div> -->
                                    <div class="summary-row total">
                                        <span>Total:</span>
                                        <span>S/{{ formatPrice(orderData.total) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button @click="currentTab = 'products'" class="back-button">
                                <ArrowLeftIcon :size="16" />
                                Atrás
                            </button>
                            <button @click="createOrder" class="submit-button"
                                :disabled="!isPaymentValid || submitting">
                                <span v-if="!submitting">Crear Pedido</span>
                                <Loader2Icon v-else :size="16" class="animate-spin" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useProducts } from '@/composables/useProducts';
import { useOrders } from '@/composables/useOrders';
import { useToast } from '@/composables/useToast';
import type { Order, OrderItem } from '@/types/order.types';
import type { Product } from '@/types/product.types';
import {
    XIcon,
    Loader2Icon,
    UserIcon,
    ShoppingBagIcon,
    CreditCardIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    TrashIcon,
    CreditCardIcon as IzipayIcon,
    SmartphoneIcon as YapeIcon,
    SmartphoneIcon as PlinIcon,
    DollarSignIcon as EfectivoIcon,
    BuildingIcon as TransferenciaIcon,
    CheckIcon,
    CheckCircleIcon,
    ClipboardIcon
} from 'lucide-vue-next';
import { getUrl } from 'aws-amplify/storage';

const props = defineProps<{
    show: boolean;
}>();

const emit = defineEmits(['close', 'orderCreated']);
const productImages = ref<Record<string, string>>({});

// Composables
const { products, loading: productsLoading, loadProducts } = useProducts();
const { createOrder: createOrderFunction, updateOrderShortLink } = useOrders();
const { showToast } = useToast();

// Estado del modal
const currentTab = ref('customer');
const loading = ref(false);
const submitting = ref(false);
const productSearchQuery = ref('');
const linkPago = ref('');
const linkShort = ref('');

const orderCreated = ref(false);
const orderId = ref('');
const shortLink = ref('https://acortar.link/ejemplo123');
const copySuccess = ref(false);

// Datos del pedido
const orderData = reactive<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>({
    customerInfo: {
        firstName: '',
        lastName: '',
        email: '',
        documentType: 'DNI',
        documentNumber: '',
        phone: '',
        shippingMethod: 'regular',
        invoiceType: 'boleta',
        paymentMethod: 'efectivo',
    },
    userEmail: '',
    items: [],
    subtotal: 0,
    shipping: 0,
    total: 0,
    status: 'pending',
    paymentMethod: 'efectivo',
});

// Métodos de pago disponibles
const paymentMethods = [
    { label: 'Izipay', value: 'izipay', icon: IzipayIcon },
    { label: 'Yape', value: 'yape', icon: YapeIcon },
    { label: 'Plin', value: 'plin', icon: PlinIcon },
    /*{ label: 'Efectivo', value: 'efectivo', icon: EfectivoIcon },*/
    { label: 'Transferencia', value: 'transferencia', icon: TransferenciaIcon },
];

// Filtrar productos según búsqueda
const filteredProducts = computed(() => {
    if (!productSearchQuery.value) return [];

    const query = productSearchQuery.value.toLowerCase();
    return products.value.filter(product =>
        product.name.toLowerCase().includes(query) &&
        product.active &&
        product.stock > 0
    ).slice(0, 5); // Limitar a 5 resultados para no sobrecargar la interfaz
});

const izipayCommission = computed(() => {
    if (orderData.customerInfo.paymentMethod === 'izipay') {
        return orderData.subtotal * 0.04;
    }
    return 0;
});

// Validaciones
const isCustomerInfoValid = computed(() => {
    const { firstName, lastName, email, phone, documentNumber } = orderData.customerInfo;
    return firstName && lastName && email && phone && documentNumber;
});

const isProductsValid = computed(() => {
    return orderData.items.length > 0;
});

const isPaymentValid = computed(() => {
    return orderData.customerInfo.paymentMethod === orderData.paymentMethod;
});

// Formatear precios
const formatPrice = (price: number) => {
    return price.toFixed(2);
};

// Cerrar modal
const closeModal = () => {
    // Only close if we're not in the middle of creating an order
    if (!submitting.value) {
        emit('close');
    }
};

// Métodos para manejar productos
const addProductToOrder = (product: Product) => {
    // Verificar si el producto ya está en el pedido
    const existingItemIndex = orderData.items.findIndex(item => item.productID === product.id);

    if (existingItemIndex >= 0) {
        // Si ya existe, aumentar cantidad
        increaseQuantity(existingItemIndex);
    } else {
        // Si no existe, añadir como nuevo item
        const newItem: OrderItem = {
            productID: product.id!,
            quantity: 1,
            price: product.price,
            subtotal: product.price,
            productSnapshot: {
                name: product.name,
                description: product.description,
                price: product.price,
                originalPrice: product.originalPrice,
                discountPercentage: product.discountPercentage,
                stock: product.stock,
                active: product.active,
                carousel: product.carousel,
                isPromoted: product.isPromoted,
                brandID: product.brandID,
                brand: product.brand,
                imageUrl: product.imageUrl, // Guardamos la ruta original de la imagen
                promotionStartDate: product.promotionStartDate,
                promotionEndDate: product.promotionEndDate,
                promotionType: product.promotionType,
            }
        };

        orderData.items.push(newItem);
    }

    // Limpiar búsqueda
    productSearchQuery.value = '';

    // Recalcular totales
    calculateTotals();
};

// Función para cargar las imágenes de los productos
const loadProductImages = async () => {
    for (const product of filteredProducts.value) {
        if (product.imageUrl && !productImages.value[product.id]) {
            try {
                const { url } = await getUrl({ path: product.imageUrl });
                productImages.value[product.id] = url.toString();
            } catch (error) {
                console.error("Error cargando imagen del producto:", error);
            }
        }
    }
};

const increaseQuantity = (index: number) => {
    if (orderData.items[index].quantity < orderData.items[index].productSnapshot.stock) {
        orderData.items[index].quantity++;
        orderData.items[index].subtotal = orderData.items[index].quantity * orderData.items[index].price;
        calculateTotals();
    } else {
        showToast({
            type: 'warning',
            message: 'No hay suficiente stock disponible'
        });
    }
};

const decreaseQuantity = (index: number) => {
    if (orderData.items[index].quantity > 1) {
        orderData.items[index].quantity--;
        orderData.items[index].subtotal = orderData.items[index].quantity * orderData.items[index].price;
        calculateTotals();
    }
};

const removeProduct = (index: number) => {
    orderData.items.splice(index, 1);
    calculateTotals();
};

const calculateTotals = () => {
    orderData.subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
    orderData.shipping = 0; // Por defecto sin costo de envío

    // Si el método de pago es Izipay, añadir la comisión del 4% al total
    const commission = orderData.customerInfo.paymentMethod === 'izipay' ? orderData.subtotal * 0.04 : 0;
    orderData.total = orderData.subtotal + orderData.shipping + commission;
};

// Define un tipo para los métodos de pago
type PaymentMethod = "izipay" | "yape" | "plin" | "efectivo" | "transferencia";

// Usa el tipo en tu función
const selectPaymentMethod = (method: string) => {
    orderData.customerInfo.paymentMethod = method as PaymentMethod;
    orderData.paymentMethod = method;
    // Recalcular totales para actualizar el precio según el método de pago
    calculateTotals();
};

const createOrder = async () => {
    submitting.value = true;

    try {
        // Asegurar que el email del usuario se copie del customerInfo
        orderData.userEmail = orderData.customerInfo.email;

        // Crear el pedido
        const newOrder = await createOrderFunction(orderData);

        // Guardar el ID del pedido
        if (newOrder && newOrder.id) {
            orderId.value = newOrder.id;

            // Generar el link corto usando la ruta de la aplicación
            const orderUrl = `/order/${newOrder.id}`;
            const generatedShortLink = `${window.location.origin}${orderUrl}`;
            shortLink.value = generatedShortLink;

            // Ahora actualiza la orden con el link corto
            try {
                await updateOrderShortLink(newOrder.id, generatedShortLink);
                console.log('Link corto guardado en la base de datos');
            } catch (updateError) {
                console.error('Error al guardar el link corto:', updateError);
                // No fallar si no se puede guardar el link corto
            }

            orderCreated.value = true;
        }

        showToast({
            type: 'success',
            message: 'Pedido creado exitosamente'
        });

    } catch (error) {
        console.error("Error al crear el pedido:", error);
        showToast({
            type: 'error',
            message: 'Error al crear el pedido'
        });
    } finally {
        submitting.value = false;
    }
};

// Función para copiar el link al portapapeles
const copyLinkToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(shortLink.value);
        copySuccess.value = true;

        // Resetear el estado después de 2 segundos
        setTimeout(() => {
            copySuccess.value = false;
        }, 2000);

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

// Función para cerrar el modal y emitir el evento
const finishAndClose = () => {
    // Make sure we're sending all the necessary data to the parent component
    emit('orderCreated', { id: orderId.value, shortLink: shortLink.value });
    // Explicitly close the modal
    emit('close');

    // Reset form for next use
    orderData.customerInfo = {
        firstName: '',
        lastName: '',
        email: '',
        documentType: 'DNI',
        documentNumber: '',
        phone: '',
        shippingMethod: 'regular',
        invoiceType: 'boleta',
        paymentMethod: 'efectivo',
    };
    orderData.items = [];
    orderData.subtotal = 0;
    orderData.shipping = 0;
    orderData.total = 0;
    orderData.paymentMethod = 'efectivo';

    // Reset other state values
    orderCreated.value = false;
    currentTab.value = 'customer';
    productSearchQuery.value = '';
    linkPago.value = '';
    linkShort.value = '';
};

// Cargar productos al montar el componente
onMounted(async () => {
    if (products.value.length === 0) {
        await loadProducts();
    }
});

// Añade este watcher que responde a los cambios de pestaña
watch(() => currentTab.value, (newTab) => {
    if (newTab === 'products') {
        selectPaymentMethod('');
        calculateTotals();
    } else if (newTab === 'payment') {
        selectPaymentMethod('');
    }
});

// Reiniciar formulario cuando se cierra el modal
watch(() => props.show, (newValue) => {
    if (!newValue) {
        // Reiniciar datos del formulario
        orderData.customerInfo = {
            firstName: '',
            lastName: '',
            email: '',
            documentType: 'DNI',
            documentNumber: '',
            phone: '',
            shippingMethod: 'regular',
            invoiceType: 'boleta',
            paymentMethod: 'izipay',
        };
        orderData.items = [];
        orderData.subtotal = 0;
        orderData.shipping = 0;
        orderData.total = 0;
        orderData.paymentMethod = 'izipay';

        linkPago.value = '';
        linkShort.value = '';
        currentTab.value = 'customer';
        productSearchQuery.value = '';
    }
});
watch(filteredProducts, async () => {
    await loadProductImages();
}, { immediate: true });
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.close-button {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
}

.close-button:hover {
    background-color: #f1f5f9;
    color: #0f172a;
}

.modal-content {
    padding: 1.5rem;
    flex: 1;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 1rem;
}

.tabs {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
}

.tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #64748b;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tab-button:hover:not(:disabled) {
    color: #334155;
}

.tab-button.active {
    color: #1A1A1A;
    border-bottom-color: #1A1A1A;
}

.tab-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.tab-content {
    min-height: 300px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
}

.form-group input,
.form-group select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #1A1A1A;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
}

.form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.cancel-button,
.back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #f1f5f9;
    border: none;
    border-radius: 0.375rem;
    color: #64748b;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.cancel-button:hover,
.back-button:hover {
    background-color: #e2e8f0;
    color: #0f172a;
}

.next-button,
.submit-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    background-color: #1A1A1A;
    border: none;
    border-radius: 0.375rem;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.next-button:hover:not(:disabled),
.submit-button:hover:not(:disabled) {
    background-color: #1A1A1A;
}

.next-button:disabled,
.submit-button:disabled {
    background-color: #b0b0b0;
    cursor: not-allowed;
}

.success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem 1rem;
}

.success-icon {
    margin-bottom: 1.5rem;
}

.success-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0.75rem;
}

.success-message {
    color: #4b5563;
    margin-bottom: 2rem;
}

.order-id {
    font-weight: 600;
    color: #1a1a1a;
}

.short-link-container {
    width: 100%;
    max-width: 480px;
    margin-bottom: 2rem;
}

.short-link-label {
    font-weight: 500;
    text-align: left;
    margin-bottom: 0.5rem;
    color: #4b5563;
}

.link-copy-container {
    display: flex;
    margin-bottom: 0.5rem;
}

.short-link-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-right: none;
    border-radius: 0.375rem 0 0 0.375rem;
    font-size: 0.875rem;
    background-color: #f9fafb;
    color: #1a1a1a;
}

.copy-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 0 0.375rem 0.375rem 0;
    color: #4b5563;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.copy-button:hover {
    background-color: #e5e7eb;
}

.copy-button.copied {
    background-color: #dcfce7;
    color: #16a34a;
    border-color: #86efac;
}

.short-link-help {
    font-size: 0.875rem;
    color: #6b7280;
    text-align: left;
}

.success-actions {
    display: flex;
    justify-content: center;
    width: 100%;
}

/* Estilos para la pestaña de productos */
.product-search {
    margin-bottom: 1.5rem;
    position: relative;
}

.product-search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.2s;
}

.product-search-input:focus {
    outline: none;
    border-color: #1A1A1A;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
}

.product-search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0 0 0.375rem 0.375rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 20;
    max-height: 300px;
    overflow-y: auto;
}

.product-search-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.product-search-item:hover {
    background-color: #f8fafc;
}

.product-image {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 0.25rem;
    background-color: #f1f5f9;
}

.product-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.product-name {
    font-weight: 500;
    color: #0f172a;
}

.product-price {
    font-size: 0.875rem;
    color: #334155;
}

.selected-products {
    min-height: 200px;
}

.no-products {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background-color: #f8fafc;
    border-radius: 0.5rem;
    color: #64748b;
    gap: 0.5rem;
}

.help-text {
    font-size: 0.875rem;
    color: #94a3b8;
}

.product-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
}

.product-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background-color: #f8fafc;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
}

.product-item:hover {
    background-color: #f1f5f9;
}

.product-item .product-image {
    width: 50px;
    height: 50px;
}

.product-item .product-details {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.quantity-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s;
}

.quantity-button:hover {
    background-color: #f1f5f9;
}

.quantity {
    font-weight: 500;
    min-width: 24px;
    text-align: center;
}

.remove-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border: none;
    background-color: #fee2e2;
    color: #b91c1c;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.remove-button:hover {
    background-color: #fecaca;
}

.order-summary {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: #f8fafc;
    border-radius: 0.5rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    color: #334155;
}

.summary-row.total {
    font-weight: 600;
    color: #0f172a;
    padding-top: 0.5rem;
    margin-top: 0.5rem;
    border-top: 1px dashed #e2e8f0;
}

/* Estilos para la pestaña de pago */
.payment-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.payment-methods {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
}

.payment-method {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.payment-method:hover {
    background-color: #f8fafc;
}

.payment-method.selected {
    border-color: #1A1A1A;
    background-color: #eff6ff;
}

.payment-method-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #f1f5f9;
    color: #1A1A1A;
}

.payment-method.selected .payment-method-icon {
    background-color: #e0e7ff;
}

.payment-method-name {
    font-weight: 500;
    font-size: 0.875rem;
    color: #334155;
}

.payment-link-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-top: 1rem;
}

.payment-link-field label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
}

.payment-link-field input {
    padding: 0.5rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.2s;
}

.payment-link-field input:focus {
    outline: none;
    border-color: #1A1A1A;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
}

.payment-summary {
    background-color: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
}

.payment-summary h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #334155;
    margin-top: 0;
    margin-bottom: 1rem;
}

.summary-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* Responsive */
@media (max-width: 640px) {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .payment-methods {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .form-actions {
        flex-direction: column;
        gap: 0.75rem;
    }

    .form-actions button {
        width: 100%;
        justify-content: center;
    }
}
</style>