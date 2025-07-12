<template>
    <button @click="$emit('click')" class="stories-floating-btn" :class="{ 'has-stories': hasNewStories }"
        v-if="hasNewStories">
        <div class="stories-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <polygon points="10,8 16,12 10,16" fill="currentColor" />
            </svg>
        </div>
        <span class="stories-text">Historias</span>
        <div v-if="hasNewStories" class="stories-badge"></div>
    </button>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStories } from '@/composables/useStories'

defineEmits(['click'])

const { stories, loadActiveStories } = useStories()

// Detectar si hay historias disponibles
const hasNewStories = computed(() => stories.value.length > 0)

onMounted(async () => {
    // Cargar historias para saber si mostrar el botón
    await loadActiveStories()
})
</script>

<style scoped>
.stories-floating-btn {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    background: linear-gradient(45deg, #f59e0b, #ef4444, #8b5cf6);
    border: none;
    border-radius: 2rem;
    padding: 0.75rem 1.5rem;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    z-index: 1000;
    font-family: inherit;
}

.stories-floating-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.stories-floating-btn.has-stories {
    animation: pulse 2s infinite;
}

.stories-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.stories-text {
    font-weight: 600;
    font-size: 0.875rem;
}

.stories-badge {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    border: 2px solid white;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

@media (max-width: 768px) {
    .stories-floating-btn {
        bottom: 1rem;
        left: 1rem;
        padding: 1rem;
        border-radius: 50%;
        width: 60px;
        height: 60px;
    }

    .stories-text {
        display: none;
    }

    .stories-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        display: none;
    }
}
</style>