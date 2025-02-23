<template>
    <nav class="main-nav">
        <div class="nav-content">
            <div class="nav-left">
                <!-- Admin Menu Button -->
                <Transition name="fade">
                    <button v-if="!authStore.loading && isAdmin" class="icon-button menu-button"
                        @click="toggleAdminSidebar" aria-label="Menú de administración">
                        <MenuIcon class="menu-icon" :size="24" />
                    </button>
                </Transition>

                <RouterLink to="/" class="logo-link">
                    <img src="@/assets/new-logo.png" alt="Logo" class="logo" />
                </RouterLink>
            </div>

            <!-- Search button for mobile -->
            <button class="icon-button search-mobile-button" @click="toggleMobileSearch">
                <SearchIcon class="search-icon" :size="24" />
            </button>

            <!-- Desktop search bar -->
            <div class="nav-center desktop-search">
                <div class="search-bar">
                    <input type="text" placeholder="¿Qué estás buscando?" class="search-input" v-model="searchQuery"
                        @focus="showResults = true" @input="handleSearch" />
                    <button class="search-button" @click="handleSearch">
                        <SearchIcon class="search-icon" :size="20" />
                    </button>

                    <!-- Lista de resultados -->
                    <div v-if="showResults && searchQuery" class="search-results" v-click-outside="hideResults">
                        <div v-if="loading" class="search-loading">
                            <span class="loader"></span>
                        </div>

                        <div v-else-if="filteredProducts.length === 0" class="no-results">
                            No encontramos productos que coincidan con tu búsqueda
                        </div>

                        <div v-else class="results-list">
                            <RouterLink v-for="product in filteredProducts" :key="product.id"
                                :to="{ name: 'ProductDetail', params: { id: product.id } }" class="product-result"
                                @click="hideResults">
                                <img :src="getProductImage(product)" :alt="product.name" class="product-thumbnail" />
                                <div class="product-info">
                                    <span class="product-brand">{{ product.brand }}</span>
                                    <span class="product-name">{{ product.name }}</span>
                                </div>
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>

            <Transition name="slide-down">
                <div v-if="isMobileSearchOpen" class="mobile-search-overlay">
                    <div class="mobile-search-container">
                        <input type="text" placeholder="¿Qué estás buscando?" class="mobile-search-input"
                            v-model="searchQuery" @input="handleSearch" />
                        <button class="mobile-search-close" @click="toggleMobileSearch">
                            <XIcon :size="24" />
                        </button>
                    </div>
                    <!-- Mobile search results -->
                    <div v-if="searchQuery" class="mobile-search-results">
                        <div v-if="loading" class="search-loading">
                            <span class="loader"></span>
                        </div>
                        <div v-else-if="filteredProducts.length === 0" class="no-results">
                            No encontramos productos que coincidan con tu búsqueda
                        </div>
                        <div v-else class="results-list">
                            <RouterLink v-for="product in filteredProducts" :key="product.id"
                                :to="{ name: 'ProductDetail', params: { id: product.id } }" class="product-result"
                                @click="closeMobileSearch">
                                <img :src="getProductImage(product)" :alt="product.name" class="product-thumbnail" />
                                <div class="product-info">
                                    <span class="product-brand">{{ product.brand }}</span>
                                    <span class="product-name">{{ product.name }}</span>
                                </div>
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </Transition>

            <div class="nav-right">
                <!-- User Menu  -->
                <div class="user-menu-container">
                    <Transition name="fade">
                        <button v-if="!authStore.loading && !isAuthenticated" class="icon-button"
                            @click="showLoginModal = true">
                            <UserIcon class="user-icon" :size="24" />
                        </button>

                        <div v-else-if="!authStore.loading && isAuthenticated" class="user-menu">
                            <button class="icon-button user-greeting" @click="isUserMenuOpen = !isUserMenuOpen">
                                <span class="greeting-text">¡Hola, {{ userName }}!</span>
                                <UserIcon class="user-icon" :size="24" />
                            </button>

                            <div v-if="isUserMenuOpen" class="dropdown-menu">
                                <!-- <div class="user-email">{{ userEmail }}</div> -->
                                <RouterLink to="/profile" class="menu-item">
                                    <UserIcon :size="16" />
                                    Perfil
                                </RouterLink>
                                <button @click="handleLogout" class="menu-item">
                                    <LogOutIcon :size="16" />
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    </Transition>
                </div>

                <!-- Carrito - Visible para todos -->
                <Transition name="fade">
                    <div v-if="!authStore.loading" class="cart-container">
                        <!--<div v-if="!authStore.loading && !isAdmin" class="cart-container">-->
                        <button class="icon-button cart-button" @click="isCartOpen = true">
                            <ShoppingBagIcon class="cart-icon" :size="24"
                                :class="{ 'bounce': cartStore.showNotification }" />
                            <Transition name="bounce">
                                <span v-if="cartStore.itemCount > 0" class="cart-badge"
                                    :class="{ 'pulse': cartStore.showNotification }">
                                    {{ cartStore.itemCount }}
                                </span>
                            </Transition>
                        </button>
                    </div>
                </Transition>

                <!-- Pedidos - Visible según condiciones -->
                <Transition name="fade">
                    <div v-if="!authStore.loading" class="orders-container">
                        <RouterLink to="/my-orders" class="icon-button orders-button" :title="'Ver mis pedidos'">
                            <PackageIcon class="orders-icon" :size="24" :class="{ 'active-orders': orderCount > 0 }" />
                        </RouterLink>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="authStore.loading" class="auth-loading-indicator"></div>
    </nav>

    <CartSidebar :is-open="isCartOpen" @close="isCartOpen = false" />

    <!-- Admin Sidebar -->
    <AdminSidebar v-if="isAdmin" :is-open="isAdminSidebarOpen" @close="isAdminSidebarOpen = false" />

    <!-- Login Modal -->
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
    UserIcon,
    SearchIcon,
    ShoppingBagIcon,
    LogOutIcon,
    MenuIcon,
    XIcon,
    PackageIcon
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LoginModal from '@/components/LoginModal.vue'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useProducts } from '@/composables/useProducts'
import { getUrl } from 'aws-amplify/storage'
import debounce from 'lodash/debounce'
import CartSidebar from '@/components/CartSidebar.vue'
import { useOrders } from '@/composables/useOrders'

const { getUserOrders } = useOrders()
const hasOrders = ref(false)
const authStore = useAuthStore()
const cartStore = useCartStore()
const isCartOpen = ref(false)
const orderCount = ref(0)

const { isAuthenticated, isAdmin, userEmail, userName } = storeToRefs(authStore)
const router = useRouter()
const showLoginModal = ref(false)
const isUserMenuOpen = ref(false)
const isAdminSidebarOpen = ref(false)

const searchQuery = ref('')
const showResults = ref(false)
const loading = ref(false)
const imageUrls = ref<Record<string, string>>({})
const { products, loadProducts } = useProducts()
const filteredProducts = ref<any[]>([])
const isMobileSearchOpen = ref(false)

const currentUserEmail = computed(() => {
    if (isAuthenticated.value) {
        return userEmail.value
    }
    return localStorage.getItem('userEmail') || ''
})

const checkUserOrders = async () => {
    try {
        if (currentUserEmail.value) {
            const orders = await getUserOrders(currentUserEmail.value)
            orderCount.value = orders.length
        } else {
            orderCount.value = 0
        }
    } catch (error) {
        console.error('Error checking orders:', error)
        orderCount.value = 0
    }
}

const getProductImage = (product: any) => {
    return imageUrls.value[product.id] || '/api/placeholder/40/40'
}

const loadProductImages = async (productsToLoad: any[]) => {
    for (const product of productsToLoad) {
        if (product.imageUrl && !imageUrls.value[product.id]) {
            try {
                const { url } = await getUrl({ path: product.imageUrl })
                imageUrls.value[product.id] = url.toString()
            } catch (error) {
                console.error("Error cargando imagen:", error)
            }
        }
    }
}

const filterProducts = () => {
    if (!searchQuery.value.trim()) {
        filteredProducts.value = []
        return
    }

    const query = searchQuery.value.toLowerCase()
    filteredProducts.value = products.value
        .filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query)
        )
        .slice(0, 5)
}

const handleSearch = debounce(async () => {
    loading.value = true
    filterProducts()
    await loadProductImages(filteredProducts.value)
    loading.value = false
}, 300)

const vClickOutside = {
    mounted(el: any, binding: any) {
        el.clickOutsideEvent = (event: Event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value()
            }
        }
        document.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el: any) {
        document.removeEventListener('click', el.clickOutsideEvent)
    },
}

const hideResults = () => {
    showResults.value = false
}

const toggleMobileSearch = () => {
    isMobileSearchOpen.value = !isMobileSearchOpen.value
    if (isMobileSearchOpen.value) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
    }
}

const closeMobileSearch = () => {
    isMobileSearchOpen.value = false
    document.body.style.overflow = ''
    hideResults()
}


const toggleAdminSidebar = () => {
    isAdminSidebarOpen.value = !isAdminSidebarOpen.value
}

const handleLogout = async () => {
    try {
        await authStore.logout()
        isUserMenuOpen.value = false
        router.push('/')
    } catch (error) {
        console.error('Error during logout:', error)
    }
}

const closeUserMenu = (event: MouseEvent) => {
    const menu = document.querySelector('.user-menu')
    if (menu && !menu.contains(event.target as Node)) {
        isUserMenuOpen.value = false
    }
}

onUnmounted(() => {
    document.removeEventListener('click', closeUserMenu)
})

/*onMounted(async () => {
    document.addEventListener('click', closeUserMenu)
    await authStore.checkAuth()
})*/

onMounted(async () => {
    document.addEventListener('click', closeUserMenu)
    await Promise.all([
        authStore.checkAuth(),
        cartStore.fetchCartItems(),
        loadProducts(),
        checkUserOrders()
    ])
})

/*watch(isAuthenticated, (newValue) => {
    if (!newValue) {
        isUserMenuOpen.value = false
    }
})*/

watch(currentUserEmail, async (newEmail) => {
    if (!isAuthenticated.value && newEmail) {
        await checkUserOrders()
    }
})

watch(isAuthenticated, async (newValue) => {
    if (!newValue) {
        isUserMenuOpen.value = false
        await checkUserOrders()
    } else {
        await checkUserOrders() // Check orders when authenticated
    }
})
</script>

<style scoped>
.main-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 72px;
    /* Altura fija para calcular correctamente los offsets */
    padding: 1rem;
    background-color: white;
    border-bottom: 1px solid #eee;
    z-index: 1000;
}

body {
    padding-top: 80px;
    /* Ajusta este valor según la altura de tu nav */
}

@media (max-width: 768px) {
    .main-nav {
        height: 64px;
        padding: 0.75rem;
    }

    body {
        padding-top: 72px;
        /* Ajusta este valor para móvil según necesites */
    }
}

.orders-icon.active-orders {
    color: #996a1e;
}

.nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

.nav-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: #000;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.menu-button:hover {
    background-color: #f5f5f5;
}

.logo-link {
    display: block;
    width: 150px;
    height: 40px;
    text-decoration: none;
}

.logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transform: scale(0.9);
}

.search-bar {
    display: flex;
    width: 500px;
}

.search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
}

.search-button {
    padding: 8px 16px;
    background-color: #000;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.icon-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    transition: color 0.2s;
}

.icon-button:hover {
    color: #666;
}

.search-icon,
.user-icon,
.cart-icon,
.menu-icon {
    stroke-width: 1.5;
}

.user-menu-container {
    position: relative;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 50%;
    transform: translateX(50%);
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    margin-top: 0.5rem;
    z-index: 1001;
    overflow: hidden;
}

.user-email {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    color: #666;
    font-size: 0.875rem;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    color: #000;
    cursor: pointer;
    text-decoration: none;
    transition: background-color 0.2s;
}

.menu-item:hover {
    background-color: #f5f5f5;
}

.user-greeting {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.greeting-text {
    font-size: 0.9rem;
    color: #333;
}

@media (max-width: 768px) {
    .search-bar {
        width: 100%;
        max-width: 300px;
    }

    .greeting-text {
        display: none;
    }
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, #000, transparent);
    animation: loading 1.5s infinite;
    z-index: 1000;
}

@keyframes loading {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.auth-loading-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, transparent, #000, transparent);
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.cart-container {
    position: relative;
    display: inline-block;
}

.cart-button {
    position: relative;
}

.cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #ff4444;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 0.75rem;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.cart-icon.bounce {
    animation: cart-bounce 0.5s ease;
}

@keyframes cart-bounce {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }
}

.cart-badge.pulse {
    animation: badge-pulse 0.5s ease;
}

@keyframes badge-pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.3);
        background-color: #ff6b6b;
    }

    100% {
        transform: scale(1);
    }
}

.bounce-enter-active {
    animation: bounce-in 0.5s;
}

.bounce-leave-active {
    animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

.nav-center {
    justify-self: end;
    /* Mueve la barra hacia la derecha */
    width: 100%;
    max-width: 600px;
    /* Ajustado el ancho máximo */
    margin-right: 2rem;
    /* Espacio a la derecha */
}

.search-bar {
    position: relative;
    width: 100%;
    max-width: 600px;
}

.search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.3s ease;
}

.search-input:focus {
    border-color: #000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.search-button {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: #4a5568;
    transition: color 0.3s ease;
}

.search-button:hover {
    color: #000;
}

.search-results {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1001;
}

.search-loading {
    padding: 2rem;
    text-align: center;
}

.no-results {
    padding: 1.5rem;
    text-align: center;
    color: #666;
}

.results-list {
    padding: 0.5rem;
}

.product-result {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    text-decoration: none;
    color: inherit;
    transition: background-color 0.3s ease;
    border-radius: 6px;
}

.product-result:hover {
    background-color: #f7f7f7;
}

.product-thumbnail {
    width: 60px;
    /* Aumentado el tamaño */
    height: 60px;
    /* Aumentado el tamaño */
    object-fit: cover;
    border-radius: 8px;
    margin-right: 1.5rem;
}

.product-info {
    display: flex;
    flex-direction: column;
}

.product-brand {
    font-weight: 600;
    font-size: 0.875rem;
    color: #1a202c;
}

.product-name {
    font-size: 0.875rem;
    color: #4a5568;
}

.loader {
    width: 24px;
    height: 24px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #000;
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

@media (max-width: 768px) {
    .search-results {
        position: fixed;
        top: 60px;
        left: 1rem;
        right: 1rem;
        max-height: calc(100vh - 80px);
    }
}

.search-mobile-button {
    display: none;
}

.mobile-search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: white;
    z-index: 1002;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-search-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.mobile-search-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    outline: none;
}

.mobile-search-close {
    background: none;
    border: none;
    padding: 0.5rem;
    color: #666;
    cursor: pointer;
}

.mobile-search-results {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    overflow-y: auto;
    padding: 1rem;
}

/* Animation classes */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

@media (max-width: 768px) {
    .desktop-search {
        display: none;
    }

    .search-mobile-button {
        display: block;
        margin-left: auto;
        margin-right: 1rem;
    }

    .nav-content {
        padding: 0 1rem;
    }

    .mobile-search-results .product-result {
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }

    .mobile-search-results .product-thumbnail {
        width: 50px;
        height: 50px;
    }
}

@media (max-width: 768px) {
    .nav-content {
        padding: 0 0.5rem;
        /* Reducido el padding horizontal */
    }

    .icon-button {
        padding: 6px;
        /* Reducido de 8px a 6px */
    }

    .logo-link {
        width: 120px;
        /* Reducido de 150px */
    }

    /* Ajustar el contenedor de órdenes para móvil */
    .orders-container {
        margin-right: 0.25rem;
        /* Añadir un pequeño margen a la derecha */
    }

    /* Ajustar el espacio entre los iconos */
    .nav-right {
        gap: 0.5rem;
        /* Reducido aún más el espacio entre elementos */
    }

    /* Asegurar que los iconos no se deformen */
    .orders-icon,
    .cart-icon,
    .user-icon {
        min-width: 24px;
    }
}
</style>