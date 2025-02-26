<template>
    <Transition name="slide">
        <aside v-if="isOpen" class="admin-sidebar" @click.self="$emit('close')">
            <div class="sidebar-content">
                <div class="sidebar-header">
                </div>
                <nav class="sidebar-nav">
                    <router-link v-for="item in navigationItems" :key="item.path" :to="item.disabled ? '' : item.path"
                        class="nav-item" :class="{ 'disabled': item.disabled }" @click="handleItemClick(item)">
                        <component :is="item.icon" :size="20" />
                        {{ item.label }}
                        <span v-if="item.disabled" class="disabled-badge">Próximamente</span>
                    </router-link>
                </nav>
            </div>
        </aside>
    </Transition>
</template>

<script setup lang="ts">
import {
    XIcon,
    LayoutDashboardIcon,
    PackageIcon,
    TagIcon,
    ListIcon,
    UsersIcon,
    ShoppingCartIcon,
    BarChartIcon,
    ShieldIcon
} from 'lucide-vue-next'

interface NavigationItem {
    path: string;
    icon: any;
    label: string;
    disabled?: boolean;
}

const navigationItems: NavigationItem[] = [
    {
        path: '/admin/dashboard',
        icon: LayoutDashboardIcon,
        label: 'Dashboard'
    },
    {
        path: '/admin/products',
        icon: PackageIcon,
        label: 'Productos'
    },
    {
        path: '/admin/orders',
        icon: ShoppingCartIcon,
        label: 'Pedidos'
    },
    {
        path: '/admin/categories',
        icon: ListIcon,
        label: 'Categorías'
    },
    {
        path: '/admin/customers',
        icon: UsersIcon,
        label: 'Clientes',
        disabled: true
    },
    {
        path: '/admin/reports',
        icon: BarChartIcon,
        label: 'Reportes',
        disabled: true
    },
    {
        path: '/admin/users',
        icon: ShieldIcon,
        label: 'Usuarios',
        disabled: true
    },
    {
        path: '/admin/brands',
        icon: TagIcon,
        label: 'Marcas',
        disabled: false
    }
]

defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) {
        return
    }
    emit('close')
}
</script>

<style scoped>
.admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(159, 159, 159, 0.367);
    z-index: 2000;
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
    position: relative;
}

.nav-item:not(.disabled):hover {
    background: #333;
}

.nav-item.router-link-active:not(.disabled) {
    background: #2563eb;
    color: white;
}

/* Estilos para ítems deshabilitados */
.nav-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    color: #666;
}

.disabled-badge {
    position: absolute;
    right: 1rem;
    font-size: 0.75rem;
    background: #333;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    color: #999;
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