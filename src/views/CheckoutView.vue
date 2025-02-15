<template>
    <MainLayout>
        <div class="checkout-container">
            <!-- Header con pasos -->
            <div class="checkout-header">
                <div class="header-top">
                    <!-- Código del header (opcional) -->
                </div>

                <div class="steps-container">
                    <div class="steps-line"></div>
                    <div v-for="(step, index) in steps" :key="index" class="step-item"
                        :class="{ active: currentStep >= index }">
                        <div class="step-number">{{ index + 1 }}</div>
                        <span class="step-name">{{ step }}</span>
                    </div>
                </div>
            </div>

            <!-- Contenido principal -->
            <div class="checkout-content">
                <!-- Sección del formulario -->
                <div class="form-section">
                    <!-- Información del Cliente -->
                    <div v-if="currentStep === 0" class="checkout-card">
                        <h2>Información del cliente</h2>
                        <p class="customer-subtitle">Por favor asegúrese de ingresar datos verídicos y correctos, ya que
                            esta información será esencial para la entrega de su pedido.</p>
                        <form @submit.prevent="nextStep" class="customer-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nombre *</label>
                                    <input v-model="form.firstName" type="text" required @input="validateFirstName"
                                        :class="{ 'error': errors.firstName }">
                                    <span class="error-message" v-if="errors.firstName">{{ errors.firstName }}</span>
                                </div>
                                <div class="form-group">
                                    <label>Apellido *</label>
                                    <input v-model="form.lastName" type="text" required @input="validateLastName"
                                        :class="{ 'error': errors.lastName }">
                                    <span class="error-message" v-if="errors.lastName">{{ errors.lastName }}</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Email *</label>
                                <input v-model="form.email" type="email" required @input="validateEmail"
                                    :class="{ 'error': errors.email }">
                                <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Tipo de documento *</label>
                                    <select v-model="form.documentType" required @change="validateDocumentNumber">
                                        <option value="DNI">DNI</option>
                                        <option value="CE">CE</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Número de documento *</label>
                                    <input v-model="form.documentNumber" type="text" required
                                        @input="validateDocumentNumber" :class="{ 'error': errors.documentNumber }"
                                        :maxlength="getDocumentMaxLength">
                                    <span class="error-message" v-if="errors.documentNumber">{{ errors.documentNumber
                                        }}</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Número de celular *</label>
                                <input v-model="form.phone" type="tel" required @input="validatePhone"
                                    :class="{ 'error': errors.phone }" maxlength="9">
                                <span class="error-message" v-if="errors.phone">{{ errors.phone }}</span>
                            </div>

                            <button type="submit" class="button primary" :disabled="!isFormValid || noProducts">
                                Siguiente
                            </button>
                            <p v-if="noProducts" class="warning-message">
                                No hay productos para continuar.
                            </p>
                        </form>
                    </div>

                    <!-- Información de Envío -->
                    <div v-if="currentStep === 1" class="checkout-card">
                        <h2>Entrega y Pago</h2>
                        <form @submit.prevent="nextStep" class="shipping-form">
                            <div class="form-section">
                                <h3>Forma de entrega</h3>
                                <div class="radio-group">
                                    <label class="radio-card">
                                        <input type="radio" v-model="form.shippingMethod" value="regular">
                                        <div class="radio-content">
                                            <div class="radio-title">Envío Regular</div>
                                            <div class="radio-description">3-5 días hábiles</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div class="form-section">
                                <h3>Tipo de comprobante</h3>
                                <div class="invoice-options">
                                    <label class="radio-button">
                                        <input type="radio" v-model="form.invoiceType" value="boleta">
                                        <span>Boleta</span>
                                    </label>
                                    <label class="radio-button">
                                        <input type="radio" v-model="form.invoiceType" value="factura">
                                        <span>Factura</span>
                                    </label>
                                </div>
                            </div>

                            <div class="button-group">
                                <button type="button" @click="currentStep--" class="button secondary">
                                    Anterior
                                </button>
                                <button type="submit" class="button primary">
                                    Siguiente
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Resumen del Pedido -->
                    <div v-if="currentStep === 2" class="checkout-card">
                        <h2>Resumen de pago</h2>
                        <div class="order-review">
                            <div class="customer-summary">
                                <h3>Información de contacto</h3>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">Nombre completo</span>
                                        <span class="info-value">{{ form.firstName }} {{ form.lastName }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Email</span>
                                        <span class="info-value">{{ form.email }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Teléfono</span>
                                        <span class="info-value">{{ form.phone }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Documento</span>
                                        <span class="info-value">{{ form.documentType }}: {{ form.documentNumber
                                            }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="button-group">
                                <button type="button" @click="currentStep--" class="button secondary">
                                    Anterior
                                </button>
                                <!-- Se muestra el botón de "Realizar pedido" solo si aún no se generó la URL de WhatsApp -->
                                <button @click="handleSubmitOrder" class="button primary" :disabled="submitting">
                                    {{ submitting ? 'Procesando...' : 'Realizar pedido' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen de la orden -->
                <div class="order-summary">
                    <div class="summary-card">
                        <h2>Resumen de tu Orden</h2>

                        <div v-if="stockValidationMessage" class="stock-warning">
                            {{ stockValidationMessage }}
                        </div>

                        <div class="cart-items-container">
                            <div v-if="loadingState !== 'idle'" class="cart-loading-overlay">
                                <div class="loading-spinner"></div>
                                <span>{{ loadingMessage }}</span>
                            </div>

                            <div class="cart-items">
                                <div v-for="item in cartItems" :key="item.id" class="cart-item">
                                    <div class="item-container">
                                        <img :src="imageUrls[item.productID] || '/api/placeholder/80/80'"
                                            :alt="productDetails[item.productID]?.name" class="item-image">
                                        <div class="item-details">
                                            <div class="item-name">{{ productDetails[item.productID]?.name }}</div>
                                            <div class="item-quantity">
                                                Cantidad: {{ item.quantity }}
                                                <span v-if="productDetails[item.productID]?.stock < item.quantity"
                                                    class="stock-alert">
                                                    (Stock disponible: {{ productDetails[item.productID]?.stock }})
                                                </span>
                                            </div>
                                            <div class="item-price">S/. {{ item.price.toFixed(2) }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="summary-totals">
                            <div class="summary-row">
                                <span>Subtotal</span>
                                <span>S/. {{ subtotal.toFixed(2) }}</span>
                            </div>
                            <div class="summary-row">
                                <span>Envío</span>
                                <span>{{ shippingCost > 0 ? `S/. ${shippingCost.toFixed(2)}` : 'Gratis' }}</span>
                            </div>
                            <div class="summary-row total">
                                <span>Total</span>
                                <span>S/. {{ total.toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ArrowLeftIcon } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useCart } from '@/composables/useCart';
import { useToast } from '@/composables/useToast';
import MainLayout from '@/layouts/MainLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useProducts } from '@/composables/useProducts';
import { getUrl } from 'aws-amplify/storage';
import type { Product } from '@/types/product.types';
import { useAuthStore } from '@/stores/auth';
import { useOrders } from '@/composables/useOrders';
import type { CustomerInfo, Order } from '@/types/order.types';

const router = useRouter();
const auth = useAuthStore();
const { createOrder } = useOrders();
const { showToast } = useToast();
const { items: cartItems, shippingCost, subtotal, total, validItems, clearCart, updateQuantity, removeFromCart } = useCart();
const { products, loadProducts, updateProduct } = useProducts();

const steps = ['Identificación', 'Entrega y Pago', 'Resumen de pago'];
const currentStep = ref(0);
const submitting = ref(false);
const loadingState = ref<'idle' | 'validating' | 'generating'>('idle');
const imageUrls = ref<Record<string, string>>({});
const productDetails = ref<Record<string, Product>>({});
const stockValidationMessage = ref('');
const whatsappLink = ref('');
const noProducts = computed(() => total.value <= 0);

const errors = ref({
    firstName: '',
    lastName: '',
    email: '',
    documentNumber: '',
    phone: ''
});

const form = ref<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    documentType: 'DNI',
    documentNumber: '',
    phone: '',
    shippingMethod: 'regular',
    invoiceType: 'boleta'
});

const nextStep = () => {
    if (currentStep.value === 0) {
        validateFirstName();
        validateLastName();
        validateEmail();
        validateDocumentNumber();
        validatePhone();

        if (!isFormValid.value) {
            return;
        }
    }

    if (currentStep.value < steps.length - 1) {
        currentStep.value++;
    }
};

const isFormValid = computed(() => {
    return !Object.values(errors.value).some(error => error !== '') &&
        Object.values(form.value).every(value => value !== '');
});

const getDocumentMaxLength = computed(() => {
    const maxLengths = {
        'DNI': 8,
        'CE': 12,
        'Pasaporte': 12
    };
    return maxLengths[form.value.documentType];
});

const validateFirstName = () => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    if (!nameRegex.test(form.value.firstName)) {
        errors.value.firstName = 'Ingrese un nombre válido (solo letras)';
    } else {
        errors.value.firstName = '';
    }
};

const validateLastName = () => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    if (!nameRegex.test(form.value.lastName)) {
        errors.value.lastName = 'Ingrese un apellido válido (solo letras)';
    } else {
        errors.value.lastName = '';
    }
};

const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.value.email)) {
        errors.value.email = 'Ingrese un email válido';
    } else {
        errors.value.email = '';
    }
};

const validateDocumentNumber = () => {
    const documentValidations = {
        'DNI': {
            regex: /^\d{8}$/,
            message: 'El DNI debe tener exactamente 8 dígitos numéricos'
        },
        'CE': {
            regex: /^[a-zA-Z0-9]{9,12}$/,
            message: 'El CE debe tener entre 9 y 12 caracteres alfanuméricos'
        },
        'Pasaporte': {
            regex: /^[a-zA-Z0-9]{6,12}$/,
            message: 'El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos'
        }
    };

    const validation = documentValidations[form.value.documentType];
    if (!validation.regex.test(form.value.documentNumber)) {
        errors.value.documentNumber = validation.message;
    } else {
        errors.value.documentNumber = '';
    }
};

const validatePhone = () => {
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(form.value.phone)) {
        errors.value.phone = 'Ingrese un número de celular válido';
    } else {
        errors.value.phone = '';
    }
};

const loadingMessage = computed(() => {
    switch (loadingState.value) {
        case 'validating':
            return 'Validando stock...';
        case 'generating':
            return 'Generando pedido...';
        default:
            return '';
    }
});

const updateProductDetails = () => {
    const productsMap: Record<string, Product> = {};
    products.value.forEach(product => {
        productsMap[product.id] = product;
    });
    productDetails.value = productsMap;
};

const loadImageUrls = async () => {
    for (const item of validItems.value) {
        const product = productDetails.value[item.productID];
        if (product?.imageUrl) {
            try {
                const { url } = await getUrl({ path: product.imageUrl });
                imageUrls.value[item.productID] = url.toString();
            } catch (error) {
                console.error("Error cargando imagen:", error);
            }
        }
    }
};

const initializeCheckout = async () => {
    try {
        await loadProducts();
        updateProductDetails();
        await loadImageUrls();
    } catch (error) {
        console.error('Error initializing checkout:', error);
    }
};

/**
 * Valida y actualiza el stock de los productos en el carrito
 * Retorna true si todos los productos tienen stock suficiente
 */
const validateAndUpdateStock = async (): Promise<boolean> => {
    loadingState.value = 'validating';
    try {
        await loadProducts(); // Refresh products data
        let valid = true;
        let updates: Promise<any>[] = [];
        let stockWarnings: string[] = [];

        for (const item of validItems.value) {
            const product = productDetails.value[item.productID];

            if (!product) {
                stockWarnings.push(`Producto no encontrado: ${item.productID}`);
                valid = false;
                continue;
            }

            if (product.stock < item.quantity) {
                valid = false;
                if (product.stock > 0) {
                    // Update quantity to available stock
                    updates.push(updateQuantity(item.id, product.stock));
                    stockWarnings.push(
                        `Stock insuficiente para ${product.name}. Se actualizó a ${product.stock} unidades disponibles.`
                    );
                } else {
                    // Remove item if no stock
                    updates.push(removeFromCart(item.id));
                    stockWarnings.push(
                        `${product.name} no tiene stock disponible y se removió del carrito.`
                    );
                }
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
            stockValidationMessage.value = 'Algunos productos han sido actualizados por cambios en stock. Por favor, revisa tu orden.';
            /*showToast({
                type: 'warning',
                message: stockWarnings.join('\n')
            });*/
        } else {
            stockValidationMessage.value = '';
        }

        return valid;
    } finally {
        if (loadingState.value === 'validating') {
            loadingState.value = 'idle';
        }
    }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateOrder = async () => {
    loadingState.value = 'generating';
    try {

        await sleep(2000);

        const userEmail = auth.userEmail ?? form.value.email;

        if (!auth.userEmail && form.value.email) {
            localStorage.setItem('userEmail', form.value.email);
        }

        // Create order and update stock
        const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
            customerInfo: form.value,
            userEmail,
            items: validItems.value.map(item => ({
                productID: item.productID,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            })),
            subtotal: subtotal.value,
            shipping: shippingCost.value,
            total: total.value,
            status: 'pending'
        };


        console.log("items?????: ", orderData)
        const newOrder = await createOrder(orderData);

        if (!newOrder) {
            throw new Error('Error al crear el pedido');
        }

        // Submit order to backend
        /*const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        if (!orderResponse.ok) {
            throw new Error('Error al crear el pedido');
        }*/

        // Format WhatsApp message and create URL
        const message = formatWhatsAppMessage(orderData);
        const phoneNumber = '51962224044';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        whatsappLink.value = whatsappUrl;
        // Update product stock
        //await updateProductStock();
        //await clearCart();

        // Redirect to WhatsApp
        //window.open(whatsappUrl, '_blank');

        await clearCart();
        showToast({
            type: 'success',
            message: 'Pedido registrado correctamente'
        });

        //router.push('/order-confirmation');
        router.push('/my-orders');
    } catch (error) {
        console.error('Error generando orden:', error);
        throw error;
    } finally {
        loadingState.value = 'idle';
    }
};

const formatWhatsAppMessage = (order: any) => {
    const { customerInfo, items, subtotal, shipping, total } = order;

    // Format customer information
    const customerDetails =
        `*INFORMACIÓN DEL CLIENTE*\n` +
        `Nombre: ${customerInfo.firstName} ${customerInfo.lastName}\n` +
        `Email: ${customerInfo.email}\n` +
        `${customerInfo.documentType}: ${customerInfo.documentNumber}\n` +
        `Teléfono: ${customerInfo.phone}\n\n`;

    // Format items
    const itemsDetails = items.map((item: any) => {
        const product = productDetails.value[item.productID];
        return `- ${product?.name} (${item.quantity}x) : S/. ${item.price.toFixed(2)}`;
    }).join('\n');

    // Format totals
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

const handleSubmitOrder = async () => {
    try {
        if (noProducts.value) {
            showToast({
                type: 'warning',
                message: 'No hay productos en la orden. Por favor, agrega productos antes de continuar.'
            });
            return;
        }

        submitting.value = true;
        // Validate stock before proceeding
        const stockValid = await validateAndUpdateStock();
        if (!stockValid) {
            submitting.value = false;
            return;
        }

        await generateOrder();
    } catch (error) {
        showToast({
            type: 'error',
            //message: error instanceof Error ? error.message : 'Error al procesar el pedido'
            message: 'Error al procesar el pedido'
        });
    } finally {
        submitting.value = false;
    }
};

const openWhatsapp = () => {
    if (whatsappLink.value) {
        window.open(whatsappLink.value, '_blank');
    }
};

watch(
    () => products.value,
    () => {
        updateProductDetails();
    }
);

watch(
    () => validItems.value,
    () => {
        loadImageUrls();
    }
);

/*watch(
    () => currentStep.value,
    async (newStep) => {
        if (newStep === 2) { // Summary step
            await validateAndUpdateStock();
        }
    }
);*/

onMounted(() => {
    initializeCheckout();
});
</script>

<style scoped>
.cart-items-container {
    position: relative;
    min-height: 100px;
}

.customer-subtitle {
    font-size: 0.875rem;
    color: #adadad;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.warning-message {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #adadad;
}

.error {
    border-color: #dc3545 !important;
}

.error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.cart-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.stock-warning {
    background-color: #fff3cd;
    color: #856404;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.25rem;
    border: 1px solid #ffeeba;
}

.stock-alert {
    color: #dc3545;
    font-size: 0.875rem;
    margin-left: 0.5rem;
}

.checkout-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;

    .checkout-header {
        margin-bottom: 2rem;

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;

            h1 {
                font-size: 1.875rem;
                font-weight: 600;
                color: #1a1a1a;
            }

            .back-button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border: none;
                background: transparent;
                color: #666;
                cursor: pointer;
                font-size: 0.875rem;

                &:hover {
                    color: #1a1a1a;
                }

                .icon {
                    width: 1.25rem;
                    height: 1.25rem;
                }
            }
        }

        .steps-container {
            position: relative;
            display: flex;
            justify-content: space-between;
            padding: 0 1rem;

            .steps-line {
                position: absolute;
                top: 1rem;
                left: 2rem;
                right: 2rem;
                height: 2px;
                background: #e5e7eb;
                z-index: 1;
            }

            .step-item {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: 2;

                .step-number {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    background: #fff;
                    border: 2px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .step-name {
                    font-size: 0.875rem;
                    color: #666;
                }

                &.active {
                    .step-number {
                        background: #000000;
                        color: #fff;
                    }

                    .step-name {
                        color: #1a1a1a;
                        font-weight: 500;
                    }
                }
            }
        }
    }

    .checkout-content {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 2rem;

        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
        }
    }

    .checkout-card {
        background: #fff;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin-bottom: 1.5rem;

        h2 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #1a1a1a;
        }

        h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1a1a1a;
        }
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .form-group {
        margin-bottom: 1rem;

        label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #4b5563;
            margin-bottom: 0.5rem;
        }

        input,
        select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            color: #1a1a1a;
            transition: border-color 0.2s;

            &:focus {
                outline: none;
                border-color: #000000;
                box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
            }
        }
    }

    .radio-group {
        display: grid;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .radio-card {
        display: flex;
        align-items: flex-start;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;

        input[type="radio"] {
            margin-right: 1rem;
            margin-top: 0.25rem;
        }

        .radio-content {
            flex: 1;

            .radio-title {
                font-weight: 500;
                color: #1a1a1a;
                margin-bottom: 0.25rem;
            }

            .radio-description {
                font-size: 0.875rem;
                color: #666;
            }
        }

        &:hover {
            border-color: #000000;
        }
    }

    .invoice-options {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;

        .radio-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
                border-color: #000000;
            }

            input[type="radio"] {
                margin: 0;
            }
        }
    }

    .button-group {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }

    .button {
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;

        &.primary {
            background: #000000;
            color: #fff;
            border: none;

            &:hover {
                background: #363636;
            }

            &:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
        }

        &.secondary {
            background: #fff;
            color: #4b5563;
            border: 1px solid #e5e7eb;

            &:hover {
                border-color: #9ca3af;
            }
        }
    }

    .order-summary {
        position: sticky;
        top: 2rem;

        .summary-card {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
        }

        .cart-items {
            margin: 1.5rem 0;

            .cart-item {
                padding: 1rem 0;
                border-bottom: 1px solid #e5e7eb;

                &:last-child {
                    border-bottom: none;
                }

                .item-container {
                    display: flex;
                    gap: 1rem;

                    .item-image {
                        width: 80px;
                        height: 80px;
                        object-fit: cover;
                        border-radius: 0.25rem;
                    }

                    .item-details {
                        flex: 1;

                        .item-name {
                            font-weight: 500;
                            color: #1a1a1a;
                            margin-bottom: 0.25rem;
                        }

                        .item-quantity {
                            font-size: 0.875rem;
                            color: #666;
                            margin-bottom: 0.25rem;
                        }

                        .item-price {
                            font-weight: 500;
                            color: #1a1a1a;
                        }
                    }
                }
            }
        }

        .summary-totals {
            border-top: 1px solid #e5e7eb;
            padding-top: 1rem;

            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.75rem;
                font-size: 0.875rem;
                color: #4b5563;

                &.total {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-top: 0.75rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid #e5e7eb;
                }
            }
        }
    }

    .info-grid {
        display: grid;
        gap: 1rem;

        .info-item {
            .info-label {
                display: block;
                font-size: 0.875rem;
                color: #666;
                margin-bottom: 0.25rem;
            }

            .info-value {
                font-weight: 500;
                color: #1a1a1a;
            }
        }
    }
}
</style>