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
                            esta información será esencial para el pago y entrega de su pedido.</p>
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
                                            <div class="radio-description">1-2 días hábiles</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- <div class="form-section">
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
                            </div> -->

                            <div class="form-section payment-method-section">
                                <h3>Método de pago</h3>
                                <div class="payment-methods-container">
                                    <!-- <div class="payment-method-option"
                                        :class="{ active: form.paymentMethod === 'tarjeta' }">
                                        <label class="payment-option-label">
                                            <input type="radio" v-model="form.paymentMethod" value="tarjeta"
                                                class="payment-method-input" />
                                            <div class="payment-option-text">
                                                <span class="payment-method-name">Tarjeta</span>
                                                <span class="payment-method-desc">Crédito o débito</span>
                                            </div>
                                            <div class="payment-option-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                                    <line x1="2" y1="10" x2="22" y2="10" />
                                                </svg>
                                            </div>
                                        </label>
                                    </div> -->

                                    <div class="payment-method-option"
                                        :class="{ active: form.paymentMethod === 'yape' }">
                                        <label class="payment-option-label">
                                            <input type="radio" v-model="form.paymentMethod" value="yape"
                                                class="payment-method-input" />
                                            <div class="payment-option-text">
                                                <span class="payment-method-name">Yape</span>
                                                <span class="payment-method-desc">Escanea y paga</span>
                                            </div>
                                            <div class="payment-option-icon yape">
                                                <img src="/yape-icon.png" alt="Yape" class="payment-method-img" />
                                            </div>
                                        </label>
                                    </div>

                                    <div class="payment-method-option"
                                        :class="{ active: form.paymentMethod === 'plin' }">
                                        <label class="payment-option-label">
                                            <input type="radio" v-model="form.paymentMethod" value="plin"
                                                class="payment-method-input" />
                                            <div class="payment-option-text">
                                                <span class="payment-method-name">Plin</span>
                                                <span class="payment-method-desc">Escanea y paga</span>
                                            </div>
                                            <div class="payment-option-icon plin">
                                                <img src="/plin-icon.png" alt="Plin" class="payment-method-img" />
                                            </div>
                                        </label>
                                    </div>

                                    <!-- <div class="payment-method-option" :class="{ active: form.paymentMethod === 'qr' }">
                                        <label class="payment-option-label">
                                            <input type="radio" v-model="form.paymentMethod" value="qr"
                                                class="payment-method-input" />
                                            <div class="payment-option-text">
                                                <span class="payment-method-name">Código QR</span>
                                                <span class="payment-method-desc">Escanea y paga</span>
                                            </div>
                                            <div class="payment-option-icon">
                                                <img src="/qr-icon.png" alt="QR Code" class="payment-method-img" />
                                            </div>
                                        </label>
                                    </div> -->
                                    <div class="payment-method-option" :class="{ active: form.paymentMethod === 'efectivo' }">
                                        <label class="payment-option-label">
                                            <input type="radio" v-model="form.paymentMethod" value="efectivo"
                                                class="payment-method-input" />
                                            <div class="payment-option-text">
                                                <span class="payment-method-name">Pago Contra Entrega</span>
                                                <span class="payment-method-desc">Paga al recibir el producto</span>
                                            </div>
                                            <div class="payment-option-icon">
                                                <img src="/contraentrega.png" alt="QR Code" class="payment-method-img" />
                                            </div>
                                        </label>
                                    </div>
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
                                            :alt="item.product?.name || 'Producto'" class="item-image">
                                        <div class="item-details">
                                            <div class="item-name">{{ item.product?.name || 'Producto no disponible' }}
                                            </div>
                                            <div class="item-quantity">
                                                Cantidad: {{ item.quantity }}
                                                <span v-if="(item.product?.stock ?? 0) < item.quantity"
                                                    class="stock-alert">
                                                    (Stock disponible: {{ item.product?.stock ?? 0 }})
                                                </span>
                                            </div>
                                            <div class="price-container">
                                                <span v-if="item.isPromoted && isPromotionActive(item)"
                                                    class="original-price">
                                                    S/. {{ item.originalPrice.toFixed(2) }}
                                                </span>
                                                <span class="item-price"
                                                    :class="{ promotional: item.isPromoted && isPromotionActive(item) }">
                                                    S/. {{ item.price.toFixed(2) }}
                                                </span>
                                                <span v-if="item.isPromoted && isPromotionActive(item)"
                                                    class="discount-badge">
                                                    -{{ item.discountPercentage }}%
                                                </span>
                                            </div>
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
                            <!-- <div class="summary-row">
                                <span>Envío</span>
                                <span>{{ shippingCost > 0 ? `S/. ${shippingCost.toFixed(2)}` : 'Gratis' }}</span>
                            </div> -->
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
import type { Product } from '@/types/product.types';
import { useAuthStore } from '@/stores/auth';
import { useOrders } from '@/composables/useOrders';
import type { CustomerInfo, Order } from '@/types/order.types';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { v4 as uuidv4 } from 'uuid';

const router = useRouter();
const auth = useAuthStore();
const { createOrder } = useOrders();
const { showToast } = useToast();
const { items: cartItems, shippingCost, subtotal, total, validItems, clearCart, updateQuantity, removeFromCart } = useCart();

const steps = ['Identificación', 'Entrega y Pago', 'Resumen de pago'];
const currentStep = ref(0);
const submitting = ref(false);
const loadingState = ref<'idle' | 'validating' | 'generating'>('idle');
const imageUrls = ref<Record<string, string>>({});
/*const productDetails = ref<Record<string, Product>>({});*/
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
    invoiceType: 'boleta',
    paymentMethod: 'yape'
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

/*const updateProductDetails = () => {
    const productsMap: Record<string, Product> = {};
    products.value.forEach(product => {
        productsMap[product.id] = product;
    });
    productDetails.value = productsMap;
};*/

const loadImageUrls = async () => {
    for (const item of validItems.value) {
        if (item.product?.imageUrl) {
            try {
                const { url } = await getUrl({ path: item.product.imageUrl });
                imageUrls.value[item.productID] = url.toString();
            } catch (error) {
                console.error("Error cargando imagen:", error);
            }
        }
    }
};

const initializeCheckout = async () => {
    try {
        //updateProductDetails();
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
        let valid = true;
        let updates: Promise<any>[] = [];
        let stockWarnings: string[] = [];

        for (const item of validItems.value) {
            // Validar que el producto exista
            if (!item.product) {
                stockWarnings.push(`Producto no encontrado: ${item.productID}`);
                valid = false;
                continue;
            }

            const stock = item.product.stock ?? 0; // Usar 0 como valor por defecto

            if (stock < item.quantity) {
                valid = false;
                if (stock > 0) {
                    updates.push(updateQuantity(item.id, stock));
                    stockWarnings.push(
                        `Stock insuficiente para ${item.product.name}. Se actualizó a ${stock} unidades disponibles.`
                    );
                } else {
                    updates.push(removeFromCart(item.id));
                    stockWarnings.push(
                        `${item.product.name} no tiene stock disponible y se removió del carrito.`
                    );
                }
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
            stockValidationMessage.value = 'Algunos productos han sido actualizados por cambios en stock. Por favor, revisa tu orden.';
        } else {
            stockValidationMessage.value = '';
        }

        return valid;
    } finally {
        loadingState.value = 'idle';
    }
};

const isPromotionActive = (item: any) => {
    if (!item.isPromoted || !item.product?.promotionStartDate || !item.product?.promotionEndDate) {
        return false;
    }

    const today = getCurrentPeruDate();
    return today >= item.product.promotionStartDate && today <= item.product.promotionEndDate;
};

const getCurrentPeruDate = () => {
    const date = new Date();
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));

    const year = peruDate.getFullYear();
    const month = String(peruDate.getMonth() + 1).padStart(2, '0');
    const day = String(peruDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateOrder = async () => {
    loadingState.value = 'generating';
    try {
        await sleep(3000);
        const userEmail = auth.userEmail ?? form.value.email;

        if (!auth.userEmail && form.value.email) {
            localStorage.setItem('userEmail', form.value.email);
        }

        // Procesar los productos del carrito
        const processedItems = await Promise.all(validItems.value.map(async item => {
            let orderImagePath = '';

            // Procesar la imagen del producto
            if (item.product?.imageUrl) {
                try {
                    // Obtener la URL de la imagen original
                    const { url } = await getUrl({ path: item.product.imageUrl });

                    // Fetch la imagen
                    const response = await fetch(url.toString());
                    const blob = await response.blob();

                    // Redimensionar la imagen para reducir su tamaño
                    const resizedBlob = await resizeImage(blob, 400, 400);

                    // Crear una ruta única para guardar una copia de la imagen en la carpeta de pedidos
                    const orderImagesFolder = 'order-images';
                    const uniqueFileName = `${Date.now()}-${item.productID}`;
                    const imagePath = `${orderImagesFolder}/${uniqueFileName}.jpg`;

                    // Subir la imagen redimensionada a Storage
                    await uploadData({
                        data: resizedBlob as Blob,
                        path: imagePath,
                        options: {
                            contentType: 'image/jpeg'
                        }
                    }).result;

                    // Guardar la ruta de la imagen en el pedido
                    orderImagePath = imagePath;
                } catch (error) {
                    console.error("Error procesando imagen:", error);
                }
            }

            return {
                productID: item.productID,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity,
                productSnapshot: {
                    name: item.product?.name || '',
                    brand: item.product?.brand || '',
                    brandID: item.product?.brandID || '',
                    description: item.product?.description || '',
                    price: item.product?.price || 0,
                    originalPrice: item.product?.originalPrice || 0,
                    discountPercentage: item.product?.discountPercentage || 0,
                    // Usar la nueva ruta independiente para la imagen
                    imageUrl: orderImagePath,
                    categories: item.product?.categories || [],
                    stock: item.product?.stock || 0,
                    active: item.product?.active || false,
                    isPromoted: item.product?.isPromoted || false,
                    promotionStartDate: item.product?.promotionStartDate || '',
                    promotionEndDate: item.product?.promotionEndDate || '',
                    promotionType: item.product?.promotionType || ''
                }
            };
        }));


        // Crear orden y actualizar stock
        const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
            customerInfo: form.value,
            userEmail,
            items: processedItems,
            subtotal: subtotal.value,
            shipping: shippingCost.value,
            total: total.value,
            status: 'pending',
            paymentMethod: form.value.paymentMethod,
            linkPago: '',
        };

        const newOrder = await createOrder(orderData);

        // Resto de la función...
        if (!newOrder) {
            throw new Error('Error al crear el pedido');
        }

        // Formato del mensaje de WhatsApp
        const message = formatWhatsAppMessage(orderData);
        const phoneNumber = '51934505566';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        whatsappLink.value = whatsappUrl;

        await clearCart();
        showToast({
            type: 'success',
            message: 'Pedido registrado correctamente'
        });

        router.push('/my-orders');
    } catch (error) {
        console.error('Error generando orden:', error);
        throw error;
    } finally {
        loadingState.value = 'idle';
    }
};

const resizeImage = (blob: Blob | MediaSource, maxWidth: number, maxHeight: number, quality = 0.8) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            // Crear un canvas para redimensionar
            const canvas = document.createElement('canvas');

            // Calcular nuevas dimensiones manteniendo la proporción
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width * (maxHeight / height));
                    height = maxHeight;
                }
            }

            // Establecer dimensiones del canvas
            canvas.width = width;
            canvas.height = height;

            // Dibujar imagen en el canvas
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
            } else {
                console.error('Failed to get 2D context');
            }

            // Convertir a Blob con calidad reducida
            canvas.toBlob((resizedBlob) => {
                resolve(resizedBlob);
            }, 'image/jpeg', quality);
        };

        img.src = URL.createObjectURL(blob);
    });
};

const formatWhatsAppMessage = (order: any) => {
    const { customerInfo, items, subtotal, shipping, total } = order;

    const customerDetails =
        `*INFORMACIÓN DEL CLIENTE*\n` +
        `Nombre: ${customerInfo.firstName} ${customerInfo.lastName}\n` +
        `Email: ${customerInfo.email}\n` +
        `${customerInfo.documentType}: ${customerInfo.documentNumber}\n` +
        `Teléfono: ${customerInfo.phone}\n\n`;

    // Usar item.product directamente
    const itemsDetails = items.map((item: any) => {
        return `- ${item.product?.name} (${item.quantity}x) : S/. ${item.price.toFixed(2)}`;
    }).join('\n');

    const totalsDetails =
        `\n*TOTALES*\n` +
        `Subtotal: S/. ${subtotal.toFixed(2)}\n` +
        /*`Envío: ${shipping > 0 ? `S/. ${shipping.toFixed(2)}` : 'Gratis'}\n` +*/
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

/*watch(
    () => products.value,
    () => {
        updateProductDetails();
    }
);*/

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

.payment-dropdown {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #1a1a1a;
    background-color: #fff;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.payment-dropdown:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.payment-dropdown:hover {
    border-color: #d1d5db;
}

/* Estilo para las opciones dentro del dropdown */
.payment-dropdown option {
    padding: 0.5rem;
    font-size: 0.875rem;
}

/* Contenedor para el dropdown con ícono opcional */
.payment-method-container {
    position: relative;
    margin-bottom: 1.5rem;
}

/* Para añadir un ícono al dropdown si se desea */
.payment-method-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
}

/* Si se usa un ícono, añadir padding extra a la izquierda */
.payment-dropdown.with-icon {
    padding-left: 2.5rem;
}

.payment-method-section {
    margin-bottom: 1.5rem;
}

.payment-methods-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.payment-method-option {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
}

.payment-method-option:hover {
    border-color: #d1d5db;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.payment-method-option.active {
    border-color: #000000;
    background-color: #f9fafb;
}

.payment-option-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem;
    cursor: pointer;
}

.payment-method-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.payment-option-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding-right: 12px;
}

.payment-option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
}

.price-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
}

.original-price {
    text-decoration: line-through;
    color: #666;
    font-size: 0.9em;
}

.promotional {
    color: #e53e3e;
}

.discount-badge {
    background-color: #e53e3e;
    color: white;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.8em;
    font-weight: bold;
}

.payment-method-img {
    width: 38px;
    height: 38px;
    object-fit: contain;
}

.payment-method-name {
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 0.25rem;
}

.payment-method-desc {
    font-size: 0.75rem;
    color: #6b7280;
}

/* Estilos específicos para cuando están activos */
.payment-method-option.active .payment-method-name {
    color: #000000;
    font-weight: 600;
}

@media (max-width: 640px) {
    .payment-methods-container {
        grid-template-columns: 1fr;
    }
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