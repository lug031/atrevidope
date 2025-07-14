<template>
    <div class="stories-section">
        <div v-if="loading || hasStories" class="stories-section">
            <div class="stories-header">
                <!-- <h2 class="stories-title">Historias</h2> -->
                <div v-if="!loading" class="stories-nav">
                    <button @click="scrollLeft" class="nav-button" :disabled="!canScrollLeft">
                        <ChevronLeftIcon :size="20" />
                    </button>
                    <button @click="scrollRight" class="nav-button" :disabled="!canScrollRight">
                        <ChevronRightIcon :size="20" />
                    </button>
                </div>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="loading" class="stories-skeleton">
                <div v-for="i in 5" :key="i" class="skeleton-item">
                    <div class="skeleton-ring"></div>
                    <div class="skeleton-title"></div>
                </div>
            </div>

            <!-- Stories Container -->
            <div v-else-if="hasStories" class="stories-container" ref="storiesContainer" @scroll="updateScrollButtons">
                <div class="stories-list">
                    <div v-for="story in stories" :key="story.id" class="story-item" @click="openStory(story)">
                        <div class="story-ring">
                            <img :src="getStoryImage(story)" :alt="story.title" class="story-image" />
                            <div class="story-overlay">
                                <PlayIcon :size="24" class="play-icon" />
                            </div>
                        </div>
                        <span class="story-title">{{ truncateTitle(story.title) }}</span>
                    </div>
                </div>
            </div>

            <!-- Modal de Historia -->
            <div v-if="activeStory"
                class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[1000]">
                <!-- Navegación externa con mejor posicionamiento y eventos -->
                <button v-if="currentIndex > 0" @click.stop="previousStory"
                    class="absolute left-4 top-1/2 transform -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all backdrop-blur-sm z-[1050]"
                    style="margin-left: calc(50vw - 280px);">
                    <ChevronLeftIcon :size="28" />
                </button>
                <button v-if="currentIndex < stories.length - 1" @click.stop="nextStory"
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all backdrop-blur-sm z-[1050]"
                    style="margin-right: calc(50vw - 280px);">
                    <ChevronRightIcon :size="28" />
                </button>

                <!-- Close overlay -->
                <div class="absolute inset-0 z-[1000]" @click="closeStory"></div>

                <!-- Story Container -->
                <div class="relative w-full max-w-sm h-screen max-h-[650px] bg-gray-900 rounded-xl overflow-hidden flex flex-col z-[1020]"
                    @click.stop>

                    <!-- Skeleton de carga entre historias -->
                    <div v-if="isStoryLoading" class="absolute inset-0 bg-gray-900 z-40 flex flex-col">
                        <!-- Progress bar skeleton -->
                        <div class="absolute top-3 left-3 right-3 z-20">
                            <div class="w-full h-1 bg-gray-700 rounded-full animate-pulse"></div>
                        </div>

                        <!-- Header skeleton -->
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

                        <!-- Content skeleton -->
                        <div class="flex-1 relative bg-black flex items-center justify-center min-h-0">
                            <div class="w-64 h-80 bg-gray-700 rounded-lg animate-pulse"></div>
                        </div>

                        <!-- Footer skeleton -->
                        <div
                            class="relative z-20 bg-gradient-to-t from-black via-black/90 to-transparent p-4 space-y-4">
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

                    <!-- Contenido real (mostrar solo cuando no está cargando) -->
                    <div v-show="!isStoryLoading" class="h-full flex flex-col">
                        <!-- Progress bar -->
                        <div class="absolute top-3 left-3 right-3 z-[1030]">
                            <div class="w-full h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                                <div class="h-full bg-white transition-all ease-linear"
                                    :style="{ width: `${progressPercentage}%`, transitionDuration: isPlaying ? '100ms' : '0ms' }">
                                </div>
                            </div>
                        </div>

                        <!-- Header -->
                        <div class="relative z-[1030] flex justify-between items-center p-6">
                            <div class="flex items-center gap-3">
                                <img :src="getStoryImage(activeStory)" :alt="activeStory.title"
                                    class="w-8 h-8 rounded-full object-cover" />
                                <span class="text-white font-medium text-sm">{{ activeStory.title }}</span>
                            </div>

                            <!-- Controls agrupados arriba a la derecha -->
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

                                <button @click="closeStory"
                                    class="w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all">
                                    <XIcon :size="16" />
                                </button>
                            </div>
                        </div>

                        <!-- Contenido principal -->
                        <div class="flex-1 relative bg-black flex items-center justify-center min-h-0">
                            <img :src="getStoryImage(activeStory)" :alt="activeStory.title"
                                class="max-w-full max-h-full object-contain" />

                            <!-- Audio element -->
                            <audio v-if="activeStory.audioUrl" ref="audioElement" :src="getAudioUrl(activeStory)"
                                @ended="onAudioEnded" @loadedmetadata="setupAudio" preload="metadata"></audio>
                        </div>

                        <!-- Footer con descripción y botones de acción -->
                        <div
                            class="relative z-[1030] bg-gradient-to-t from-black via-black/90 to-transparent p-4 space-y-4">
                            <!-- Descripción -->
                            <div class="text-white space-y-2">
                                <p class="text-sm leading-relaxed">{{ activeStory.description }}</p>
                                <a v-if="activeStory.externalLink" :href="activeStory.externalLink" target="_blank"
                                    class="inline-flex items-center gap-1 text-blue-400 text-sm font-medium hover:underline">
                                    Ver más
                                    <ExternalLinkIcon :size="14" />
                                </a>
                            </div>

                            <!-- Action buttons horizontales -->
                            <div class="flex items-center justify-center gap-6">
                                <div class="tooltip-container">
                                    <button @click="handleLike"
                                        class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
                                        :class="{ 'text-red-500': isLiked, 'text-white': !isLiked }">
                                        <HeartIcon :size="24" :class="isLiked ? 'fill-current' : ''" />
                                        <span class="text-xs">Me gusta</span>
                                    </button>
                                </div>

                                <!-- <div class="tooltip-container">
                                <button @click="handleWant"
                                    class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
                                    :class="{ 'text-yellow-500': isWanted, 'text-white': !isWanted }">
                                    <BookmarkIcon :size="24" :class="isWanted ? 'fill-current' : ''" />
                                    <span class="text-xs">Guardar</span>
                                </button>
                            </div>-->

                                <div class="tooltip-container">
                                    <button @click="handleShare"
                                        class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all text-white">
                                        <ShareIcon :size="24" />
                                        <span class="text-xs">Compartir</span>
                                    </button>
                                </div>

                                <div v-if="activeStory.product" class="tooltip-container">
                                    <button @click="goToProduct"
                                        class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all text-white">
                                        <TagIcon :size="24" />
                                        <span class="text-xs">Comprar</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Contador de likes centrado 
                    <div v-if="activeStory.likes && activeStory.likes > 0" class="flex justify-center">
                        <div class="text-white text-sm font-medium bg-white bg-opacity-10 rounded-full px-3 py-1">
                            {{ activeStory.likes }} {{ activeStory.likes === 1 ? 'like' : 'likes' }}
                        </div>
                    </div>-->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStories } from '@/composables/useStories'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { getUrl } from 'aws-amplify/storage'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlayIcon,
    PauseIcon,
    XIcon,
    HeartIcon,
    BookmarkIcon,
    ShareIcon,
    TagIcon,
    ExternalLinkIcon,
    VolumeXIcon,
    Volume2Icon
} from 'lucide-vue-next'
import type { Story } from '@/types/story.types'
import { useStoryImageCache } from '@/composables/useStoryImageCache'

const {
    storyImageCache,
    getStoryImageUrl,
    preloadStoryImages,
    preloadAdjacentStories,
    getCachedStoryImage,
} = useStoryImageCache()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { showToast } = useToast()

const {
    stories,
    loading,
    loadActiveStories,
    viewStory,
    likeStory,
    wantStory,
    checkIfUserLiked,
    checkIfUserWanted
} = useStories()

// Referencias
const storiesContainer = ref<HTMLElement>()
const audioElement = ref<HTMLAudioElement>()

// Estado
const activeStory = ref<Story | null>(null)
const currentIndex = ref(0)
const progressPercentage = ref(0)
const isPlaying = ref(false)
const isMuted = ref(false)
const isLiked = ref(false)
const isWanted = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const storyImages = ref<Record<string, string>>({})
const storyAudios = ref<Record<string, string>>({})

const isStoryLoading = ref(false)
let progressTimer: NodeJS.Timeout | null = null
let isNavigating = ref(false)

const hasStories = computed(() => {
    return stories.value.length > 0
})

const truncateTitle = (title: string) => {
    return title.length > 12 ? title.substring(0, 12) + '...' : title
}

const getStoryImage = (story: Story): string => {
    return getCachedStoryImage(story.id)
}

const preloadAdjacentStoriesOnOpen = async (currentIndex: number) => {
    await preloadAdjacentStories(stories.value, currentIndex)
}

const getAudioUrl = (story: Story): string => {
    return storyAudios.value[story.id] || ''
}

const loadStoryAssets = async () => {
    await preloadStoryImages(stories.value)

    // Cargar audios por separado (mantener lógica existente)
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

const scrollLeft = () => {
    if (storiesContainer.value) {
        storiesContainer.value.scrollBy({ left: -200, behavior: 'smooth' })
    }
}

const scrollRight = () => {
    if (storiesContainer.value) {
        storiesContainer.value.scrollBy({ left: 200, behavior: 'smooth' })
    }
}

const updateScrollButtons = () => {
    if (storiesContainer.value) {
        const { scrollLeft, scrollWidth, clientWidth } = storiesContainer.value
        canScrollLeft.value = scrollLeft > 0
        canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1
    }
}

const openStory = async (story: Story) => {
    if (isNavigating.value) return

    isNavigating.value = true
    isStoryLoading.value = true
    activeStory.value = story
    currentIndex.value = stories.value.findIndex(s => s.id === story.id)

    try {
        // Paralelizar las operaciones
        const loadPromises = []

        // 1. Verificar estados de like/want
        const userEmail = authStore.userEmail
        if (userEmail) {
            loadPromises.push(
                checkIfUserLiked(story.id, userEmail).then(result => {
                    isLiked.value = result
                }),
                checkIfUserWanted(story.id, userEmail).then(result => {
                    isWanted.value = result
                }),
                viewStory(story.id, userEmail)
            )
        } else {
            isLiked.value = false
            isWanted.value = false
            viewStory(story.id, "anonymus")
        }

        // 2. Precargar stories adyacentes
        loadPromises.push(preloadAdjacentStoriesOnOpen(currentIndex.value))

        // 3. Asegurar que la imagen actual esté cargada
        if (story.imageUrl) {
            loadPromises.push(getStoryImageUrl(story.id, story.imageUrl))
        }

        // Ejecutar todo en paralelo
        await Promise.all(loadPromises)

        // Delay mínimo solo si la carga fue muy rápida
        const minLoadTime = 200
        await new Promise(resolve => setTimeout(resolve, minLoadTime))

        // Continuar con la lógica existente...
        if (activeStory.value && activeStory.value.id === story.id) {
            if (route.query.story !== story.id) {
                await router.replace({ query: { ...route.query, story: story.id } })
            }

            if (activeStory.value) {
                startStoryPlayback()
            }
        }
    } catch (error) {
        console.error('Error opening story:', error)
    } finally {
        isStoryLoading.value = false
        isNavigating.value = false
    }
}

const closeStory = async () => {
    stopStoryPlayback()

    // Guardar referencia antes de limpiar
    const wasOpen = activeStory.value !== null

    activeStory.value = null
    isNavigating.value = false

    // Solo limpiar URL si realmente había una historia abierta
    if (wasOpen) {
        const query = { ...route.query }
        delete query.story
        await router.replace({ query })
    }
}

const startStoryPlayback = () => {
    if (!activeStory.value) return

    const duration = (activeStory.value.duration || 10) * 1000 // Convertir a millisegundos
    progressPercentage.value = 0
    isPlaying.value = true

    // Si hay audio, reproducirlo
    if (activeStory.value.audioUrl && audioElement.value) {
        audioElement.value.play().catch(() => {
            // Error de autoplay, continuar sin audio
        })
    }

    // Iniciar progreso con intervalos más precisos
    const interval = 50 // Update every 50ms
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

    // Si hay más historias, ir a la siguiente automáticamente después de un pequeño delay
    if (currentIndex.value < stories.value.length - 1) {
        setTimeout(async () => {
            await nextStory()
        }, 500) // Delay de 500ms para una transición más suave
    } else {
        // Si es la última historia, solo mantener pausada
        progressPercentage.value = 100
    }
}

const onAudioEnded = () => {
    // Cuando termina el audio, también activar la transición automática
    onStoryEnd()
}

const nextStory = async () => {
    if (isNavigating.value || currentIndex.value >= stories.value.length - 1) return

    stopStoryPlayback()
    const nextStoryData = stories.value[currentIndex.value + 1]

    // Precargar la siguiente historia si existe
    if (currentIndex.value + 2 < stories.value.length) {
        const futureStory = stories.value[currentIndex.value + 2]
        if (futureStory.imageUrl) {
            getStoryImageUrl(futureStory.id, futureStory.imageUrl).catch(console.error)
        }
    }

    await openStory(nextStoryData)
}

const previousStory = async () => {
    if (isNavigating.value || currentIndex.value <= 0) return

    stopStoryPlayback()
    const prevStoryData = stories.value[currentIndex.value - 1]
    await openStory(prevStoryData)
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

        // Actualizar el contador local inmediatamente
        if (isLiked.value) {
            activeStory.value.likes = (activeStory.value.likes || 0) + 1
        } else {
            activeStory.value.likes = Math.max(0, (activeStory.value.likes || 0) - 1)
        }
    } catch (error) {
        // Revertir estado en caso de error
        isLiked.value = previousLikedState
        showToast({
            type: 'error',
            message: 'Error al dar like'
        })
    }
}

const handleWant = async () => {
    if (!activeStory.value) return

    const userEmail = authStore.userEmail
    if (!userEmail) {
        showToast({
            type: 'warning',
            message: 'Debes iniciar sesión'
        })
        return
    }

    const previousWantedState = isWanted.value

    try {
        await wantStory(activeStory.value.id, userEmail)
        isWanted.value = !isWanted.value

        // Actualizar el contador local inmediatamente
        if (isWanted.value) {
            activeStory.value.wants = (activeStory.value.wants || 0) + 1
            showToast({
                type: 'success',
                message: '¡Historia guardada!'
            })
        } else {
            activeStory.value.wants = Math.max(0, (activeStory.value.wants || 0) - 1)
            showToast({
                type: 'success',
                message: 'Historia removida de guardados'
            })
        }
    } catch (error) {
        // Revertir estado en caso de error
        isWanted.value = previousWantedState
        showToast({
            type: 'error',
            message: 'Error al guardar historia'
        })
    }
}

const handleShare = async () => {
    if (!activeStory.value) return

    try {
        // Crear el link de la historia
        const currentUrl = window.location.origin + window.location.pathname
        const storyLink = `${currentUrl}?story=${activeStory.value.id}`

        // Copiar al portapapeles
        await navigator.clipboard.writeText(storyLink)

        showToast({
            type: 'success',
            message: 'Link copiado al portapapeles'
        })
    } catch (error) {
        showToast({
            type: 'error',
            message: 'Error al copiar el link'
        })
    }
}

const goToProduct = () => {
    if (activeStory.value?.product) {
        router.push(`/product/${activeStory.value.product.id}`)
    }
}

// Manejar historia desde URL
const handleStoryFromUrl = async () => {
    if (isNavigating.value) return

    const storyId = route.query.story as string
    if (storyId && stories.value.length > 0) {
        const story = stories.value.find(s => s.id === storyId)
        if (story && (!activeStory.value || activeStory.value.id !== storyId)) {
            await openStory(story)
        }
    } else if (!storyId && activeStory.value) {
        // Si no hay storyId en la URL pero hay una historia activa, cerrarla
        activeStory.value = null
        stopStoryPlayback()
    }
}

// Lifecycle
onMounted(async () => {
    await loadActiveStories()
    // Precargar todas las imágenes de stories al inicio
    await loadStoryAssets()
    await handleStoryFromUrl()

    nextTick(() => {
        updateScrollButtons()
    })
})

onUnmounted(() => {
    stopStoryPlayback()
})

// Watchers
watch(() => stories.value, async () => {
    await loadStoryAssets()
    await handleStoryFromUrl()
    nextTick(() => {
        updateScrollButtons()
    })
})

watch(() => route.query.story, () => {
    if (!isNavigating.value) {
        handleStoryFromUrl()
    }
}, { immediate: false })
</script>

<style scoped>
.stories-section {
    margin: 2rem 0;
    padding: 0 1rem;
}

.stories-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.stories-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
}

.stories-nav {
    display: flex;
    gap: 0.5rem;
}

.nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid #e5e7eb;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.nav-button:hover:not(:disabled) {
    background: #f3f4f6;
}

.nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Loading Skeleton */
.stories-skeleton {
    display: flex;
    gap: 1.5rem;
    /* Mismo gap que .stories-list */
    padding: 0.5rem 0;
    justify-content: center;
    /* Agregar centrado */
    overflow-x: auto;
    /* Mismo comportamiento de scroll */
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.stories-skeleton::-webkit-scrollbar {
    display: none;
}

.skeleton-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
}

.skeleton-ring {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 2s infinite;
    margin-bottom: 0.5rem;
}

.skeleton-title {
    width: 60px;
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 2s infinite;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.stories-container {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    display: flex;
    justify-content: center;
    /* Centrar el contenido */
    padding: 0 1rem;
    /* Espaciado lateral */
}

.stories-container::-webkit-scrollbar {
    display: none;
}

.stories-list {
    display: flex;
    gap: 1.5rem;
    /* Aumentar gap en desktop */
    padding: 0.5rem 0;
    justify-content: center;
    /* Centrar elementos */
    min-width: fit-content;
    /* Evitar que se comprima */
}

.story-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    min-width: 100px;
    /* Aumentar ancho mínimo */
    flex-shrink: 0;
    /* Evitar que se reduzcan */
}

.story-ring {
    position: relative;
    width: 90px;
    /* Aumentar tamaño para desktop */
    height: 90px;
    border-radius: 50%;
    background: linear-gradient(45deg, #f59e0b, #ef4444, #8b5cf6);
    padding: 3px;
    margin-bottom: 0.75rem;
}

.story-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
}

.story-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s;
}

.story-item:hover .story-overlay {
    opacity: 1;
}

.play-icon {
    color: white;
}

.story-title {
    font-size: 0.875rem;
    /* Aumentar tamaño de fuente */
    text-align: center;
    color: #4b5563;
    max-width: 100px;
    line-height: 1.2;
}

/* Tooltip Styles */
.tooltip-container {
    position: relative;
}

.tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
    z-index: 1100;
    pointer-events: none;
}

/* Tooltips arriba por defecto */
.tooltip-container:hover .tooltip {
    opacity: 1;
    visibility: visible;
}

/* Tooltips que van arriba */
.tooltip-container:hover .tooltip-bottom {
    bottom: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
}

/* Responsive tooltips */
@media (max-width: 768px) {
    .tooltip {
        display: none;
    }
}

/* Desktop y tablet - stories más grandes */
@media (min-width: 769px) {
    .stories-list {
        gap: 2rem;
        /* Más espacio entre stories en desktop */
    }

    .story-item {
        min-width: 110px;
    }

    .story-ring {
        width: 150px;
        height: 150px;
        margin-bottom: 1rem;
    }

    .story-title {
        font-size: 0.875rem;
        max-width: 110px;
    }

    .play-icon {
        size: 28px;
        /* Icono más grande en desktop */
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