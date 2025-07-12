<!-- components/admin/StoryPreviewModal.vue -->
<template>
    <div class="preview-modal-overlay" @click="$emit('close')">
        <div class="preview-modal-content" @click.stop>
            <div class="preview-header">
                <h3>Vista Previa - {{ story.title }}</h3>
                <button @click="$emit('close')" class="close-button">
                    <XIcon :size="20" />
                </button>
            </div>

            <div class="preview-body">
                <!-- Story Preview Container -->
                <div class="story-preview-container">
                    <!-- Progress bar -->
                    <div class="story-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
                        </div>
                    </div>

                    <!-- Story Header -->
                    <div class="story-header">
                        <div class="story-info">
                            <img :src="storyImageUrl" :alt="story.title" class="story-avatar" />
                            <span class="story-author">{{ story.title }}</span>
                        </div>
                        <div class="story-controls">
                            <button @click="toggleAudio" v-if="story.audioUrl" class="audio-toggle">
                                <VolumeXIcon v-if="isMuted" :size="20" />
                                <Volume2Icon v-else :size="20" />
                            </button>
                            <button @click="togglePlayback" class="play-toggle">
                                <PauseIcon v-if="isPlaying" :size="20" />
                                <PlayIcon v-else :size="20" />
                            </button>
                        </div>
                    </div>

                    <!-- Story Content -->
                    <div class="story-content">
                        <img :src="storyImageUrl" :alt="story.title" class="story-main-image" />

                        <!-- Audio element -->
                        <audio v-if="story.audioUrl" ref="audioElement" :src="storyAudioUrl" @ended="onAudioEnded"
                            @loadedmetadata="setupAudio" preload="metadata"></audio>
                    </div>

                    <!-- Story Footer -->
                    <div class="story-footer">
                        <div class="story-description">
                            <p>{{ story.description }}</p>
                            <a v-if="story.externalLink" :href="story.externalLink" target="_blank"
                                class="external-link">
                                Ver más
                                <ExternalLinkIcon :size="16" />
                            </a>
                        </div>

                        <div class="story-actions-preview">
                            <div class="action-item">
                                <HeartIcon :size="20" />
                                <span>{{ story.likes || 0 }}</span>
                            </div>
                            <div class="action-item">
                                <EyeIcon :size="20" />
                                <span>{{ story.views || 0 }}</span>
                            </div>
                            <div class="action-item" v-if="story.product">
                                <ShoppingBagIcon :size="20" />
                                <span>Ver producto</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Story Details Panel -->
                <div class="details-panel">
                    <div class="detail-section">
                        <h4>Información General</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">ID:</span>
                                <span class="detail-value">{{ story.id.slice(-8) }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Duración:</span>
                                <span class="detail-value">{{ story.duration }}s</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Orden:</span>
                                <span class="detail-value">{{ story.order }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Estado:</span>
                                <span :class="['detail-value', 'status', story.active ? 'active' : 'inactive']">
                                    {{ story.active ? 'Activa' : 'Inactiva' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section" v-if="story.product">
                        <h4>Producto Relacionado</h4>
                        <div class="product-details">
                            <img :src="story.product.imageUrl || '/api/placeholder/60/60'" :alt="story.product.name"
                                class="product-image" />
                            <div class="product-info">
                                <span class="product-name">{{ story.product.name }}</span>
                                <span class="product-price">S/{{ story.product.price?.toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Estadísticas</h4>
                        <div class="stats-grid-small">
                            <div class="stat-item">
                                <EyeIcon :size="16" />
                                <span class="stat-label">Vistas</span>
                                <span class="stat-value">{{ story.views || 0 }}</span>
                            </div>
                            <div class="stat-item">
                                <HeartIcon :size="16" />
                                <span class="stat-label">Likes</span>
                                <span class="stat-value">{{ story.likes || 0 }}</span>
                            </div>
                            <div class="stat-item">
                                <ShoppingBagIcon :size="16" />
                                <span class="stat-label">Wants</span>
                                <span class="stat-value">{{ story.wants || 0 }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Archivos Multimedia</h4>
                        <div class="media-info">
                            <div class="media-item">
                                <ImageIcon :size="16" />
                                <span>Imagen: {{ story.imageUrl ? 'Cargada' : 'No disponible' }}</span>
                            </div>
                            <div class="media-item">
                                <Volume2Icon :size="16" />
                                <span>Audio: {{ story.audioUrl ? 'Cargado' : 'No disponible' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section" v-if="story.externalLink">
                        <h4>Enlace Externo</h4>
                        <a :href="story.externalLink" target="_blank" class="external-link-detail">
                            {{ truncateUrl(story.externalLink) }}
                            <ExternalLinkIcon :size="14" />
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

// Props
interface Props {
    story: Story
}

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
    // Cargar imagen
    if (props.story.imageUrl) {
        try {
            const { url } = await getUrl({ path: props.story.imageUrl })
            storyImageUrl.value = url.toString()
        } catch (error) {
            console.error('Error loading story image:', error)
            storyImageUrl.value = '/api/placeholder/300/400'
        }
    } else {
        storyImageUrl.value = '/api/placeholder/300/400'
    }

    // Cargar audio
    if (props.story.audioUrl) {
        try {
            const { url } = await getUrl({ path: props.story.audioUrl })
            storyAudioUrl.value = url.toString()
        } catch (error) {
            console.error('Error loading story audio:', error)
        }
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

// Lifecycle
onMounted(async () => {
    await loadStoryAssets()
    // Auto-start preview
    setTimeout(() => {
        startPreview()
    }, 500)
})

onUnmounted(() => {
    stopPreview()
})
</script>

<style scoped>
.preview-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.preview-modal-content {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 1000px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.preview-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #0f172a;
}

.close-button {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    color: #64748b;
    transition: all 0.2s;
}

.close-button:hover {
    background: #f1f5f9;
    color: #0f172a;
}

.preview-body {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
    overflow-y: auto;
}

/* Story Preview Container */
.story-preview-container {
    position: relative;
    background: #1f2937;
    border-radius: 12px;
    overflow: hidden;
    height: 600px;
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

.story-controls {
    display: flex;
    gap: 0.5rem;
}

.audio-toggle,
.play-toggle {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
}

.audio-toggle:hover,
.play-toggle:hover {
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

.story-main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

.story-actions-preview {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.action-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    color: white;
    font-size: 0.875rem;
}

/* Details Panel */
.details-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
}

.detail-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.detail-section h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.5rem;
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-label {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.detail-value {
    font-size: 0.875rem;
    color: #0f172a;
    font-weight: 500;
}

.detail-value.status.active {
    color: #16a34a;
}

.detail-value.status.inactive {
    color: #dc2626;
}

/* Product Details */
.product-details {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
}

.product-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 0.375rem;
    border: 1px solid #e2e8f0;
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.product-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #0f172a;
    line-height: 1.3;
}

.product-price {
    font-size: 0.875rem;
    color: #16a34a;
    font-weight: 600;
}

/* Stats Grid Small */
.stats-grid-small {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
}

.stat-label {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.stat-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: #0f172a;
}

/* Media Info */
.media-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.media-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #f8fafc;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #64748b;
}

/* External Link Detail */
.external-link-detail {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f1f5f9;
    border-radius: 0.5rem;
    color: #3b82f6;
    text-decoration: none;
    font-size: 0.875rem;
    word-break: break-all;
    border: 1px solid #e2e8f0;
}

.external-link-detail:hover {
    background: #e2e8f0;
    text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
    .preview-modal-overlay {
        padding: 0;
    }

    .preview-modal-content {
        width: 100vw;
        height: 100vh;
        max-width: none;
        max-height: none;
        border-radius: 0;
    }

    .preview-body {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
    }

    .story-preview-container {
        height: 400px;
    }

    .detail-grid {
        grid-template-columns: 1fr;
    }

    .stats-grid-small {
        grid-template-columns: 1fr;
    }

    .story-actions-preview {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .action-item {
        padding: 0.375rem 0.75rem;
        font-size: 0.8rem;
    }
}

/* Animations */
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

.preview-modal-content {
    animation: fadeIn 0.3s ease-out;
}

/* Scrollbar personalizado para el panel de detalles */
.details-panel::-webkit-scrollbar {
    width: 6px;
}

.details-panel::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.details-panel::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.details-panel::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* Estados de carga */
.loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* Focus states para accesibilidad */
.close-button:focus,
.audio-toggle:focus,
.play-toggle:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

/* Dark mode compatibility */
@media (prefers-color-scheme: dark) {
    .preview-modal-content {
        background: #1f2937;
        color: #f9fafb;
    }

    .preview-header {
        border-bottom-color: #374151;
    }

    .preview-header h3 {
        color: #f9fafb;
    }

    .close-button {
        color: #9ca3af;
    }

    .close-button:hover {
        background: #374151;
        color: #f9fafb;
    }

    .detail-section h4 {
        color: #f9fafb;
        border-bottom-color: #374151;
    }

    .detail-value {
        color: #f9fafb;
    }

    .detail-label {
        color: #9ca3af;
    }

    .product-details,
    .stat-item,
    .media-item {
        background: #374151;
        border-color: #4b5563;
    }

    .external-link-detail {
        background: #374151;
        border-color: #4b5563;
    }

    .external-link-detail:hover {
        background: #4b5563;
    }
}
</style>