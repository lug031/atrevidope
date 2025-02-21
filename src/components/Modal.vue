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
                <Transition 
                    enter-active-class="transition-opacity duration-200" 
                    enter-from-class="opacity-0"
                    enter-to-class="opacity-100" 
                    leave-active-class="transition-opacity duration-200"
                    leave-from-class="opacity-100" 
                    leave-to-class="opacity-0"
                >
                    <div v-if="loading" class="cart-loading-overlay">
                        <div class="loading-spinner"></div>
                        <span class="loading-text">{{ loadingText || 'Cargando...' }}</span>
                    </div>
                </Transition>
            </div>
        </div>
    </Transition>

    <!-- Confirmation Modal -->
    <Transition name="modal">
        <div v-if="showConfirmDialog" class="modal-overlay confirmation-overlay">
            <div class="modal-container confirmation-container">
                <div class="modal-header">
                    <h2 class="modal-title">Confirmar salida</h2>
                </div>
                <div class="modal-content">
                    <p class="confirmation-message">
                        ¿Estás seguro que deseas salir?
                    </p>
                    <div class="confirmation-buttons">
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
import { XIcon, Loader2Icon } from 'lucide-vue-next'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
    title: string
    loading?: boolean
    loadingText?: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const isOpen = ref(true)
const showConfirmDialog = ref(false)

const handleOverlayClick = () => {
    if (!props.loading) {
        showConfirmation()
    }
}

const showConfirmation = () => {
    if (!props.loading) {
        showConfirmDialog.value = true
    }
}

const handleClose = () => {
    if (!props.loading) {
        showConfirmDialog.value = false
        isOpen.value = false
        setTimeout(() => {
            emit('close')
        }, 300)
    }
}

const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !props.loading) {
        showConfirmation()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown)
})

watch(isOpen, (newValue) => {
    if (newValue) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
    }
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

.confirmation-overlay {
    z-index: 1001;
}

.modal-container {
    background: white;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    position: relative;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    display: flex;
    flex-direction: column;
}

/* Loading Overlay - Nuevo estilo que coincide con el cart-loading-overlay */
.cart-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
}

.loading-text {
    color: #666;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.modal-container.is-loading {
    pointer-events: none;
}

.confirmation-container {
    max-width: 400px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    background-color: white;
    position: sticky;
    top: 0;
    z-index: 1;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
}

.close-button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    transition: all 0.2s;
}

.close-button:not(:disabled):hover {
    background-color: #f1f5f9;
    color: #0f172a;
}

.close-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-content {
    padding: 1.5rem;
    overflow-y: auto;
    position: relative;
    flex: 1;
}

/* Loading Overlay */
.loading-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1010;
}

.loader-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    background-color: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    z-index: 1011;
}

.loading-text {
    color: #0f172a;
    font-size: 0.875rem;
    font-weight: 500;
}

.confirmation-message {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #0f172a;
}

.confirmation-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

/* Animations */
.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
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
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

/* Scrollbar Styles */
.modal-container {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

.modal-container::-webkit-scrollbar {
    width: 8px;
}

.modal-container::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.modal-container::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 4px;
    border: 2px solid #f1f5f9;
}

@media (max-width: 640px) {
    .modal-container {
        width: 95%;
        max-height: 95vh;
    }

    .modal-header {
        padding: 0.75rem 1rem;
    }

    .modal-content {
        padding: 1rem;
    }
}
</style>