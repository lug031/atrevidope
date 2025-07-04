<template>
    <Transition name="slide">
        <aside v-if="isOpen" class="fixed inset-0 z-[2000] flex" @click="$emit('close')">
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/10"></div>

            <!-- Sidebar -->
            <div class="relative w-80 h-full bg-white dark:bg-gray-900 shadow-2xl">
                <!-- Header -->
                <div
                    class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-other-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <div class="flex items-center gap-3">
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Categorías</h2>
                    </div>
                    <button @click="$emit('close')"
                        class="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <XIcon :size="20" />
                    </button>
                </div>

                <!-- Content -->
                <div class="h-[calc(100%-88px)] overflow-hidden">
                    <!-- Loading State -->
                    <div v-if="loading" class="flex flex-col items-center justify-center h-full p-6">
                        <div class="relative">
                            <div
                                class="w-12 h-12 border-4 border-other-200 dark:border-gray-600 rounded-full animate-spin border-t-other-600 dark:border-t-other-400">
                            </div>
                        </div>
                        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Cargando catálogo...</p>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div class="p-3 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                            <AlertCircleIcon :size="24" class="text-red-600 dark:text-red-400" />
                        </div>
                        <p class="text-sm text-red-600 dark:text-red-400">No pudimos cargar el catálogo</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Por favor, intenta de nuevo</p>
                    </div>

                    <!-- Categories and Brands List -->
                    <div v-else
                        class="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        <div class="p-4 space-y-2">
                            <!-- All Products Option -->
                            <router-link to="/web-products"
                                class="group flex items-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-other-300 dark:hover:border-other-500 hover:bg-other-50 dark:hover:bg-other-900/20 transition-all duration-200"
                                @click="handleCategoryClick">
                                <div class="flex-1">
                                    <span
                                        class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-other-700 dark:group-hover:text-other-300">
                                        Todos los productos
                                    </span>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Ver catálogo completo</p>
                                </div>
                                <ChevronRightIcon :size="16"
                                    class="text-gray-400 group-hover:text-other-600 dark:group-hover:text-other-400 group-hover:translate-x-1 transition-all duration-200" />
                            </router-link>

                            <router-link to="/promotions"
                                class="group flex items-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-other-300 dark:hover:border-other-500 hover:bg-other-50 dark:hover:bg-other-900/20 transition-all duration-200"
                                @click="handleCategoryClick">
                                <div class="flex-1">
                                    <span
                                        class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-other-700 dark:group-hover:text-other-300">
                                        Promociones
                                    </span>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Revisa nuestras promociones</p>
                                </div>
                                <ChevronRightIcon :size="16"
                                    class="text-gray-400 group-hover:text-other-600 dark:group-hover:text-other-400 group-hover:translate-x-1 transition-all duration-200" />
                            </router-link>

                            <!-- Categories -->
                            <div class="pt-2">
                                <h3
                                    class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    Por categoría
                                </h3>
                                <div class="space-y-1">
                                    <router-link v-for="(category, index) in activeCategories" :key="category.id" :to="{
                                        name: 'CategoryProducts',
                                        params: { categoryId: category.id },
                                        query: { name: category.name }
                                    }" class="group flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                        @click="handleCategoryClick">
                                        <div class="flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200"
                                            :class="getCategoryColor(index)">
                                            <TagIcon :size="14" class="text-white" />
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <span
                                                class="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white truncate block">
                                                {{ category.name }}
                                            </span>
                                        </div>
                                        <ChevronRightIcon :size="14"
                                            class="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                                    </router-link>
                                </div>
                            </div>

                            <!-- ← NUEVA SECCIÓN: MARCAS -->
                            <div class="pt-4">
                                <h3
                                    class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    Por marca
                                </h3>
                                <div class="space-y-1">
                                    <router-link v-for="(brand, index) in activeBrands" :key="brand.id" :to="{
                                        name: 'BrandProducts',
                                        params: { brandId: brand.id },
                                        query: { name: brand.name }
                                    }" class="group flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                        @click="handleCategoryClick">
                                        <div class="flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200"
                                            :class="getBrandColor(index)">
                                            <StarIcon :size="14" class="text-white" />
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <span
                                                class="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white truncate block">
                                                {{ brand.name }}
                                            </span>
                                        </div>
                                        <ChevronRightIcon :size="14"
                                            class="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                                    </router-link>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="p-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                            <div class="text-center space-y-1">
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ activeCategories.length }} categorías • {{ activeBrands.length }} marcas
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
    XIcon,
    FolderIcon,
    ChevronRightIcon,
    GridIcon,
    AlertCircleIcon,
    TagIcon,
    StarIcon // ← AGREGAR ESTE ICONO PARA MARCAS
} from 'lucide-vue-next'
import { useCategories } from '@/composables/useCategories'
import { useBrands } from '@/composables/useBrands' // ← AGREGAR ESTA IMPORTACIÓN

defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const { categories, loading: categoriesLoading, error: categoriesError, loadCategories } = useCategories()
const { brands, loading: brandsLoading, error: brandsError, loadBrands } = useBrands() // ← AGREGAR ESTO

// ← AGREGAR COMPUTED PARA MARCAS ACTIVAS
const activeBrands = computed(() => {
    return brands.value
        .filter(brand => brand.active)
        .sort((a, b) => a.name.localeCompare(b.name))
})

const activeCategories = computed(() => {
    return categories.value
        .filter(category => category.active)
        .sort((a, b) => a.name.localeCompare(b.name))
})

// ← ACTUALIZAR COMPUTED PARA ESTADOS DE LOADING Y ERROR
const loading = computed(() => categoriesLoading.value || brandsLoading.value)
const error = computed(() => categoriesError.value || brandsError.value)

// Función para asignar colores a las categorías
const getCategoryColor = (index: number) => {
    const colors = [
        'bg-[#2563EB]',    // Azul base (igual a tu referencia)
        'bg-blue-800',     // Azul oscuro
        'bg-blue-700',     // Azul medio-oscuro
        'bg-blue-600',     // Azul medio
        'bg-indigo-800',   // Índigo oscuro
        'bg-indigo-700',   // Índigo medio-oscuro
        'bg-indigo-600',   // Índigo medio
        'bg-sky-800',      // Azul cielo oscuro
        'bg-sky-700',      // Azul cielo medio-oscuro
        'bg-cyan-800',     // Cian oscuro
    ]
    return colors[index % colors.length]
}

// Función para colores de marcas (misma paleta)
const getBrandColor = (index: number) => {
    const colors = [
        'bg-[#2563EB]',    // Azul base (igual a tu referencia)
        'bg-blue-800',     // Azul oscuro
        'bg-blue-700',     // Azul medio-oscuro
        'bg-blue-600',     // Azul medio
        'bg-indigo-800',   // Índigo oscuro
        'bg-indigo-700',   // Índigo medio-oscuro
        'bg-indigo-600',   // Índigo medio
        'bg-sky-800',      // Azul cielo oscuro
        'bg-sky-700',      // Azul cielo medio-oscuro
        'bg-cyan-800',     // Cian oscuro
    ]
    return colors[index % colors.length]
}

const handleCategoryClick = () => {
    emit('close')
}

onMounted(async () => {
    const promises = []

    if (categories.value.length === 0) {
        promises.push(loadCategories())
    }

    if (brands.value.length === 0) {
        promises.push(loadBrands()) // ← AGREGAR CARGA DE MARCAS
    }

    await Promise.all(promises)
})
</script>

<style scoped>
/* Transition animations */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
    transform: translateX(-100%);
}

.slide-leave-to {
    transform: translateX(-100%);
}

/* Custom scrollbar para navegadores webkit */
.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
    background: transparent;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
    background-color: rgb(209 213 219);
    border-radius: 3px;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb:hover {
    background-color: rgb(156 163 175);
}

.dark .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
    background-color: rgb(75 85 99);
}

.dark .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb:hover {
    background-color: rgb(107 114 128);
}

/* Responsive adjustments */
@media (max-width: 480px) {
    .sidebar-content {
        width: 280px;
    }
}
</style>