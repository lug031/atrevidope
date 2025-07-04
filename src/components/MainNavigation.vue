<template>
    <nav
        class="fixed top-0 left-0 right-0 w-full h-[72px] md:h-[74px] px-4 flex items-center bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-[1000] transition-colors duration-300">
        <div class="flex justify-between items-center max-w-[1200px] mx-auto w-full">
            <div class="flex items-center gap-4">
                <!-- Admin Menu Button -->
                <Transition name="fade">
                    <button v-if="!authStore.loading && isAdmin"
                        class="flex items-center justify-center bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded cursor-pointer text-gray-900 dark:text-gray-200 transition-colors duration-200"
                        @click="toggleAdminSidebar" aria-label="Menú de administración">
                        <MenuIcon class="stroke-current stroke-[1.5px]" :size="24" />
                    </button>
                </Transition>

                <Transition name="fade">
                    <button v-if="!authStore.loading"
                        class="flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-200 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 transition-colors duration-200 text-sm font-medium"
                        @click="toggleCategoriesSidebar" aria-label="Menú de categorías">
                        <span>Categorías</span>
                        <ChevronDownIcon :class="{ 'rotate-180': isCategoriesSidebarOpen }"
                            class="transition-transform duration-300" :size="16" />
                    </button>
                </Transition>

                <RouterLink to="/" class="block w-[150px] h-[40px] md:w-[150px] no-underline">
                    <Transition name="logo-fade" mode="out-in">
                        <img :key="currentLogo" :src="currentLogo" alt="Logo"
                            class="w-full h-full object-cover object-center scale-90 dark:invert dark:brightness-100" />
                    </Transition>
                </RouterLink>
            </div>

            <!-- Search button for mobile -->
            <button
                class="md:hidden flex items-center justify-center bg-transparent border-0 p-2 cursor-pointer text-gray-900 dark:text-gray-200 ml-auto mr-4"
                @click="toggleMobileSearch">
                <SearchIcon class="stroke-current stroke-[1.5px]" :size="24" />
            </button>

            <!-- Desktop search bar -->
            <div class="hidden md:flex w-full max-w-[600px] justify-self-end mr-8 items-center">
                <div class="relative w-full max-w-[600px]">
                    <input type="text" placeholder="¿Qué estás buscando?"
                        class="w-full h-[42px] py-2 pl-4 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none transition-all duration-300 focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)] dark:bg-gray-800 dark:text-gray-200 dark:focus:border-gray-500"
                        v-model="searchQuery" @focus="showResults = true" @input="handleSearch" />
                    <button
                        class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
                        @click="handleSearch">
                        <SearchIcon class="stroke-current stroke-[1.5px]" :size="20" />
                    </button>

                    <!-- Lista de resultados -->
                    <div v-if="showResults && searchQuery"
                        class="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-[1001]"
                        v-click-outside="hideResults">
                        <div v-if="loading" class="p-8 text-center">
                            <span
                                class="inline-block w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white animate-spin"></span>
                        </div>

                        <div v-else-if="filteredProducts.length === 0"
                            class="p-6 text-center text-gray-600 dark:text-gray-400">
                            No encontramos productos que coincidan con tu búsqueda
                        </div>

                        <div v-else class="p-2">
                            <RouterLink v-for="product in filteredProducts" :key="product.id"
                                :to="{ name: 'ProductDetail', params: { id: product.id } }"
                                class="flex items-center p-3 no-underline text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                                @click="hideResults">
                                <img :src="getProductImage(product)" :alt="product.name"
                                    class="w-[60px] h-[60px] object-cover rounded-lg mr-6" />
                                <div class="flex flex-col">
                                    <span class="font-semibold text-sm text-gray-900 dark:text-gray-100">{{
                                        product.brand }}</span>
                                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ product.name }}</span>
                                </div>
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>

            <Transition name="slide-down">
                <div v-if="isMobileSearchOpen"
                    class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 z-[1002] p-4 shadow-md">
                    <div class="flex items-center gap-2">
                        <input type="text" placeholder="¿Qué estás buscando?"
                            class="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            v-model="searchQuery" @input="handleSearch" />
                        <button class="bg-transparent border-0 p-2 text-gray-600 dark:text-gray-400 cursor-pointer"
                            @click="toggleMobileSearch">
                            <XIcon :size="24" />
                        </button>
                    </div>
                    <!-- Mobile search results -->
                    <div v-if="searchQuery"
                        class="fixed top-[70px] left-0 right-0 bottom-0 bg-white dark:bg-gray-900 overflow-y-auto p-4">
                        <div v-if="loading" class="p-8 text-center">
                            <span
                                class="inline-block w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white animate-spin"></span>
                        </div>
                        <div v-else-if="filteredProducts.length === 0"
                            class="p-6 text-center text-gray-600 dark:text-gray-400">
                            No encontramos productos que coincidan con tu búsqueda
                        </div>
                        <div v-else>
                            <RouterLink v-for="product in filteredProducts" :key="product.id"
                                :to="{ name: 'ProductDetail', params: { id: product.id } }"
                                class="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 no-underline text-gray-900 dark:text-gray-200"
                                @click="closeMobileSearch">
                                <img :src="getProductImage(product)" :alt="product.name"
                                    class="w-[50px] h-[50px] object-cover rounded-lg mr-6" />
                                <div class="flex flex-col">
                                    <span class="font-semibold text-sm text-gray-900 dark:text-gray-100">{{
                                        product.brand }}</span>
                                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ product.name }}</span>
                                </div>
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </Transition>

            <!-- Desktop navigation icons -->
            <div class="hidden md:flex items-center gap-2">
                <!-- User Menu -->
                <div class="relative">
                    <Transition name="fade">
                        <button v-if="!authStore.loading && !isAuthenticated"
                            class="bg-transparent border-0 cursor-pointer p-1.5 flex items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                            @click="showLoginModal = true">
                            <UserIcon class="stroke-current stroke-[1.5px] min-w-[24px]" :size="24" />
                        </button>

                        <div v-else-if="!authStore.loading && isAuthenticated" class="relative">
                            <button
                                class="bg-transparent border-0 cursor-pointer p-1.5 flex items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                                @click="isUserMenuOpen = !isUserMenuOpen">
                                <span class="hidden sm:block mr-2 text-[0.9rem] text-gray-700 dark:text-gray-300">¡Hola,
                                    {{ userName }}!</span>
                                <UserIcon class="stroke-current stroke-[1.5px] min-w-[24px]" :size="24" />
                            </button>

                            <div v-if="isUserMenuOpen"
                                class="absolute top-full right-1/2 translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[200px] mt-2 z-[1001] overflow-hidden">
                                <div
                                    class="p-3 border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-[0.875rem]">
                                    {{ userEmail }}
                                </div>
                                <RouterLink to="/profile"
                                    class="flex items-center gap-2 p-3 w-full text-left bg-transparent border-0 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer no-underline transition-colors duration-200">
                                    <UserIcon :size="16" />
                                    Perfil
                                </RouterLink>
                                <button @click="handleLogout"
                                    class="flex items-center gap-2 p-3 w-full text-left bg-transparent border-0 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                                    <LogOutIcon :size="16" />
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    </Transition>
                </div>

                <!-- Botón de tema -->
                <div class="relative">
                    <button
                        class="bg-transparent border-0 cursor-pointer p-1.5 flex items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                        @click="toggleTheme" aria-label="Cambiar tema">
                        <SunIcon v-if="isDarkMode" class="stroke-current stroke-[1.5px] min-w-[24px]" :size="24" />
                        <MoonIcon v-else class="stroke-current stroke-[1.5px] min-w-[24px]" :size="24" />
                    </button>
                </div>

                <!-- Carrito -->
                <Transition name="fade">
                    <div v-if="!authStore.loading" class="relative inline-block">
                        <button
                            class="bg-transparent border-0 cursor-pointer p-1.5 flex items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200 relative"
                            @click="isCartOpen = true">
                            <ShoppingBagIcon class="stroke-current stroke-[1.5px] min-w-[24px]" :size="24"
                                :class="{ 'animate-bounce': cartStore.showNotification }" />
                            <Transition name="bounce">
                                <span v-if="cartStore.itemCount > 0"
                                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] text-[0.75rem] font-bold flex items-center justify-center px-1.5"
                                    :class="{ 'animate-pulse': cartStore.showNotification }">
                                    {{ cartStore.itemCount }}
                                </span>
                            </Transition>
                        </button>
                    </div>
                </Transition>

                <!-- Pedidos -->
                <Transition name="fade">
                    <div v-if="!authStore.loading" class="relative inline-block">
                        <RouterLink to="/my-orders"
                            class="bg-transparent border-0 cursor-pointer p-1.5 flex items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                            :title="'Ver mis pedidos'">
                            <PackageIcon class="stroke-current stroke-[1.5px] min-w-[24px]" :size="24"
                                :class="{ 'text-amber-800 dark:text-amber-500': orderCount > 0 }" />
                        </RouterLink>
                    </div>
                </Transition>
            </div>

            <!-- Mobile menu toggle and dropdown -->
            <div class="md:hidden flex items-center">
                <!-- Mobile menu button -->
                <button
                    class="bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                    @click="isMobileMenuOpen = !isMobileMenuOpen">
                    <ChevronDownIcon :class="{ 'rotate-180': isMobileMenuOpen }"
                        class="stroke-current stroke-[1.5px] min-w-[22px] transition-transform duration-300"
                        :size="22" />
                </button>

                <!-- Primary visible elements on mobile (Cart only) -->
                <Transition name="fade">
                    <div v-if="!authStore.loading" class="relative inline-block">
                        <button
                            class="bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200 relative"
                            @click="isCartOpen = true">
                            <ShoppingBagIcon class="stroke-current stroke-[1.5px] min-w-[24px]" :size="24"
                                :class="{ 'animate-bounce': cartStore.showNotification }" />
                            <Transition name="bounce">
                                <span v-if="cartStore.itemCount > 0"
                                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] text-[0.75rem] font-bold flex items-center justify-center px-1.5"
                                    :class="{ 'animate-pulse': cartStore.showNotification }">
                                    {{ cartStore.itemCount }}
                                </span>
                            </Transition>
                        </button>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Mobile menu dropdown -->
        <Transition name="slide-down">
            <div v-if="isMobileMenuOpen"
                class="absolute left-0 right-0 top-[72px] md:top-[74px] bg-white dark:bg-gray-900 shadow-md border-t border-gray-100 dark:border-gray-800 py-2 z-[1001]">
                <div class="flex justify-center gap-6 px-4">
                    <!-- User Menu -->
                    <div class="relative">
                        <Transition name="fade">
                            <button v-if="!authStore.loading && !isAuthenticated"
                                class="bg-transparent border-0 cursor-pointer p-2 flex flex-col items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                                @click="showLoginModal = true; isMobileMenuOpen = false;">
                                <UserIcon class="stroke-current stroke-[1.5px]" :size="24" />
                                <span class="text-xs mt-1">Iniciar sesión</span>
                            </button>

                            <div v-else-if="!authStore.loading && isAuthenticated" class="relative">
                                <button
                                    class="bg-transparent border-0 cursor-pointer p-2 flex flex-col items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                                    @click="showMobileUserMenu = !showMobileUserMenu">
                                    <UserIcon class="stroke-current stroke-[1.5px]" :size="24" />
                                    <span class="text-xs mt-1">{{ userName }}</span>
                                </button>

                                <!-- Mobile user dropdown menu -->
                                <div v-if="showMobileUserMenu"
                                    class="absolute top-full left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[200px] mt-2 z-[1002] overflow-hidden">
                                    <div
                                        class="p-3 border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-[0.875rem] text-center">
                                        {{ userEmail }}
                                    </div>
                                    <RouterLink to="/profile"
                                        class="flex items-center gap-2 p-3 w-full text-left bg-transparent border-0 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer no-underline transition-colors duration-200"
                                        @click="showMobileUserMenu = false; isMobileMenuOpen = false;">
                                        <UserIcon :size="16" />
                                        Perfil
                                    </RouterLink>
                                    <button @click="handleLogout"
                                        class="flex items-center gap-2 p-3 w-full text-left bg-transparent border-0 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                                        <LogOutIcon :size="16" />
                                        Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        </Transition>
                    </div>

                    <!-- Tema -->
                    <div class="relative">
                        <button
                            class="bg-transparent border-0 cursor-pointer p-2 flex flex-col items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                            @click="toggleTheme" aria-label="Cambiar tema">
                            <SunIcon v-if="isDarkMode" class="stroke-current stroke-[1.5px]" :size="24" />
                            <MoonIcon v-else class="stroke-current stroke-[1.5px]" :size="24" />
                            <span class="text-xs mt-1">Tema</span>
                        </button>
                    </div>

                    <!-- Pedidos -->
                    <Transition name="fade">
                        <div v-if="!authStore.loading" class="relative">
                            <RouterLink to="/my-orders"
                                class="bg-transparent border-0 cursor-pointer p-2 flex flex-col items-center justify-center text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200 no-underline"
                                :title="'Ver mis pedidos'">
                                <PackageIcon class="stroke-current stroke-[1.5px]" :size="24"
                                    :class="{ 'text-amber-800 dark:text-amber-500': orderCount > 0 }" />
                                <span class="text-xs mt-1">Mis Pedidos</span>
                                <span v-if="orderCount > 0"
                                    class="absolute top-0 right-0 bg-amber-500 text-white rounded-full min-w-[18px] h-[18px] text-[0.65rem] font-bold flex items-center justify-center px-1">
                                    {{ orderCount }}
                                </span>
                            </RouterLink>
                        </div>
                    </Transition>
                </div>
            </div>
        </Transition>

        <!-- Loading indicator -->
        <div v-if="authStore.loading" class="absolute bottom-0 left-0 w-full h-[5px]">
            <div
                class="h-full bg-gradient-to-r from-transparent via-black dark:via-white to-transparent animate-[loading_1.5s_infinite]">
            </div>
        </div>
    </nav>

    <CartSidebar :is-open="isCartOpen" @close="isCartOpen = false" />

    <!-- Admin Sidebar -->
    <AdminSidebar v-if="isAdmin" :is-open="isAdminSidebarOpen" @close="isAdminSidebarOpen = false" />

    <!-- Categories Sidebar -->
    <MainSidebar :is-open="isCategoriesSidebarOpen" @close="isCategoriesSidebarOpen = false" />

    <!-- Login Modal -->
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import {
    UserIcon,
    SearchIcon,
    ShoppingBagIcon,
    LogOutIcon,
    MenuIcon,
    XIcon,
    PackageIcon,
    SunIcon,
    MoonIcon,
    ChevronDownIcon,
    FolderIcon,
    AlignJustifyIcon,
    MoreVerticalIcon,
    Grid3x3Icon,
    ListIcon,
    PlusIcon,
    ChevronDownCircleIcon,
    EyeIcon
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
import { useTheme } from '@/composables/useTheme'
import MainSidebar from './MainSidebar.vue'

const isCategoriesSidebarOpen = ref(false)
const { getUserOrders } = useOrders()
const hasOrders = ref(false)
const authStore = useAuthStore()
const cartStore = useCartStore()
const isCartOpen = ref(false)
const orderCount = ref(0)
const showMobileUserMenu = ref(false)

// Usar el composable de tema
const { isDarkMode, toggleTheme } = useTheme()

const { isAuthenticated, isAdmin, userEmail, userName } = storeToRefs(authStore)
const router = useRouter()
const route = useRoute()
const showLoginModal = ref(false)
const isUserMenuOpen = ref(false)
const isAdminSidebarOpen = ref(false)

// New mobile menu state
const isMobileMenuOpen = ref(false)

const searchQuery = ref('')
const showResults = ref(false)
const loading = ref(false)
const imageUrls = ref<Record<string, string>>({})
const { allProductsWeb, loadAllProductsWeb } = useProducts()
const filteredProducts = ref<any[]>([])
const isMobileSearchOpen = ref(false)

// Variables para gestión de logos y transiciones
const defaultLogo = '/new-logo.png'
const defaultLogoDark = '/new-logo.png' // Versión para modo oscuro
const altLogo = '/new-logo-atrevida.png'
const altLogoDark = '/new-logo-atrevida.png' // Versión para modo oscuro
const currentLogo = ref(defaultLogo)

const toggleCategoriesSidebar = () => {
    isCategoriesSidebarOpen.value = !isCategoriesSidebarOpen.value
    // Close mobile menu if open
    isMobileMenuOpen.value = false
}

// Función para manejar los cambios de logo
const handleLogoChange = () => {
    const isPerfumesMujer = route.query.name === 'Perfumes Mujer'
    const isPerfumesHombre = route.query.name === 'Perfumes Hombre'
    const isCurrentlyDark = isDarkMode.value

    // Si estamos en la sección de Perfumes Mujer
    if (isPerfumesMujer) {
        // Cambiar al logo alternativo según el tema
        currentLogo.value = isCurrentlyDark ? altLogoDark : altLogo
    }
    // Si estamos en la sección de Perfumes Hombre
    else if (isPerfumesHombre) {
        // Cambiar al logo original según el tema
        currentLogo.value = isCurrentlyDark ? defaultLogoDark : defaultLogo
    }
    // Para cualquier otra ruta, mantener el logo original según el tema
    else {
        currentLogo.value = isCurrentlyDark ? defaultLogoDark : defaultLogo
    }
}

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
    filteredProducts.value = allProductsWeb.value
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
        // Close mobile menu if open
        isMobileMenuOpen.value = false
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
    // Close mobile menu if open
    isMobileMenuOpen.value = false
}

const handleLogout = async () => {
    try {
        await authStore.logout()
        isUserMenuOpen.value = false
        isMobileMenuOpen.value = false
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

const closeMobileUserMenu = (event: MouseEvent) => {
    const mobileUserMenu = document.querySelector('.mobile-user-menu')
    if (mobileUserMenu && !mobileUserMenu.contains(event.target as Node)) {
        showMobileUserMenu.value = false
    }
}

// Close mobile menu when clicking outside or changing route
const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
    isCategoriesSidebarOpen.value = false
}

onUnmounted(() => {
    document.removeEventListener('click', closeUserMenu)
    window.removeEventListener('resize', handleWindowResize)
})

// Close mobile menu on window resize (if screen becomes large enough)
const handleWindowResize = () => {
    if (window.innerWidth >= 768) { // md breakpoint
        isMobileMenuOpen.value = false
    }
}

onMounted(async () => {
    document.addEventListener('click', closeUserMenu)
    document.addEventListener('click', closeMobileUserMenu)
    document.removeEventListener('click', closeMobileUserMenu)

    window.addEventListener('resize', handleWindowResize)

    await Promise.all([
        authStore.checkAuth(),
        cartStore.fetchCartItems(),
        loadAllProductsWeb(),
        checkUserOrders()
    ])

    // Verificar la ruta inicial
    handleLogoChange()
})

// Observar los cambios de ruta para actualizar el logo y cerrar el menú móvil
watch(
    () => route.fullPath,
    () => {
        handleLogoChange()
        closeMobileMenu()
        showMobileUserMenu.value = false
    }
)

// Observar los cambios en el tema para actualizar el logo
watch(isDarkMode, () => {
    handleLogoChange()
})

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
/* Estilos para animaciones que no se pueden hacer con Tailwind */
@keyframes loading {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Transición del logo */
.logo-fade-enter-active,
.logo-fade-leave-active {
    transition: opacity 0.5s, transform 0.5s;
}

.logo-fade-enter-from,
.logo-fade-leave-to {
    opacity: 0;
    transform: scale(0.8) rotate(-5deg);
}

.logo-fade-enter-to,
.logo-fade-leave-from {
    opacity: 1;
    transform: scale(0.9) rotate(0deg);
}

/* Animación de rebote */
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

/* Animación de deslizamiento */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}
</style>