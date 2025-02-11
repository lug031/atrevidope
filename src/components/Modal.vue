<template>
    <Transition name="modal">
        <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title">{{ title }}</h2>
                    <button class="close-button" @click="handleClose">
                        <XIcon :size="24" />
                    </button>
                </div>
                <div class="modal-content">
                    <slot></slot>
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

const handleClose = () => {
    isOpen.value = false
    setTimeout(() => {
        emit('close')
    }, 300)
}

// Manejar la tecla Escape
const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        handleClose()
    }
}

// Agregar y remover el event listener
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

.modal-container {
    background: white;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
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

/* Animaciones */
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