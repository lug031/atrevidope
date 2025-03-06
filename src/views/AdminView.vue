<template>
    <AdminLayout>
        <div class="admin-container">
            <div class="admin-header">
                <h1 class="page-title">
                    {{ pageTitle }}
                </h1>
                <Breadcrumbs :items="breadcrumbs" />
            </div>
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'

const route = useRoute()

const routeTitles: Record<string, string> = {
    'admin-dashboard': 'Dashboard',
    'admin-products': 'Gestión de Productos',
    'admin-brands': 'Gestión de Marcas',
    'admin-categories': 'Gestión de Categorías',
    'admin-customers': 'Gestión de Clientes',
    'admin-orders': 'Gestión de Pedidos',
    'admin-reports': 'Reportes',
    'admin-users': 'Gestión de Usuarios'
}

const pageTitle = computed(() => {
    return routeTitles[route.name as string] || 'Panel de Administración'
})

const breadcrumbs = computed(() => {
    const items = [
        {
            text: 'Admin',
            to: '/admin/dashboard'
        }
    ]

    if (route.name && route.name !== 'admin-dashboard') {
        items.push({
            text: routeTitles[route.name as string],
            to: route.path
        })
    }

    return items
})
</script>

<style scoped>
.admin-container {
    min-height: calc(100vh - 160px);
}

.admin-header {
    margin-bottom: 2rem;
}

.page-title {
    font-size: 1.875rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>