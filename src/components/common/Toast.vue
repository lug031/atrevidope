<template>
    <div class="toast-container" :class="position">
        <TransitionGroup name="toast">
            <div v-for="toast in toasts" :key="toast.id" class="toast" :class="[toast.type, position]"
                @click="removeToast(toast.id)">
                <div class="toast-content">
                    <span class="toast-icon" v-if="icons[toast.type]">
                        {{ icons[toast.type] }}
                    </span>
                    <span class="toast-message">{{ toast.message }}</span>
                </div>
                <button class="toast-close" @click.stop="removeToast(toast.id)">
                    ×
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useToast } from '@/composables/useToast';

const { toasts, removeToast } = useToast();

const position = computed(() =>
    toasts.value[0]?.position || 'top-right'
);

const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
};
</script>

<style scoped>
.toast-container {
    position: fixed;
    z-index: 9999;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: none;
}

.toast-container.top-right {
    top: 0;
    right: 0;
}

.toast-container.top-left {
    top: 0;
    left: 0;
}

.toast-container.bottom-right {
    bottom: 0;
    right: 0;
}

.toast-container.bottom-left {
    bottom: 0;
    left: 0;
}

.toast-container.top-center {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
}

.toast-container.bottom-center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}

.toast {
    min-width: 300px;
    max-width: 400px;
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
}

.toast-icon {
    font-size: 1.2rem;
}

.toast-message {
    font-size: 0.9rem;
    line-height: 1.4;
}

.toast-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0 0.5rem;
    color: currentColor;
    opacity: 0.6;
}

.toast-close:hover {
    opacity: 1;
}

/* Toast types */
.toast.success {
    background-color: #ecfdf5;
    color: #065f46;
    border-left: 4px solid #059669;
}

.toast.error {
    background-color: #fef2f2;
    color: #991b1b;
    border-left: 4px solid #dc2626;
}

.toast.warning {
    background-color: #fffbeb;
    color: #92400e;
    border-left: 4px solid #d97706;
}

.toast.info {
    background-color: #eff6ff;
    color: #1e40af;
    border-left: 4px solid #3b82f6;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
</style>