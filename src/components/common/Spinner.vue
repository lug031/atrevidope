<template>
    <div class="spinner" :class="[size, { overlay }]" :style="{ '--spinner-color': color }">
        <div class="spinner-circle"></div>
        <span v-if="text" class="spinner-text">{{ text }}</span>
    </div>
</template>

<script setup lang="ts">
interface SpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    text?: string;
    overlay?: boolean;
}

withDefaults(defineProps<SpinnerProps>(), {
    size: 'medium',
    color: '#000000',
    text: '',
    overlay: false
});
</script>

<style scoped>
.spinner {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.spinner.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
}

.spinner-circle {
    border-style: solid;
    border-radius: 50%;
    border-color: var(--spinner-color) transparent var(--spinner-color) transparent;
    animation: spin 1s linear infinite;
}

/* Tamaños del spinner */
.small .spinner-circle {
    width: 1.5rem;
    height: 1.5rem;
    border-width: 2px;
}

.medium .spinner-circle {
    width: 2.5rem;
    height: 2.5rem;
    border-width: 3px;
}

.large .spinner-circle {
    width: 3.5rem;
    height: 3.5rem;
    border-width: 4px;
}

.spinner-text {
    color: var(--spinner-color);
    font-size: 0.875rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>