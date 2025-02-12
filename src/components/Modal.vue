<template>
    <Transition name="modal">
        <div v-if="isOpen" class="modal-overlay" @click.self="showConfirmation">
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title">{{ title }}</h2>
                    <button class="close-button" @click="showConfirmation">
                        <XIcon :size="24" />
                    </button>
                </div>
                <div class="modal-content">
                    <slot></slot>
                </div>
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
                    <p class="confirmation-message">¿Estás seguro que deseas salir?</p>
                    <div class="confirmation-buttons">
                        <button class="button cancel-button" @click="showConfirmDialog = false">
                            Cancelar
                        </button>
                        <button class="button confirm-button" @click="handleClose">
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'
import { ref, watch } from 'vue'

const props = defineProps<{
    title: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const isOpen = ref(true)
const showConfirmDialog = ref(false)

const showConfirmation = () => {
    showConfirmDialog.value = true
}

const handleClose = () => {
    showConfirmDialog.value = false
    isOpen.value = false
    setTimeout(() => {
        emit('close')
    }, 300)
}

const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        showConfirmation()
    }
}

watch(isOpen, (newValue) => {
    if (newValue) {
        document.addEventListener('keydown', handleKeyDown)
    } else {
        document.removeEventListener('keydown', handleKeyDown)
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
    overflow-y: auto;
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

.close-button:hover {
    background-color: #f1f5f9;
    color: #0f172a;
}

.modal-content {
    padding: 1.5rem;
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

.cancel-button {
    background-color: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

.cancel-button:hover {
    background-color: #e2e8f0;
    color: #0f172a;
}

.confirm-button {
    background-color: #ef4444;
    color: white;
    border: none;
}

.confirm-button:hover {
    background-color: #dc2626;
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

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
    transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    transform: translateY(-50px);
}
</style>