<template>
    <div class="stories-section">
        <div class="stories-header">
            <h2 class="stories-title">Historias</h2>
            <div class="stories-nav">
                <button @click="scrollLeft" class="nav-button" :disabled="!canScrollLeft">
                    <ChevronLeftIcon :size="20" />
                </button>
                <button @click="scrollRight" class="nav-button" :disabled="!canScrollRight">
                    <ChevronRightIcon :size="20" />
                </button>
            </div>
        </div>

        <div class="stories-container" ref="storiesContainer" @scroll="updateScrollButtons">
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
        <div v-if="activeStory" class="story-modal" @click="closeStory">
            <div class="story-modal-content" @click.stop>
                <!-- Progress bar -->
                <div class="story-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
                    </div>
                </div>

                <!-- Header -->
                <div class="story-header">
                    <div class="story-info">
                        <img :src="getStoryImage(activeStory)" :alt="activeStory.title" class="story-avatar" />
                        <span class="story-author">{{ activeStory.title }}</span>
                    </div>
                    <button @click="closeStory" class="close-button">
                        <XIcon :size="24" />
                    </button>
                </div>

                <!-- Contenido principal -->
                <div class="story-content">
                    <img :src="getStoryImage(activeStory)" :alt="activeStory.title" class="main-image" />

                    <!-- Audio controls -->
                    <div v-if="activeStory.audioUrl" class="audio-controls">
                        <button @click="toggleAudio" class="audio-button">
                            <VolumeXIcon v-if="isMuted" :size="20" />
                            <Volume2Icon v-else :size="20" />
                        </button>
                        <audio ref="audioElement" :src="getAudioUrl(activeStory)" @ended="nextStory"
                            @loadedmetadata="setupAudio" preload="metadata"></audio>
                    </div>
                </div>

                <!-- Footer con descripción y acciones -->
                <div class="story-footer">
                    <div class="story-description">
                        <p>{{ activeStory.description }}</p>
                        <a v-if="activeStory.externalLink" :href="activeStory.externalLink" target="_blank"
                            class="external-link">
                            Ver más
                            <ExternalLinkIcon :size="16" />
                        </a>
                    </div>

                    <div class="story-actions">
                        <button @click="handleLike" class="action-button like" :class="{ active: isLiked }">
                            <HeartIcon :size="20" :class="{ filled: isLiked }" />
                            <span>{{ activeStory.likes || 0 }}</span>
                        </button>

                        <button @click="handleWant" class="action-button want">
                            <ShoppingBagIcon :size="20" />
                            <span>Lo quiero</span>
                        </button>

                        <button @click="handleShare" class="action-button share">
                            <ShareIcon :size="20" />
                            <span>Compartir</span>
                        </button>

                        <button v-if="activeStory.product" @click="goToProduct" class="action-button product">
                            <TagIcon :size="20" />
                            <span>Ver producto</span>
                        </button>
                    </div>
                </div>

                <!-- Navegación -->
                <button @click="previousStory" class="nav-story prev" v-if="currentIndex > 0">
                    <ChevronLeftIcon :size="24" />
                </button>
                <button @click="nextStory" class="nav-story next" v-if="currentIndex < stories.length - 1">
                    <ChevronRightIcon :size="24" />
                </button>
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
    XIcon,
    HeartIcon,
    ShoppingBagIcon,
    ShareIcon,
    TagIcon,
    ExternalLinkIcon,
    VolumeXIcon,
    Volume2Icon
} from 'lucide-vue-next'
import type { Story } from '@/types/story.types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { showToast } = useToast()

const {
    stories,
    loading,
    loadStories,
    viewStory,
    likeStory,
    wantStory,
    shareStory
} = useStories()

// Referencias
const storiesContainer = ref<HTMLElement>()
const audioElement = ref<HTMLAudioElement>()

// Estado
const activeStory = ref<Story | null>(null)
const currentIndex = ref(0)
const progressPercentage = ref(0)
const isMuted = ref(false)
const isLiked = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const storyImages = ref<Record<string, string>>({})
const storyAudios = ref<Record<string, string>>({})

// Timer para progreso automático
let progressTimer: NodeJS.Timeout | null = null
let storyTimer: NodeJS.Timeout | null = null

const truncateTitle = (title: string) => {
    return title.length > 12 ? title.substring(0, 12) + '...' : title
}

const getStoryImage = (story: Story): string => {
    return storyImages.value[story.id] || '/api/placeholder/100/100'
}

const getAudioUrl = (story: Story): string => {
    return storyAudios.value[story.id] || ''
}

const loadStoryAssets = async () => {
    for (const story of stories.value) {
        // Cargar imagen
        if (story.imageUrl) {
            try {
                const { url } = await getUrl({ path: story.imageUrl })
                storyImages.value[story.id] = url.toString()
            } catch (error) {
                console.error('Error loading story image:', error)
            }
        }

        // Cargar audio
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
    activeStory.value = story
    currentIndex.value = stories.value.findIndex(s => s.id === story.id)

    // Registrar vista
    const userEmail = authStore.userEmail
    await viewStory(story.id, userEmail)

    // Actualizar URL
    await router.replace({ query: { ...route.query, story: story.id } })

    // Iniciar reproducción
    startStoryPlayback()
}

const closeStory = async () => {
    stopStoryPlayback()
    activeStory.value = null

    // Limpiar URL
    const query = { ...route.query }
    delete query.story
    await router.replace({ query })
}

const startStoryPlayback = () => {
    if (!activeStory.value) return

    const duration = activeStory.value.duration || 10 // Default 10 segundos
    progressPercentage.value = 0

    // Si hay audio, reproducirlo
    if (activeStory.value.audioUrl && audioElement.value) {
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
            nextStory()
        }
    }, interval)
}

const stopStoryPlayback = () => {
    if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
    }

    if (audioElement.value) {
        audioElement.value.pause()
        audioElement.value.currentTime = 0
    }
}

const nextStory = () => {
    if (currentIndex.value < stories.value.length - 1) {
        stopStoryPlayback()
        const nextStoryData = stories.value[currentIndex.value + 1]
        openStory(nextStoryData)
    } else {
        closeStory()
    }
}

const previousStory = () => {
    if (currentIndex.value > 0) {
        stopStoryPlayback()
        const prevStoryData = stories.value[currentIndex.value - 1]
        openStory(prevStoryData)
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

const handleLike = async () => {
    if (!activeStory.value || !authStore.userEmail) {
        showToast({
            type: 'warning',
            message: 'Debes iniciar sesión para dar like'
        })
        return
    }

    await likeStory(activeStory.value.id, authStore.userEmail)
    isLiked.value = !isLiked.value
}

const handleWant = async () => {
    if (!activeStory.value) return

    const userEmail = authStore.userEmail
    await wantStory(activeStory.value.id, userEmail)

    showToast({
        type: 'success',
        message: '¡Agregado a tu lista de deseos!'
    })
}

const handleShare = async () => {
    if (!activeStory.value) return

    try {
        await shareStory(activeStory.value)
        showToast({
            type: 'success',
            message: 'Historia compartida'
        })
    } catch (error) {
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

// Manejar historia desde URL
const handleStoryFromUrl = async () => {
    const storyId = route.query.story as string
    if (storyId && stories.value.length > 0) {
        const story = stories.value.find(s => s.id === storyId)
        if (story) {
            await openStory(story)
        }
    }
}

// Lifecycle
onMounted(async () => {
    await loadStories()
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

watch(() => route.query.story, handleStoryFromUrl)
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

.stories-container {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.stories-container::-webkit-scrollbar {
    display: none;
}

.stories-list {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
}

.story-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    min-width: 80px;
}

.story-ring {
    position: relative;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: linear-gradient(45deg, #f59e0b, #ef4444, #8b5cf6);
    padding: 3px;
    margin-bottom: 0.5rem;
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
    font-size: 0.75rem;
    text-align: center;
    color: #4b5563;
}

/* Modal Styles */
.story-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.story-modal-content {
    position: relative;
    width: 100%;
    max-width: 400px;
    height: 100vh;
    max-height: 600px;
    background: #1f2937;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.story-progress {
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    z-index: 10;
}

.progress-bar {
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: white;
    transition: width 0.1s linear;
}

.story-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    position: relative;
    z-index: 10;
}

.story-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.story-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.story-author {
    color: white;
    font-weight: 500;
    font-size: 0.875rem;
}

.close-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
}

.close-button:hover {
    background: rgba(255, 255, 255, 0.3);
}

.story-content {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
}

.main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.audio-controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
}

.audio-button {
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
}

.audio-button:hover {
    background: rgba(0, 0, 0, 0.7);
}

.story-footer {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    padding: 1rem;
    color: white;
}

.story-description p {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    line-height: 1.4;
}

.external-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: #60a5fa;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
}

.external-link:hover {
    text-decoration: underline;
}

.story-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
}

.action-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    color: white;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.action-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

.action-button.like.active {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
}

.action-button.like.active .filled {
    fill: #ef4444;
    color: #ef4444;
}

.action-button.want {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
}

.action-button.want:hover {
    background: rgba(34, 197, 94, 0.2);
}

.action-button.share {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
}

.action-button.share:hover {
    background: rgba(59, 130, 246, 0.2);
}

.action-button.product {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.3);
}

.action-button.product:hover {
    background: rgba(245, 158, 11, 0.2);
}

.nav-story {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
}

.nav-story:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%) scale(1.1);
}

.nav-story.prev {
    left: 1rem;
}

.nav-story.next {
    right: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .stories-section {
        padding: 0 0.5rem;
    }

    .story-modal-content {
        width: 100vw;
        height: 100vh;
        max-width: none;
        max-height: none;
        border-radius: 0;
    }

    .story-actions {
        gap: 0.5rem;
    }

    .action-button {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
    }

    .nav-story {
        width: 40px;
        height: 40px;
    }

    .nav-story.prev {
        left: 0.5rem;
    }

    .nav-story.next {
        right: 0.5rem;
    }
}

/* Animaciones */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.story-modal-content {
    animation: fadeIn 0.3s ease-out;
}

/* Loading state */
.stories-list.loading {
    opacity: 0.6;
}

.story-item.loading {
    opacity: 0.5;
    pointer-events: none;
}

/* Accesibilidad */
.nav-button:focus,
.action-button:focus,
.close-button:focus,
.audio-button:focus,
.nav-story:focus {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
}

/* Dark mode compatibility */
.dark .stories-title {
    color: #f9fafb;
}

.dark .story-title {
    color: #d1d5db;
}

.dark .nav-button {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
}

.dark .nav-button:hover:not(:disabled) {
    background: #4b5563;
}
</style>