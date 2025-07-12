<template>
    <!-- Modal sin overlay, posicionado cerca del botón flotante -->
    <div class="stories-modal-positioned">
        <div class="stories-modal-content" @click.stop>
            <!-- Solo la lista de historias, sin header -->
            <div class="modal-body">
                <StoriesList @story-selected="openStoryViewer" />
            </div>
        </div>
    </div>

    <!-- Story Viewer Modal (superpuesto) -->
    <div v-if="activeStory" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[2000]">
        <!-- Navegación externa -->
        <button v-if="currentIndex > 0" @click.stop="previousStory"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all backdrop-blur-sm z-[2050]"
            style="margin-left: calc(50vw - 280px);">
            <ChevronLeftIcon :size="28" />
        </button>
        <button v-if="currentIndex < stories.length - 1" @click.stop="nextStory"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all backdrop-blur-sm z-[2050]"
            style="margin-right: calc(50vw - 280px);">
            <ChevronRightIcon :size="28" />
        </button>

        <!-- Close overlay -->
        <div class="absolute inset-0 z-[2000]" @click="closeStoryViewer"></div>

        <!-- Story Container -->
        <div class="relative w-full max-w-sm h-screen max-h-[650px] bg-gray-900 rounded-xl overflow-hidden flex flex-col z-[2020]"
            @click.stop>
            <!-- Story Viewer Content -->
            <div v-if="isStoryLoading" class="absolute inset-0 bg-gray-900 z-40 flex flex-col">
                <!-- Loading skeleton content -->
                <div class="absolute top-3 left-3 right-3 z-20">
                    <div class="w-full h-1 bg-gray-700 rounded-full animate-pulse"></div>
                </div>
                <div class="relative z-20 flex justify-between items-center p-6">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
                        <div class="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
                        <div class="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
                        <div class="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
                    </div>
                </div>
                <div class="flex-1 relative bg-black flex items-center justify-center min-h-0">
                    <div class="w-64 h-80 bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
                <div class="relative z-20 bg-gradient-to-t from-black via-black/90 to-transparent p-4 space-y-4">
                    <div class="space-y-2">
                        <div class="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
                        <div class="h-4 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div class="flex items-center justify-center gap-6">
                        <div class="flex flex-col items-center gap-1">
                            <div class="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                            <div class="h-3 w-12 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div class="flex flex-col items-center gap-1">
                            <div class="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                            <div class="h-3 w-12 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div class="flex flex-col items-center gap-1">
                            <div class="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                            <div class="h-3 w-12 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Story Content -->
            <div v-show="!isStoryLoading" class="h-full flex flex-col">
                <!-- Progress bar -->
                <div class="absolute top-3 left-3 right-3 z-[2030]">
                    <div class="w-full h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                        <div class="h-full bg-white transition-all ease-linear"
                            :style="{ width: `${progressPercentage}%`, transitionDuration: isPlaying ? '100ms' : '0ms' }">
                        </div>
                    </div>
                </div>

                <!-- Header -->
                <div class="relative z-[2030] flex justify-between items-center p-6">
                    <div class="flex items-center gap-3">
                        <img :src="getStoryImage(activeStory)" :alt="activeStory.title"
                            class="w-8 h-8 rounded-full object-cover" />
                        <span class="text-white font-medium text-sm">{{ activeStory.title }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <button v-if="activeStory.audioUrl" @click="toggleAudio"
                            class="w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all">
                            <VolumeXIcon v-if="isMuted" :size="16" />
                            <Volume2Icon v-else :size="16" />
                        </button>

                        <button @click="togglePlayback"
                            class="w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all">
                            <PauseIcon v-if="isPlaying" :size="16" />
                            <PlayIcon v-else :size="16" />
                        </button>

                        <button @click="closeStoryViewer"
                            class="w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all">
                            <XIcon :size="16" />
                        </button>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex-1 relative bg-black flex items-center justify-center min-h-0">
                    <img :src="getStoryImage(activeStory)" :alt="activeStory.title"
                        class="max-w-full max-h-full object-contain" />

                    <audio v-if="activeStory.audioUrl" ref="audioElement" :src="getAudioUrl(activeStory)"
                        @ended="onAudioEnded" @loadedmetadata="setupAudio" preload="metadata"></audio>
                </div>

                <!-- Footer -->
                <div class="relative z-[2030] bg-gradient-to-t from-black via-black/90 to-transparent p-4 space-y-4">
                    <div class="text-white space-y-2">
                        <p class="text-sm leading-relaxed">{{ activeStory.description }}</p>
                        <a v-if="activeStory.externalLink" :href="activeStory.externalLink" target="_blank"
                            class="inline-flex items-center gap-1 text-blue-400 text-sm font-medium hover:underline">
                            Ver más
                            <ExternalLinkIcon :size="14" />
                        </a>
                    </div>

                    <div class="flex items-center justify-center gap-6">
                        <button @click="handleLike"
                            class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
                            :class="{ 'text-red-500': isLiked, 'text-white': !isLiked }">
                            <HeartIcon :size="24" :class="isLiked ? 'fill-current' : ''" />
                            <span class="text-xs">Me gusta</span>
                        </button>

                        <button @click="handleShare"
                            class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all text-white">
                            <ShareIcon :size="24" />
                            <span class="text-xs">Compartir</span>
                        </button>

                        <button v-if="activeStory.product" @click="goToProduct"
                            class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all text-white">
                            <TagIcon :size="24" />
                            <span class="text-xs">Comprar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStories } from '@/composables/useStories'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useStoryImageCache } from '@/composables/useStoryImageCache'
import { getUrl } from 'aws-amplify/storage'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlayIcon,
    PauseIcon,
    XIcon,
    HeartIcon,
    ShareIcon,
    TagIcon,
    ExternalLinkIcon,
    VolumeXIcon,
    Volume2Icon
} from 'lucide-vue-next'
import type { Story } from '@/types/story.types'
import StoriesList from './StoriesList.vue'

const emit = defineEmits<{
    close: []
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { showToast } = useToast()

const {
    stories,
    viewStory,
    likeStory,
    checkIfUserLiked,
    shareStory
} = useStories()

const {
    getCachedStoryImage,
    getStoryImageUrl,
    preloadAdjacentStories
} = useStoryImageCache()

// Referencias
const audioElement = ref<HTMLAudioElement>()

// Estado del modal
const activeStory = ref<Story | null>(null)
const currentIndex = ref(0)
const progressPercentage = ref(0)
const isPlaying = ref(false)
const isMuted = ref(false)
const isLiked = ref(false)
const isStoryLoading = ref(false)
const storyAudios = ref<Record<string, string>>({})

let progressTimer: NodeJS.Timeout | null = null
let isNavigating = ref(false)

// Métodos principales
const closeModal = () => {
    emit('close')
}

const openStoryViewer = async (story: Story) => {
    if (isNavigating.value) return

    isNavigating.value = true
    isStoryLoading.value = true
    activeStory.value = story
    currentIndex.value = stories.value.findIndex(s => s.id === story.id)

    try {
        const loadPromises = []

        const userEmail = authStore.userEmail
        if (userEmail) {
            loadPromises.push(
                checkIfUserLiked(story.id, userEmail).then(result => {
                    isLiked.value = result
                }),
                viewStory(story.id, userEmail)
            )
        } else {
            isLiked.value = false
            viewStory(story.id, "anonymous")
        }

        loadPromises.push(preloadAdjacentStories(stories.value, currentIndex.value))

        if (story.imageUrl) {
            loadPromises.push(getStoryImageUrl(story.id, story.imageUrl))
        }

        await Promise.all(loadPromises)
        await new Promise(resolve => setTimeout(resolve, 200))

        if (activeStory.value && activeStory.value.id === story.id) {
            if (route.query.story !== story.id) {
                await router.replace({ query: { ...route.query, story: story.id } })
            }
            startStoryPlayback()
        }
    } catch (error) {
        console.error('Error opening story:', error)
    } finally {
        isStoryLoading.value = false
        isNavigating.value = false
    }
}

const closeStoryViewer = async () => {
    stopStoryPlayback()
    activeStory.value = null
    isNavigating.value = false

    const query = { ...route.query }
    delete query.story
    await router.replace({ query })
}

// Métodos de reproducción
const startStoryPlayback = () => {
    if (!activeStory.value) return

    const duration = (activeStory.value.duration || 10) * 1000
    progressPercentage.value = 0
    isPlaying.value = true

    if (activeStory.value.audioUrl && audioElement.value) {
        audioElement.value.play().catch(() => {
            // Error de autoplay, continuar sin audio
        })
    }

    const interval = 50
    const increment = (100 / duration) * interval

    progressTimer = setInterval(() => {
        if (isPlaying.value) {
            progressPercentage.value += increment
            if (progressPercentage.value >= 100) {
                progressPercentage.value = 100
                onStoryEnd()
            }
        }
    }, interval)
}

const stopStoryPlayback = () => {
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
        stopStoryPlayback()
    } else {
        startStoryPlayback()
    }
}

const onStoryEnd = async () => {
    stopStoryPlayback()
    if (currentIndex.value < stories.value.length - 1) {
        setTimeout(async () => {
            await nextStory()
        }, 500)
    } else {
        progressPercentage.value = 100
    }
}

const nextStory = async () => {
    if (isNavigating.value || currentIndex.value >= stories.value.length - 1) return

    stopStoryPlayback()
    const nextStoryData = stories.value[currentIndex.value + 1]
    await openStoryViewer(nextStoryData)
}

const previousStory = async () => {
    if (isNavigating.value || currentIndex.value <= 0) return

    stopStoryPlayback()
    const prevStoryData = stories.value[currentIndex.value - 1]
    await openStoryViewer(prevStoryData)
}

// Métodos de audio
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
    onStoryEnd()
}

// Métodos auxiliares
const getStoryImage = (story: Story): string => {
    return getCachedStoryImage(story.id)
}

const getAudioUrl = (story: Story): string => {
    return storyAudios.value[story.id] || ''
}

// Métodos de interacción
const handleLike = async () => {
    if (!activeStory.value || !authStore.userEmail) {
        showToast({
            type: 'warning',
            message: 'Debes iniciar sesión para dar like'
        })
        return
    }

    const previousLikedState = isLiked.value

    try {
        await likeStory(activeStory.value.id, authStore.userEmail)
        isLiked.value = !isLiked.value

        if (isLiked.value) {
            activeStory.value.likes = (activeStory.value.likes || 0) + 1
        } else {
            activeStory.value.likes = Math.max(0, (activeStory.value.likes || 0) - 1)
        }
    } catch (error) {
        isLiked.value = previousLikedState
        showToast({
            type: 'error',
            message: 'Error al dar like'
        })
    }
}

const handleShare = async () => {
    if (!activeStory.value) return

    try {
        // const currentUrl = window.location.origin + window.location.pathname
        // const storyLink = `${currentUrl}?story=${activeStory.value.id}`
        // await navigator.clipboard.writeText(storyLink)
        await shareStory(activeStory.value)
        /*showToast({
            type: 'success',
            message: 'Link copiado al portapapeles'
        })*/
    } catch (error) {
        /*showToast({
            type: 'error',
            message: 'Error al copiar el link'
        })*/
        showToast({
            type: 'error',
            message: 'Error al compartir'
        })
    }
}

const goToProduct = () => {
    if (activeStory.value?.product) {
        router.push(`/product/${activeStory.value.product.id}`)
    }
}

// Cargar audios
const loadStoryAudios = async () => {
    for (const story of stories.value) {
        if (story.audioUrl) {
            try {
                const { url } = await getUrl({ path: story.audioUrl })
                storyAudios.value[story.id] = url.toString()
            } catch (error) {
                console.error('Error loading story audio:', error)
            }
        }
    }
}

// Manejar historia desde URL
const handleStoryFromUrl = async () => {
    if (isNavigating.value) return

    const storyId = route.query.story as string
    if (storyId && stories.value.length > 0) {
        const story = stories.value.find(s => s.id === storyId)
        if (story && (!activeStory.value || activeStory.value.id !== storyId)) {
            await openStoryViewer(story)
        }
    }
}

// Lifecycle
onMounted(async () => {
    await loadStoryAudios()
    await handleStoryFromUrl()
})

onUnmounted(() => {
    stopStoryPlayback()
})

// Watchers
watch(() => stories.value, async () => {
    await loadStoryAudios()
    await handleStoryFromUrl()
})

watch(() => route.query.story, () => {
    if (!isNavigating.value) {
        handleStoryFromUrl()
    }
})
</script>

<style scoped>
.stories-modal-positioned {
    position: fixed;
    bottom: 6rem;
    /* Arriba del botón flotante */
    left: 2rem;
    /* Alineado con el botón flotante */
    z-index: 1500;
}

.stories-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1500;
    padding: 1rem;
}

.stories-modal-content {
    background: white;
    border-radius: 1rem;
    width: 350px;
    height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    color: #6b7280;
}

.close-button:hover {
    background: #f3f4f6;
}

.modal-body {
    flex: 1;
    overflow: hidden;
    padding: 0;
}

/* Botones de navegación responsive */
@media (max-width: 768px) {
    .stories-modal-positioned {
        bottom: 5rem;
        left: 1rem;
    }

    .stories-modal-content {
        width: 280px;
        height: 350px;
    }

    /* Ajustar botones de navegación para mobile */
    .absolute.left-4 {
        left: 0.5rem !important;
        margin-left: calc(50vw - 200px) !important;
    }

    .absolute.right-4 {
        right: 0.5rem !important;
        margin-right: calc(50vw - 200px) !important;
    }

    /* Hacer botones más pequeños en mobile */
    .absolute.left-4,
    .absolute.right-4 {
        width: 3rem !important;
        height: 3rem !important;
    }
}

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
</style>