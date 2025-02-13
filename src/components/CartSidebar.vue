<template>
    <Transition name="slide">
        <div v-if="isOpen" class="cart-sidebar-overlay">
            <div class="overlay-background" @click="$emit('close')"></div>

            <div class="cart-sidebar-panel">
                <div class="cart-header">
                    <h2 class="cart-title">Mi Carrito</h2>
                    <button class="close-button" @click="$emit('close')">
                        <XIcon :size="24" />
                    </button>
                </div>

                <div v-if="cartInitializing" class="loading-state">
                    <span class="loader"></span>
                </div>

                <div v-else-if="hasItems" class="cart-content">
                    <div class="cart-items">
                        <div v-if="cartOperationLoading" class="cart-loading-overlay">
                            <span class="loader"></span>
                        </div>
                        <div v-for="item in items" :key="item.id" class="cart-item">
                            <img :src="imageUrls[item.productID] || '/api/placeholder/80/80'"
                                :alt="productDetails[item.productID]?.name" class="item-image" />

                            <div class="item-details">
                                <div class="item-info">
                                    <span class="item-brand">{{ productDetails[item.productID]?.brand }}</span>
                                    <h3 class="item-name">{{ productDetails[item.productID]?.name }}</h3>
                                    <div class="price-container">
                                        <span v-if="item.isPromoted" class="original-price">
                                            S/. {{ item.originalPrice.toFixed(2) }}
                                        </span>
                                        <span class="item-price" :class="{ promotional: item.isPromoted }">
                                            S/. {{ item.price.toFixed(2) }}
                                        </span>
                                        <span v-if="item.isPromoted" class="discount-badge">
                                            -{{ item.discountPercentage }}%
                                        </span>
                                    </div>
                                </div>

                                <div class="item-actions">
                                    <div class="quantity-controls">
                                        <button @click="handleDecreaseQuantity(item)" class="quantity-button"
                                            :disabled="item.quantity <= 1 || cartOperationLoading">
                                            <MinusIcon :size="16" />
                                        </button>
                                        <span class="quantity">{{ item.quantity }}</span>
                                        <button @click="handleIncreaseQuantity(item)" class="quantity-button"
                                            :disabled="!canIncrease(item) || cartOperationLoading">
                                            <PlusIcon :size="16" />
                                        </button>
                                    </div>
                                    <button @click="handleRemoveItem(item.id)" class="remove-button"
                                        :disabled="cartOperationLoading">
                                        <TrashIcon :size="16" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="cart-summary">
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

                        <button @click="handleCheckout" class="checkout-button" :disabled="checkoutLoading">
                            {{ checkoutLoading ? 'Procesando...' : 'Proceder al pago' }}
                        </button>
                    </div>
                </div>

                <div v-else class="empty-cart">
                    <ShoppingBagIcon :size="64" class="empty-cart-icon" />
                    <p>Tu carrito está vacío</p>
                    <button @click="$emit('close')" class="continue-shopping">
                        Continuar comprando
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
    XIcon,
    MinusIcon,
    PlusIcon,
    TrashIcon,
    ShoppingBagIcon
} from 'lucide-vue-next';
import { useCart } from '@/composables/useCart';
import { useRouter } from 'vue-router';
import { getUrl } from 'aws-amplify/storage';
import type { CartItem } from '@/types/cart.types';
import type { Product } from '@/types/product.types';
import { useProductStore } from '@/stores/product';
import { storeToRefs } from 'pinia';
import { useToast } from '@/composables/useToast';
const { showToast } = useToast();

const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const router = useRouter();
const imageUrls = ref<Record<string, string>>({});
const productDetails = ref<Record<string, Product>>({});
const cartInitializing = ref(true);
const cartOperationLoading = ref(false);
const checkoutLoading = ref(false);

const {
    items,
    loading: cartLoading,
    error: cartError,
    subtotal,
    total,
    shippingCost,
    hasItems,
    loadCartItems,
    updateQuantity,
    removeFromCart,
    canIncreaseQuantity
} = useCart();

const productStore = useProductStore();
const { products } = storeToRefs(productStore);

const initializeCart = async () => {
    cartInitializing.value = true;
    try {
        if (!items.value.length) {
            await loadCartItems();
        }
        updateProductDetails();
        await loadImageUrls();
    } catch (error) {
        console.error('Error initializing cart:', error);
    } finally {
        cartInitializing.value = false;
    }
};

const updateProductDetails = () => {
    const productsMap: Record<string, Product> = {};
    products.value.forEach(product => {
        productsMap[product.id] = product;
    });
    productDetails.value = productsMap;
};

const loadImageUrls = async () => {
    for (const item of items.value) {
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

const canIncrease = (item: CartItem): boolean => {
    const product = productDetails.value[item.productID];
    if (!product) return false;
    return product.stock > item.quantity;
};

const handleIncreaseQuantity = async (item: CartItem) => {
    if (canIncrease(item)) {
        cartOperationLoading.value = true;
        try {
            await updateQuantity(item.id, item.quantity + 1);
        } catch (err) {
            console.error('Error al aumentar cantidad:', err);
        } finally {
            cartOperationLoading.value = false;
        }
    }
};

const handleDecreaseQuantity = async (item: CartItem) => {
    if (item.quantity > 1) {
        cartOperationLoading.value = true;
        try {
            await updateQuantity(item.id, item.quantity - 1);
        } catch (err) {
            console.error('Error al disminuir cantidad:', err);
        } finally {
            cartOperationLoading.value = false;
        }
    }
};

const handleRemoveItem = async (itemId: string) => {
    cartOperationLoading.value = true;
    try {
        await removeFromCart(itemId);
    } catch (err) {
        console.error('Error al eliminar item:', err);
    } finally {
        cartOperationLoading.value = false;
    }
};

/**
 * Valida el stock de cada item del carrito.
 * Si la cantidad solicitada supera el stock actual:
 *  - Si hay stock (pero menor), se actualiza la cantidad al stock disponible.
 *  - Si no hay stock, se elimina el item.
 * Devuelve `true` si todos los items están dentro del stock, o `false` si se realizó alguna actualización.
 */
const validateAndUpdateStock = async (): Promise<boolean> => {
    let valid = true;
    for (const item of items.value) {
        const product = productDetails.value[item.productID];
        if (product) {
            if (item.quantity > product.stock) {
                valid = false;
                if (product.stock > 0) {
                    // Actualizamos la cantidad al máximo disponible
                    await updateQuantity(item.id, product.stock);
                } else {
                    // Si no hay stock, eliminamos el item del carrito
                    await removeFromCart(item.id);
                }
            }
        }
    }
    return valid;
};

const handleCheckout = async () => {
    // Usamos ambos flags para que el botón de checkout y el spinner sean consistentes
    checkoutLoading.value = true;
    cartOperationLoading.value = true;
    try {
        const stockValid = await validateAndUpdateStock();
        if (!stockValid) {
            showToast({
                type: 'warning',
                message:
                    'Algunos productos han sido actualizados por cambios en stock. Por favor, revisa tu carrito.'
            });
            return;
        }
        await router.push('/checkout');
        emit('close');
    } catch (err) {
        console.error('Error al proceder al pago:', err);
    } finally {
        cartOperationLoading.value = false;
        checkoutLoading.value = false;
    }
};

watch(
    () => props.isOpen,
    (newValue) => {
        if (newValue) {
            initializeCart();
        }
    }
);

watch(
    () => products.value,
    () => {
        updateProductDetails();
    }
);

watch(
    () => items.value,
    () => {
        if (!cartInitializing.value) {
            loadImageUrls();
        }
    }
);

onMounted(() => {
    if (props.isOpen) {
        initializeCart();
    }
});
</script>

<style scoped>
.cart-items {
    position: relative;
}

.cart-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

.loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
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

.price-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

.cart-sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 200;
    display: flex;
    justify-content: flex-end;
}

.quantity-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.checkout-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: #666;
}

.overlay-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(159, 159, 159, 0.367);
}

.cart-sidebar-panel {
    position: relative;
    width: 100%;
    max-width: 480px;
    background-color: white;
    display: flex;
    flex-direction: column;
    z-index: 201;
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.cart-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
}

.close-button {
    background: none;
    border: none;
    color: #4a5568;
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.2s;
}

.close-button:hover {
    color: #1a202c;
}

.cart-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.cart-items {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.cart-item {
    display: flex;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    gap: 1rem;
}

.item-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
}

.item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.item-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.item-brand {
    font-size: 0.875rem;
    color: #4a5568;
}

.item-name {
    font-size: 1rem;
    font-weight: 500;
    color: #1a202c;
}

.item-price {
    font-weight: 600;
    color: #1a202c;
}

.item-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.25rem;
}

.quantity-button {
    background: none;
    border: none;
    color: #4a5568;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s;
}

.quantity-button:hover {
    color: #1a202c;
}

.quantity {
    min-width: 1.5rem;
    text-align: center;
    font-weight: 500;
}

.remove-button {
    background: none;
    border: none;
    color: #e53e3e;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s;
}

.remove-button:hover {
    color: #c53030;
}

.cart-summary {
    background-color: #f7fafc;
    padding: 1.5rem;
    border-top: 1px solid #e2e8f0;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    color: #4a5568;
}

.summary-row.total {
    font-weight: 600;
    color: #1a202c;
    font-size: 1.125rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.checkout-button {
    width: 100%;
    background-color: #000;
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 1rem;
}

.checkout-button:hover {
    background-color: #1a202c;
}

.empty-cart {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    color: #4a5568;
}

.empty-cart-icon {
    color: #a0aec0;
    margin-bottom: 1rem;
}

.continue-shopping {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #000;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.continue-shopping:hover {
    background-color: #1a202c;
}

/* Animaciones */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease-out;
}

.slide-enter-from {
    transform: translateX(100%);
}

.slide-leave-to {
    transform: translateX(100%);
}

.slide-enter-from .overlay-background,
.slide-leave-to .overlay-background {
    opacity: 0;
}

@media (max-width: 640px) {
    .cart-sidebar-panel {
        max-width: 100%;
    }
}
</style>