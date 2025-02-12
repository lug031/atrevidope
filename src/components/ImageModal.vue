# Actualizar el ImageModal.vue:

<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-container">
            <button @click="$emit('close')" class="close-button">
                <XIcon :size="24" />
            </button>

            <div class="modal-content">
                <div class="image-container">
                    <img :src="imageUrl" :alt="productName" class="product-image" />
                </div>
                <div class="product-info">
                    <h3 class="product-title">{{ productName }}</h3>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'

defineProps<{
    show: boolean
    imageUrl: string
    productName: string
}>()

defineEmits<{
    (e: 'close'): void
}>()
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
    animation: fadeIn 0.2s ease-out;
}

.modal-container {
    position: relative;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-width: 90vw;
    width: auto;
    max-height: 90vh;
    margin: auto;
    animation: scaleIn 0.3s ease-out;
}

.modal-content {
    padding: 1.5rem;
}

.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    max-height: 70vh;
    overflow: hidden;
}

.product-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border-radius: 0.375rem;
}

.product-info {
    margin-top: 1rem;
    text-align: center;
}

.product-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
}

.close-button {
    position: absolute;
    top: -1rem;
    right: -1rem;
    background-color: white;
    border-radius: 50%;
    padding: 0.5rem;
    cursor: pointer;
    border: 2px solid #e5e7eb;
    color: #6b7280;
    transition: all 0.2s ease;
    z-index: 51;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.close-button:hover {
    background-color: #f3f4f6;
    color: #1f2937;
    transform: scale(1.05);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes scaleIn {
    from {
        transform: scale(0.95);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* Estilos para dispositivos móviles */
@media (max-width: 640px) {
    .modal-container {
        width: 95vw;
        margin: 1rem;
    }

    .close-button {
        top: 0.5rem;
        right: 0.5rem;
    }
}
</style>