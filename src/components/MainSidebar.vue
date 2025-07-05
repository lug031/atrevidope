<template>
    <Transition name="dropdown">
        <div v-if="isOpen" class="fixed inset-0 z-[2000]" @click="$emit('close')">
            <!-- Overlay 
            <div class="absolute inset-0 bg-black/20"></div>-->

            <!-- Dropdown Menu -->
            <div class="absolute top-[72px] md:top-[74px] left-0 right-0 w-full max-h-[calc(100vh-100px)] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden"
                @click.stop>

                <!-- Content -->
                <div class="max-h-[calc(100vh-140px)] overflow-hidden">
                    <!-- Loading State -->
                    <div v-if="loading" class="flex flex-col items-center justify-center h-48 p-6">
                        <div class="relative">
                            <div
                                class="w-12 h-12 border-4 border-other-200 dark:border-gray-600 rounded-full animate-spin border-t-other-600 dark:border-t-other-400">
                            </div>
                        </div>
                        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Cargando catálogo...</p>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="error" class="flex flex-col items-center justify-center h-48 p-6 text-center">
                        <div class="p-3 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                            <AlertCircleIcon :size="24" class="text-red-600 dark:text-red-400" />
                        </div>
                        <p class="text-sm text-red-600 dark:text-red-400">No pudimos cargar el catálogo</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Por favor, intenta de nuevo</p>
                    </div>

                    <!-- Categories and Brands Grid -->
                    <div v-else
                        class="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent max-h-[calc(100vh-180px)]">
                        <div class="p-6 space-y-6">
                            <!-- Quick Actions -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Revisa nuestras promociones
                                        </p>
                                    </div>
                                    <ChevronRightIcon :size="16"
                                        class="text-gray-400 group-hover:text-other-600 dark:group-hover:text-other-400 group-hover:translate-x-1 transition-all duration-200" />
                                </router-link>
                            </div>

                            <!-- Banner Promocional
                            <div
                                class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white relative overflow-hidden">
                                <div class="absolute inset-0 bg-black/10"></div>
                                <div class="relative z-10 flex flex-col md:flex-row items-center justify-between">
                                    <div class="flex-1 mb-4 md:mb-0">
                                        <h3 class="text-2xl md:text-3xl font-bold mb-2">
                                            <span class="text-blue-100 animate-pulse">¡OFERTAS!</span> hasta
                                            <span class="text-4xl animate-pulse">50%</span>
                                        </h3>
                                        <p class="text-blue-100 text-sm md:text-base">
                                            En productos seleccionados • Envío gratis desde S/.159
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                            <span class="text-sm font-medium">Código:</span>
                                            <span class="text-lg font-bold text-blue-100">JUANSAONA</span>
                                        </div>
                                        <ChevronRightIcon :size="20" class="text-white/70" />
                                    </div>
                                </div>
                            </div> -->

                            <!-- Categories Section -->
                            <div>
                                <h3
                                    class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">
                                    Por categoría
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

                            <!-- Brands Section -->
                            <div>
                                <h3
                                    class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">
                                    Por marca
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
    XIcon,
    ChevronRightIcon,
    AlertCircleIcon,
    TagIcon,
    StarIcon
} from 'lucide-vue-next'
import { useCategories } from '@/composables/useCategories'
import { useBrands } from '@/composables/useBrands'

defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const { categories, loading: categoriesLoading, error: categoriesError, loadCategories } = useCategories()
const { brands, loading: brandsLoading, error: brandsError, loadBrands } = useBrands()

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

const loading = computed(() => categoriesLoading.value || brandsLoading.value)
const error = computed(() => categoriesError.value || brandsError.value)

// Función para asignar colores a las categorías
const getCategoryColor = (index: number) => {
    const colors = [
        'bg-[#2563EB]',
        'bg-blue-800',
        'bg-blue-700',
        'bg-blue-600',
        'bg-indigo-800',
        'bg-indigo-700',
        'bg-indigo-600',
        'bg-sky-800',
        'bg-sky-700',
        'bg-cyan-800',
    ]
    return colors[index % colors.length]
}

// Función para colores de marcas
const getBrandColor = (index: number) => {
    const colors = [
        'bg-[#2563EB]',
        'bg-blue-800',
        'bg-blue-700',
        'bg-blue-600',
        'bg-indigo-800',
        'bg-indigo-700',
        'bg-indigo-600',
        'bg-sky-800',
        'bg-sky-700',
        'bg-cyan-800',
    ]
    return colors[index % colors.length]
}

const handleCategoryClick = () => {
    emit('close')
}

const handleOverlayClick = (event: MouseEvent) => {
    emit('close')
}

onMounted(async () => {
    const promises = []

    if (categories.value.length === 0) {
        promises.push(loadCategories())
    }

    if (brands.value.length === 0) {
        promises.push(loadBrands())
    }

    await Promise.all(promises)
})
</script>

<style scoped>
/* Transition animations */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
}

.dropdown-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
}

/* Custom scrollbar */
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
@media (max-width: 768px) {
    .dropdown-menu {
        margin: 1rem;
        max-width: calc(100vw - 2rem);
    }
}
</style>