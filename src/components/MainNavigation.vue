<template>
    <nav class="main-nav">
        <div class="nav-content">
            <div class="nav-left">
                <!-- Admin Menu Button - Solo esperamos por el estado de admin -->
                <Transition name="fade">
                    <button v-if="!authStore.loading && isAdmin" class="icon-button menu-button"
                        @click="toggleAdminSidebar" aria-label="Menú de administración">
                        <MenuIcon class="menu-icon" :size="24" />
                    </button>
                </Transition>

                <RouterLink to="/" class="logo-link">
                    <img src="@/assets/atrevido_logo.png" alt="Logo" class="logo" />
                </RouterLink>
            </div>

            <div class="nav-center">
                <div class="search-bar">
                    <input type="text" placeholder="¿Qué estás buscando?" class="search-input" />
                    <button class="search-button">
                        <SearchIcon class="search-icon" :size="20" />
                    </button>
                </div>
            </div>

            <div class="nav-right">
                <!-- User Menu - Controlamos la visibilidad de las opciones sin ocultar el contenedor -->
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
                                <div class="user-email">{{ userEmail }}</div>
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

                <!-- Carrito - Solo visible para no admins -->
                <Transition name="fade">
                    <div v-if="!authStore.loading && !isAdmin" class="cart-container">
                        <button class="icon-button cart-button">
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
            </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="authStore.loading" class="auth-loading-indicator"></div>
    </nav>

    <!-- Admin Sidebar -->
    <AdminSidebar v-if="isAdmin" :is-open="isAdminSidebarOpen" @close="isAdminSidebarOpen = false" />

    <!-- Login Modal -->
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
    UserIcon,
    SearchIcon,
    ShoppingBagIcon,
    LogOutIcon,
    MenuIcon
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LoginModal from '@/components/LoginModal.vue'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { isAuthenticated, isAdmin, userEmail, userName } = storeToRefs(authStore)
const router = useRouter()
const showLoginModal = ref(false)
const isUserMenuOpen = ref(false)
const isAdminSidebarOpen = ref(false)

import { useCartStore } from '@/stores/cart'
const cartStore = useCartStore()

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

onMounted(async () => {
    document.addEventListener('click', closeUserMenu)
    await authStore.checkAuth()
})

onUnmounted(() => {
    document.removeEventListener('click', closeUserMenu)
})

watch(isAuthenticated, (newValue) => {
    if (!newValue) {
        isUserMenuOpen.value = false
    }
})
</script>

<style scoped>
.main-nav {
    padding: 1rem 2rem;
    border-bottom: 1px solid #eee;
    background-color: white;
    position: sticky;
    top: 0;
    z-index: 100;
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
    transform: scale(1);
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
    gap: 1.5rem;
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
    z-index: 1000;
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
</style>