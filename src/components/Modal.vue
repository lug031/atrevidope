<template>
    <Transition name="modal">
        <div v-if="isOpen" class="modal-overlay" @click.self="handleOverlayClick">
            <div class="modal-container" :class="{ 'is-loading': loading }">
                <div class="modal-header">
                    <h2 class="modal-title">{{ title }}</h2>
                    <button class="close-button" @click="handleOverlayClick" :disabled="loading">
                        <XIcon :size="24" />
                    </button>
                </div>
                <div class="modal-content">
                    <slot></slot>
                </div>

                <!-- Loading Overlay -->
                <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
                    enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="loading" class="loading-overlay">
                        <div class="loading-spinner">
                            <Loader2Icon :size="40" class="animate-spin" />
                        </div>
                        <span class="loading-text">{{ loadingText || 'Procesando...' }}</span>
                    </div>
                </Transition>
            </div>
        </div>
    </Transition>

    <!-- Confirmation Dialog -->
    <Transition name="modal">
        <div v-if="showConfirmDialog" class="modal-overlay confirmation-overlay">
            <div class="confirmation-container">
                <div class="confirmation-header">
                    <h3 class="confirmation-title">Confirmar salida</h3>
                </div>
                <div class="confirmation-content">
                    <p class="confirmation-message">
                        ¿Estás seguro que deseas salir?
                    </p>
                    <div class="confirmation-actions">
                        <button class="button cancel-button" @click="showConfirmDialog = false" :disabled="loading">
                            Cancelar
                        </button>
                        <button class="button confirm-button" @click="handleClose" :disabled="loading">
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { XIcon, Loader2Icon } from 'lucide-vue-next'

const props = defineProps<{
    title: string
    loading?: boolean
    loadingText?: string
    preventClose?: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const isOpen = ref(true)
const showConfirmDialog = ref(false)

const handleOverlayClick = () => {
    if (!props.loading && !props.preventClose) {
        showConfirmation()
    }
}

const showConfirmation = () => {
    if (!props.loading && !props.preventClose) {
        showConfirmDialog.value = true
    }
}

const handleClose = () => {
    if (!props.loading && !props.preventClose) {
        showConfirmDialog.value = false
        isOpen.value = false
        setTimeout(() => {
            emit('close')
        }, 300)
    }
}

const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !props.loading && !props.preventClose) {
        showConfirmation()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    background: white;
    border-radius: 0.75rem;
    width: 95%;
    max-width: 900px;
    min-height: 200px;
    max-height: 90vh;
    overflow: hidden;
    position: relative;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    display: flex;
    flex-direction: column;
    transform: translateY(0);
    transition: transform 0.3s ease;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    background-color: white;
    position: sticky;
    top: 0;
    z-index: 10;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
}

.close-button {
    background: none;
    border: none;
    padding: 0.5rem;
    margin: -0.5rem;
    cursor: pointer;
    color: #64748b;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-button:hover:not(:disabled) {
    background-color: #f1f5f9;
    color: #0f172a;
}

.close-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-content {
    padding: 1.5rem 2rem;
    overflow-y: auto;
    flex: 1;
}

/* Loading Overlay */
.loading-overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    z-index: 20;
}

.loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #3b82f6;
}

.loading-text {
    color: #1e293b;
    font-size: 1rem;
    font-weight: 500;
}

/* Confirmation Dialog */
.confirmation-overlay {
    z-index: 1100;
}

.confirmation-container {
    background: white;
    border-radius: 0.75rem;
    width: 95%;
    max-width: 400px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

.confirmation-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.confirmation-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
}

.confirmation-content {
    padding: 1.5rem;
}

.confirmation-message {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #0f172a;
}

.confirmation-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

/* Buttons */
.button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 5rem;
}

.button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.button.primary {
    background-color: #3b82f6;
    color: white;
    border: none;
}

.button.primary:hover:not(:disabled) {
    background-color: #2563eb;
}

.button.secondary {
    background-color: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
}

.button.secondary:hover:not(:disabled) {
    background-color: #e2e8f0;
    color: #1e293b;
}

.cancel-button {
    background-color: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

.cancel-button:not(:disabled):hover {
    background-color: #e2e8f0;
    color: #0f172a;
}

.confirm-button {
    background-color: #ef4444;
    color: white;
    border: none;
}

.confirm-button:not(:disabled):hover {
    background-color: #dc2626;
}

/* Form Grid Layout */
:deep(.form-grid) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}

:deep(.form-group) {
    margin-bottom: 1rem;
}

:deep(.form-group.full-width) {
    grid-column: 1 / -1;
}

:deep(.form-label) {
    display: block;
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

:deep(.form-input) {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    background-color: white;
    color: #0f172a;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

:deep(.form-input:focus) {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.form-input:disabled) {
    background-color: #f8fafc;
    cursor: not-allowed;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    transform: translateY(-30px);
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

/* Scrollbar Styles */
.modal-content {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f8fafc;
}

.modal-content::-webkit-scrollbar {
    width: 6px;
}

.modal-content::-webkit-scrollbar-track {
    background: #f8fafc;
}

.modal-content::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 3px;
}

/* Responsive Design */
@media (max-width: 768px) {
    .modal-container {
        width: 100%;
        height: 100%;
        max-height: none;
        border-radius: 0;
    }

    .modal-content {
        padding: 1rem 1.25rem;
    }

    :deep(.form-grid) {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .modal-header {
        padding: 1rem 1.25rem;
    }

    .modal-title {
        font-size: 1.25rem;
    }
}
</style>