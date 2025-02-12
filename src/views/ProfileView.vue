<template>
    <MainLayout>
        <div class="profile-container">
            <!-- Cabecera -->
            <div class="profile-header">
                <h1 class="page-title">Mi Perfil</h1>
                <button v-if="!isEditing" @click="startEditing" class="edit-button">
                    <PencilIcon :size="20" />
                    Editar Perfil
                </button>
            </div>

            <!-- Estados de carga y error -->
            <div v-if="loading" class="loading-state">
                <Loader2Icon :size="40" class="animate-spin" />
                <p>Cargando perfil...</p>
            </div>

            <div v-else-if="error" class="error-state">
                <AlertCircleIcon :size="40" class="text-red-500" />
                <p>{{ error }}</p>
                <button @click="loadProfile" class="retry-button">
                    <RefreshCwIcon :size="20" />
                    Intentar de nuevo
                </button>
            </div>

            <div v-else>
                <!-- Formulario de edición -->
                <form v-if="isEditing" @submit.prevent="handleSubmit" class="profile-form">
                    <div class="form-section">
                        <h2>Información Personal</h2>
                        <div class="form-group">
                            <label for="firstName">Nombre</label>
                            <input id="firstName" v-model="formData.firstName" type="text" class="form-input"
                                required />
                        </div>

                        <div class="form-group">
                            <label for="lastName">Apellido</label>
                            <input id="lastName" v-model="formData.lastName" type="text" class="form-input" required />
                        </div>

                        <div class="form-group">
                            <label for="email">Email</label>
                            <input id="email" v-model="formData.email" type="email" class="form-input" required
                                disabled />
                        </div>

                        <div class="form-group">
                            <label for="phone">Teléfono</label>
                            <input id="phone" v-model="formData.phone" type="tel" class="form-input" />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="cancel-button" @click="cancelEditing">
                            Cancelar
                        </button>
                        <button type="submit" class="save-button">
                            Guardar Cambios
                        </button>
                    </div>
                </form>

                <!-- Vista de información -->
                <div v-else class="profile-info">
                    <div class="info-section">
                        <h2>Información Personal</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Nombre completo</span>
                                <span class="info-value">{{ formData.firstName }} {{ formData.lastName }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Email</span>
                                <span class="info-value">{{ formData.email }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Teléfono</span>
                                <span class="info-value">{{ formData.phone || 'No especificado' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import {
    PencilIcon,
    Loader2Icon,
    AlertCircleIcon,
    RefreshCwIcon
} from 'lucide-vue-next'

const loading = ref(false)
const error = ref<string | null>(null)
const isEditing = ref(false)

const formData = ref({
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '+52 123 456 7890'
})

const loadProfile = async () => {
    loading.value = true
    error.value = null
    try {
        await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
        error.value = 'Error al cargar el perfil'
    } finally {
        loading.value = false
    }
}

const startEditing = () => {
    isEditing.value = true
}

const cancelEditing = () => {
    isEditing.value = false
}

const handleSubmit = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        isEditing.value = false
    } catch (error) {
        console.error('Error:', error)
    }
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.page-title {
    font-size: 1.875rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
}

.profile-form,
.profile-info {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
}

.form-section,
.info-section {
    margin-bottom: 2rem;
}

h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
}

.form-input:disabled {
    background-color: #f1f5f9;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}

.edit-button,
.save-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
}

.cancel-button {
    padding: 0.5rem 1rem;
    background-color: #f1f5f9;
    color: #64748b;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
}

.info-grid {
    display: grid;
    gap: 1rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.info-label {
    font-size: 0.875rem;
    color: #64748b;
}

.info-value {
    color: #0f172a;
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    gap: 1rem;
}

.retry-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
}

@media (max-width: 640px) {
    .profile-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .form-actions {
        flex-direction: column-reverse;
    }

    .edit-button,
    .save-button,
    .cancel-button {
        width: 100%;
        justify-content: center;
    }
}
</style>