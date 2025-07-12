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

        <!-- Stories List -->
        <div v-else-if="hasStories" class="stories-container">
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
</style>