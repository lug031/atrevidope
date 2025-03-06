<!-- components/StockErrorModal.vue -->
<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h3>Productos sin Stock</h3>
                <button @click="close" class="close-button">
                    <XIcon :size="20" />
                </button>
            </div>

            <div class="modal-content">
                <div class="error-icon">
                    <AlertCircleIcon :size="40" class="text-red-500" />
                </div>

                <p class="error-message">No se puede completar la orden debido a insuficiente stock.</p>

                <div class="products-list">
                    <div v-for="product in invalidProducts" :key="product.id" class="product-item">
                        <div class="product-name">{{ product.name }}</div>
                        <div class="product-stock">
                            <div class="stock-row">
                                <span class="label">Solicitado:</span>
                                <span class="value requested">{{ product.requested }}</span>
                            </div>
                            <div class="stock-row">
                                <span class="label">Disponible:</span>
                                <span class="value available">{{ product.available }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button @click="close" class="button secondary">Cerrar</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AlertCircleIcon, XIcon } from 'lucide-vue-next';

interface InvalidProduct {
    id: string;
    name: string;
    requested: number;
    available: number;
    error?: string;
}

const props = defineProps < {
    show: boolean;
    invalidProducts: InvalidProduct[];
} > ();

const emit = defineEmits < {
    (e: 'close'): void;
  }> ();

const close = () => {
    emit('close');
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.modal-container {
    background-color: white;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.close-button {
    background: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 9999px;
    transition: all 0.2s;
}

.close-button:hover {
    background-color: #f3f4f6;
    color: #1f2937;
}

.modal-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.error-icon {
    margin-bottom: 1rem;
}

.error-message {
    font-size: 1rem;
    color: #1f2937;
    text-align: center;
    margin-bottom: 1.5rem;
}

.products-list {
    width: 100%;
    margin-bottom: 1rem;
}

.product-item {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    margin-bottom: 0.75rem;
    background-color: #f9fafb;
}

.product-item:last-child {
    margin-bottom: 0;
}

.product-name {
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.product-stock {
    font-size: 0.875rem;
}

.stock-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
}

.label {
    color: #6b7280;
}

.value {
    font-weight: 500;
}

.requested {
    color: #1f2937;
}

.available {
    color: #ef4444;
}

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
}

.button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.button.secondary {
    background-color: #f3f4f6;
    color: #1f2937;
    border: 1px solid #e5e7eb;
}

.button.secondary:hover {
    background-color: #e5e7eb;
}
</style>