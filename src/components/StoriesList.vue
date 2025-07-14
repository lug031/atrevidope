<template>
    <div class="stories-list-container">
        <div class="stories-header">
            <h3 class="stories-title">Historias</h3>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="loading" class="stories-skeleton">
            <div v-for="i in 5" :key="i" class="skeleton-item">
                <div class="skeleton-ring"></div>
                <div class="skeleton-info">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-description"></div>
                </div>
            </div>
        </div>

        <!-- No Stories Available Message -->
        <div v-else-if="!hasStories" class="no-stories-container">
            <div class="no-stories-content">
                <!-- Ícono de historias vacías -->
                <div class="no-stories-icon">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
                        </path>
                    </svg>
                </div>
                <h4 class="no-stories-title">No hay historias disponibles</h4>
                <p class="no-stories-description">Las historias aparecerán aquí cuando estén disponibles</p>

                <!-- Botón de cerrar -->
                <button @click="closeModal" class="close-modal-button">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                    Cerrar
                </button>
            </div>
        </div>

        <!-- Stories List -->
        <div v-else class="stories-container">
            <div class="stories-list">
                <div v-for="story in stories" :key="story.id" class="story-item" @click="selectStory(story)">
                    <div class="story-ring">
                        <img :src="getStoryImage(story)" :alt="story.title" class="story-image" />
                        <div class="story-overlay">
                            <PlayIcon :size="20" class="play-icon" />
                        </div>
                    </div>
                    <div class="story-info">
                        <h4 class="story-title">{{ story.title }}</h4>
                        <p class="story-description">{{ story.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PlayIcon } from 'lucide-vue-next'
import { useStories } from '@/composables/useStories'
import { useStoryImageCache } from '@/composables/useStoryImageCache'
import type { Story } from '@/types/story.types'

const emit = defineEmits<{
    storySelected: [story: Story]
    close: [] // NUEVO: Emit para cerrar el modal
}>()

const { stories, loading, loadActiveStories } = useStories()
const { getCachedStoryImage, preloadStoryImages } = useStoryImageCache()

// Referencias
// Estado
const hasStories = computed(() => stories.value.length > 0)

const getStoryImage = (story: Story): string => {
    return getCachedStoryImage(story.id)
}

const selectStory = (story: Story) => {
    emit('storySelected', story)
}

// NUEVO: Función para cerrar el modal
const closeModal = () => {
    emit('close')
}

const loadStoryAssets = async () => {
    await preloadStoryImages(stories.value)
}

// Lifecycle
onMounted(async () => {
    await loadActiveStories()
    await loadStoryAssets()
})
</script>

<style scoped>
.stories-list-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.stories-header {
    display: none;
}

.stories-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
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
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #e5e7eb transparent;
    padding: 1rem;
}

.stories-container::-webkit-scrollbar {
    width: 6px;
}

.stories-container::-webkit-scrollbar-track {
    background: transparent;
}

.stories-container::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 3px;
}

.stories-container::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
}

.stories-skeleton {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
}

.skeleton-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    border: 1px solid #f3f4f6;
}

.skeleton-ring {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 2s infinite;
    flex-shrink: 0;
}

.skeleton-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.skeleton-title {
    width: 70%;
    height: 16px;
    border-radius: 4px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 2s infinite;
}

.skeleton-description {
    width: 90%;
    height: 12px;
    border-radius: 4px;
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

.stories-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0;
}

.story-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    padding: 0.75rem;
    border-radius: 0.75rem;
    transition: background 0.2s;
    border: 1px solid #f3f4f6;
}

.story-item:hover {
    background: #f9fafb;
}

.story-ring {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(45deg, #f59e0b, #ef4444, #8b5cf6);
    padding: 2px;
    flex-shrink: 0;
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

.story-info {
    flex: 1;
    min-width: 0;
}

.story-title {
    font-size: 0.95rem;
    font-weight: 500;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.story-description {
    font-size: 0.8rem;
    color: #6b7280;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.no-stories-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
}

.no-stories-content {
    text-align: center;
    max-width: 240px;
}

.no-stories-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.no-stories-title {
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
    margin: 0 0 0.5rem 0;
}

.no-stories-description {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.4;
    margin: 0 0 1.5rem 0;
    /* MODIFICADO: Agregado margin-bottom para el botón */
}

/* NUEVO: Estilos para el botón de cerrar */
.close-modal-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.close-modal-button:hover {
    background-color: #e5e7eb;
    border-color: #d1d5db;
    color: #1f2937;
}

.close-modal-button:active {
    transform: translateY(1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .no-stories-container {
        padding: 1.5rem 1rem;
    }

    .no-stories-content {
        max-width: 200px;
    }

    .no-stories-title {
        font-size: 0.9rem;
    }

    .no-stories-description {
        font-size: 0.8rem;
        margin-bottom: 1.25rem;
        /* MODIFICADO: Menos espacio en móvil */
    }

    .close-modal-button {
        padding: 0.625rem 1.25rem;
        font-size: 0.8rem;
    }
}
</style>