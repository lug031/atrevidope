<!-- components/admin/StoryPreviewModal.vue -->
<template>
    <!-- Modal Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[1200] p-4"
        @click="$emit('close')">
        <div class="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Vista Previa - {{ story.title }}</h3>
                <button @click="$emit('close')"
                    class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all">
                    <XIcon :size="20" />
                </button>
            </div>

            <!-- Body -->
            <div class="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 p-4 md:p-6 overflow-y-auto">
                <!-- Story Preview Container -->
                <div class="relative bg-gray-800 rounded-xl overflow-hidden h-[400px] md:h-[500px] flex flex-col">
                    <!-- Skeleton Loading -->
                    <div v-if="loadingAssets"
                        class="absolute inset-0 flex items-center justify-center bg-gray-800 z-30">
                        <div class="flex flex-col items-center gap-4">
                            <!-- Skeleton del preview de imagen -->
                            <div class="w-48 h-64 bg-gray-700 rounded-lg animate-pulse"></div>
                            <!-- Skeleton del texto -->
                            <div class="space-y-2">
                                <div class="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
                                <div class="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Contenido existente (agregar v-show) -->
                    <div v-show="!loadingAssets" class="h-full flex flex-col">
                        <!-- Progress bar -->
                        <div class="absolute top-2 left-2 right-2 z-20">
                            <div class="w-full h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                                <div class="h-full bg-white transition-all duration-100 ease-linear"
                                    :style="{ width: `${progressPercentage}%` }"></div>
                            </div>
                        </div>

                        <!-- Story Header -->
                        <div class="relative z-20 flex justify-between items-center p-4">
                            <div class="flex items-center gap-3">
                                <img :src="storyImageUrl" :alt="story.title"
                                    class="w-8 h-8 rounded-full object-cover" />
                                <span class="text-white font-medium text-sm">{{ story.title }}</span>
                            </div>
                            <div class="flex gap-2">
                                <button v-if="story.audioUrl" @click="toggleAudio"
                                    class="w-9 h-9 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all">
                                    <VolumeXIcon v-if="isMuted" :size="16" />
                                    <Volume2Icon v-else :size="16" />
                                </button>
                                <button @click="togglePlayback"
                                    class="w-9 h-9 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all">
                                    <PauseIcon v-if="isPlaying" :size="16" />
                                    <PlayIcon v-else :size="16" />
                                </button>
                            </div>
                        </div>

                        <!-- Story Content -->
                        <div class="flex-1 relative bg-black flex items-center justify-center min-h-0">
                            <img :src="storyImageUrl" :alt="story.title" class="max-w-full max-h-full object-contain" />
                            <!-- Audio element -->
                            <audio v-if="story.audioUrl" ref="audioElement" :src="storyAudioUrl" @ended="onAudioEnded"
                                @loadedmetadata="setupAudio" preload="metadata"></audio>
                        </div>

                        <!-- Story Footer -->
                        <div
                            class="relative z-20 bg-gradient-to-t from-black via-black/80 to-transparent p-4 space-y-3">
                            <!-- Descripción -->
                            <div class="text-white space-y-2">
                                <p class="text-sm leading-relaxed">{{ story.description }}</p>
                                <a v-if="story.externalLink" :href="story.externalLink" target="_blank"
                                    class="inline-flex items-center gap-1 text-blue-400 text-sm font-medium hover:underline">
                                    Ver más
                                    <ExternalLinkIcon :size="14" />
                                </a>
                            </div>

                            <!-- Acciones -->
                            <div class="flex items-center gap-3">
                                <div class="flex items-center gap-2 bg-white bg-opacity-10 rounded-full px-3 py-1">
                                    <HeartIcon :size="16" class="text-red-400" />
                                    <span class="text-white text-sm">{{ story.likes || 0 }}</span>
                                </div>
                                <div class="flex items-center gap-2 bg-white bg-opacity-10 rounded-full px-3 py-1">
                                    <EyeIcon :size="16" class="text-blue-400" />
                                    <span class="text-white text-sm">{{ story.views || 0 }}</span>
                                </div>
                                <div v-if="story.product"
                                    class="flex items-center gap-2 bg-white bg-opacity-10 rounded-full px-3 py-1">
                                    <ShoppingBagIcon :size="16" class="text-green-400" />
                                    <span class="text-white text-sm">Producto</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Story Details Panel -->
                <div class="flex flex-col gap-4 md:gap-6 overflow-y-auto">
                    <!-- Información General -->
                    <div class="space-y-3">
                        <h4 class="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">Información
                            General</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">ID</span>
                                <span class="block text-sm font-medium text-gray-900">{{ story.id.slice(-8)
                                }}</span>
                            </div>
                            <div class="space-y-1">
                                <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Duración</span>
                                <span class="block text-sm font-medium text-gray-900">{{ story.duration }}s</span>
                            </div>
                            <div class="space-y-1">
                                <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Orden</span>
                                <span class="block text-sm font-medium text-gray-900">{{ story.order }}</span>
                            </div>
                            <div class="space-y-1">
                                <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</span>
                                <span
                                    :class="['inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', story.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                                    {{ story.active ? 'Activa' : 'Inactiva' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Producto Relacionado -->
                    <div v-if="story.product" class="space-y-3">
                        <h4 class="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">Producto
                            Relacionado</h4>
                        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <img :src="productImageUrl || '/api/placeholder/60/60'" :alt="story.product.name"
                                class="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                            <div class="space-y-1 min-w-0 flex-1">
                                <span class="block text-sm font-medium text-gray-900 truncate">{{ story.product.name
                                }}</span>
                                <span class="block text-sm font-semibold text-green-600">S/{{
                                    story.product.price?.toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Estadísticas -->
                    <div class="space-y-3">
                        <h4 class="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">Estadísticas
                        </h4>
                        <div class="grid grid-cols-3 gap-3">
                            <div
                                class="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <EyeIcon :size="16" class="text-blue-600" />
                                <span class="text-xs font-medium text-gray-600 uppercase tracking-wide">Vistas</span>
                                <span class="text-lg font-semibold text-gray-900">{{ story.views || 0 }}</span>
                            </div>
                            <div
                                class="flex flex-col items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                <HeartIcon :size="16" class="text-red-600" />
                                <span class="text-xs font-medium text-gray-600 uppercase tracking-wide">Likes</span>
                                <span class="text-lg font-semibold text-gray-900">{{ story.likes || 0 }}</span>
                            </div>
                            <!-- <div
                                class="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <ShoppingBagIcon :size="16" class="text-green-600" />
                                <span class="text-xs font-medium text-gray-600 uppercase tracking-wide">Wants</span>
                                <span class="text-lg font-semibold text-gray-900">{{ story.wants || 0 }}</span>
                            </div>-->
                        </div>
                    </div>

                    <div v-if="usersWhoLiked.length > 0 && (story.likes || 0) > 0" class="space-y-3">
                        <h4 class="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Usuarios que dieron Like
                        </h4>
                        <div class="space-y-2 max-h-32 overflow-y-auto">
                            <div v-for="userEmail in usersWhoLiked" :key="userEmail"
                                class="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                                <HeartIcon :size="14" class="text-red-600" />
                                <span class="text-sm text-gray-700">{{ userEmail }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- <div v-if="usersWhoWanted.length > 0 && (story.wants || 0) > 0" class="space-y-3">
                        <h4 class="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Usuarios que Guardaron
                        </h4>
                        <div class="space-y-2 max-h-32 overflow-y-auto">
                            <div v-for="userEmail in usersWhoWanted" :key="userEmail"
                                class="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                                <BookmarkIcon :size="14" class="text-yellow-600" />
                                <span class="text-sm text-gray-700">{{ userEmail }}</span>
                            </div>
                        </div>
                    </div>-->

                    <!-- Archivos Multimedia 
                    <div class="space-y-3">
                        <h4 class="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">Archivos
                            Multimedia</h4>
                        <div class="space-y-2">
                            <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <ImageIcon :size="16" class="text-gray-600" />
                                <span class="text-sm text-gray-700">Imagen: {{ story.imageUrl ? 'Cargada' : 'No disponible' }}</span>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <Volume2Icon :size="16" class="text-gray-600" />
                                <span class="text-sm text-gray-700">Audio: {{ story.audioUrl ? 'Cargado' : 'No disponible' }}</span>
                            </div>
                        </div>
                    </div>-->

                    <!-- Enlace Externo -->
                    <div v-if="story.externalLink" class="space-y-3">
                        <h4 class="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">Enlace
                            Externo
                        </h4>
                        <a :href="story.externalLink" target="_blank"
                            class="inline-flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-600 text-sm hover:bg-blue-100 hover:underline transition-all max-w-full">
                            <span class="truncate">{{ truncateUrl(story.externalLink) }}</span>
                            <ExternalLinkIcon :size="14" class="flex-shrink-0" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getUrl } from 'aws-amplify/storage'
import { useStories } from '@/composables/useStories'
import {
    XIcon,
    PlayIcon,
    PauseIcon,
    VolumeXIcon,
    Volume2Icon,
    HeartIcon,
    EyeIcon,
    ShoppingBagIcon,
    ExternalLinkIcon,
    ImageIcon
} from 'lucide-vue-next'
import type { Story } from '@/types/story.types'

const { getUsersWhoLiked, getUsersWhoWanted } = useStories()

// Props
interface Props {
    story: Story
}

const loadingAssets = ref(true)
const usersWhoWanted = ref<string[]>([])
const usersWhoLiked = ref<string[]>([])
const productImageUrl = ref('')
const props = defineProps<Props>()

// Emits
defineEmits<{
    close: []
}>()

// Estado
const progressPercentage = ref(0)
const isPlaying = ref(false)
const isMuted = ref(false)
const storyImageUrl = ref('')
const storyAudioUrl = ref('')

// Referencias
const audioElement = ref<HTMLAudioElement>()

// Timer para progreso
let progressTimer: NodeJS.Timeout | null = null

// Métodos
const loadStoryAssets = async () => {
    loadingAssets.value = true

    try {
        // Crear array de promesas para cargar todo en paralelo
        const loadPromises = []

        // Cargar imagen
        if (props.story.imageUrl) {
            const imagePromise = getUrl({ path: props.story.imageUrl })
                .then(({ url }) => {
                    storyImageUrl.value = url.toString()
                })
                .catch((error) => {
                    console.error('Error loading story image:', error)
                    storyImageUrl.value = '/api/placeholder/300/400'
                })
            loadPromises.push(imagePromise)
        } else {
            storyImageUrl.value = '/api/placeholder/300/400'
        }

        // Cargar audio
        if (props.story.audioUrl) {
            const audioPromise = getUrl({ path: props.story.audioUrl })
                .then(({ url }) => {
                    storyAudioUrl.value = url.toString()
                })
                .catch((error) => {
                    console.error('Error loading story audio:', error)
                })
            loadPromises.push(audioPromise)
        }

        // Cargar imagen del producto
        if (props.story.product?.imageUrl) {
            const productPromise = getUrl({ path: props.story.product.imageUrl })
                .then(({ url }) => {
                    productImageUrl.value = url.toString()
                })
                .catch((error) => {
                    console.error('Error loading product image:', error)
                })
            loadPromises.push(productPromise)
        }

        // Esperar a que todas las promesas se resuelvan
        await Promise.all(loadPromises)

        // Agregar un pequeño delay para asegurar que se vea el skeleton
        await new Promise(resolve => setTimeout(resolve, 500))

    } finally {
        loadingAssets.value = false
    }
}

const startPreview = () => {
    const duration = props.story.duration || 10
    progressPercentage.value = 0
    isPlaying.value = true

    // Reproducir audio si existe
    if (props.story.audioUrl && audioElement.value) {
        audioElement.value.play().catch(() => {
            // Error de autoplay, continuar sin audio
        })
    }

    // Iniciar progreso
    const interval = 50 // Update every 50ms
    const increment = (100 / duration) / (1000 / interval)

    progressTimer = setInterval(() => {
        progressPercentage.value += increment
        if (progressPercentage.value >= 100) {
            stopPreview()
        }
    }, interval)
}

const stopPreview = () => {
    isPlaying.value = false
    if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
    }

    if (audioElement.value) {
        audioElement.value.pause()
        audioElement.value.currentTime = 0
    }
}

const togglePlayback = () => {
    if (isPlaying.value) {
        stopPreview()
    } else {
        startPreview()
    }
}

const toggleAudio = () => {
    if (audioElement.value) {
        if (isMuted.value) {
            audioElement.value.volume = 1
            isMuted.value = false
        } else {
            audioElement.value.volume = 0
            isMuted.value = true
        }
    }
}

const setupAudio = () => {
    if (audioElement.value) {
        audioElement.value.volume = isMuted.value ? 0 : 1
    }
}

const onAudioEnded = () => {
    stopPreview()
}

const truncateUrl = (url: string): string => {
    if (url.length <= 40) return url
    return url.substring(0, 40) + '...'
}

const loadUsersWhoWanted = async () => {
    if (props.story.id) {
        usersWhoWanted.value = await getUsersWhoWanted(props.story.id)
    }
}

const loadUsersWhoLiked = async () => {
    if (props.story.id) {
        usersWhoLiked.value = await getUsersWhoLiked(props.story.id)
    }
}

// Lifecycle
onMounted(async () => {
    await loadStoryAssets()

    // Solo cargar usuarios si hay likes/wants
    if (props.story.id) {
        if ((props.story.likes || 0) > 0) {
            usersWhoLiked.value = await getUsersWhoLiked(props.story.id)
        }
        if ((props.story.wants || 0) > 0) {
            usersWhoWanted.value = await getUsersWhoWanted(props.story.id)
        }
    }

    setTimeout(() => {
        startPreview()
    }, 500)
})

onUnmounted(() => {
    stopPreview()
})
</script>

<style scoped>
@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 1279px) {
    .grid.xl\\:grid-cols-2 {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
    }

    .story-preview-container {
        height: 350px;
    }
}

@media (max-width: 768px) {
    .fixed.inset-0 {
        padding: 1rem;
    }

    .max-w-6xl {
        max-width: 100%;
        margin: 0;
    }

    .max-h-90vh {
        max-height: 95vh;
    }

    /* Header responsive */
    .p-6:first-child {
        padding: 1rem;
    }

    /* Body responsive */
    .grid {
        gap: 1rem;
        padding: 1rem;
    }

    /* Story preview más pequeño en mobile */
    .story-preview-container {
        height: 300px;
    }

    /* Stats grid responsive */
    .grid-cols-3 {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    /* General info grid responsive */
    .grid-cols-2 {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    /* Texto más pequeño */
    .text-lg {
        font-size: 1rem;
    }

    .text-base {
        font-size: 0.875rem;
    }
}

@media (max-width: 480px) {
    .story-preview-container {
        height: 250px;
    }

    .p-4 {
        padding: 0.75rem;
    }

    .gap-4 {
        gap: 0.75rem;
    }
}
</style>