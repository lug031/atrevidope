<!-- AdminSidebar.vue -->
<template>
    <Transition name="slide">
        <aside v-if="isOpen" class="admin-sidebar" @click.self="$emit('close')">
            <div class="sidebar-content">
                <div class="sidebar-header">
                </div>
                <nav class="sidebar-nav">
                    <router-link to="/admin/dashboard" class="nav-item" @click="$emit('close')">
                        <LayoutDashboardIcon :size="20" />
                        Dashboard
                    </router-link>
                    <router-link to="/admin/products" class="nav-item" @click="$emit('close')">
                        <PackageIcon :size="20" />
                        Productos
                    </router-link>
                    <router-link to="/admin/brands" class="nav-item" @click="$emit('close')">
                        <TagIcon :size="20" />
                        Marcas
                    </router-link>
                    <router-link to="/admin/categories" class="nav-item" @click="$emit('close')">
                        <ListIcon :size="20" />
                        Categorías
                    </router-link>
                    <router-link to="/admin/customers" class="nav-item" @click="$emit('close')">
                        <UsersIcon :size="20" />
                        Clientes
                    </router-link>
                    <router-link to="/admin/orders" class="nav-item" @click="$emit('close')">
                        <ShoppingCartIcon :size="20" />
                        Pedidos
                    </router-link>
                    <router-link to="/admin/reports" class="nav-item" @click="$emit('close')">
                        <BarChartIcon :size="20" />
                        Reportes
                    </router-link>
                    <router-link to="/admin/users" class="nav-item" @click="$emit('close')">
                        <ShieldIcon :size="20" />
                        Usuarios
                    </router-link>
                </nav>
            </div>
        </aside>
    </Transition>
</template>

<script setup lang="ts">
import { XIcon, LayoutDashboardIcon, PackageIcon, TagIcon, ListIcon, UsersIcon, ShoppingCartIcon, BarChartIcon, ShieldIcon } from 'lucide-vue-next'

defineProps<{
    isOpen: boolean
}>()

defineEmits<{
    (e: 'close'): void
}>()
</script>

<style scoped>
.admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(159, 159, 159, 0.367);
    z-index: 1000;
    display: flex;
}

.sidebar-content {
    width: 280px;
    background: #1a1a1a;
    color: white;
    height: 100%;
    padding: 1rem;
    position: relative;
}

.sidebar-header {
    padding: 1rem 0;
    border-bottom: 1px solid #333;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sidebar-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: white;
}

.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: #e0e0e0;
    text-decoration: none;
    border-radius: 6px;
    transition: 0.2s;
}

.nav-item:hover {
    background: #333;
}

.nav-item.router-link-active {
    background: #2563eb;
    color: white;
}

/* Transition animations */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease;
}

.slide-enter-from {
    transform: translateX(-100%);
}

.slide-leave-to {
    transform: translateX(-100%);
}
</style>