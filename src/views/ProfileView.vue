<template>
    <MainLayout>
        <div class="profile-container">
            <div class="profile-header">
                <h1 class="page-title">Mi Perfil</h1>
                <!--<button v-if="!isEditing" @click="startEditing" class="edit-button">
                    <PencilIcon :size="20" />
                    Editar Perfil
                </button>-->
            </div>

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
                <form v-if="isEditing" @submit.prevent="handleSubmit" class="profile-form">
                    <div class="form-section">
                        <h2>Información Personal</h2>
                        <div class="form-group">
                            <label for="firstName">Nombre</label>
                            <input id="firstName" v-model="formData.name" type="text" class="form-input" required />
                        </div>

                        <div class="form-group">
                            <label for="email">Email</label>
                            <input id="email" :value="userEmail" type="email" class="form-input" disabled />
                            <span class="input-help">El email no se puede modificar</span>
                        </div>

                        <div class="form-group">
                            <label for="phone">Teléfono</label>
                            <input id="phone" v-model="formData.phone_number" type="tel" class="form-input" />
                        </div>
                    </div>

                    <div class="form-section">
                        <h2>Rol y Estado</h2>
                        <div class="info-item">
                            <span class="info-label">Rol de usuario</span>
                            <span class="role-badge" :class="{ 'admin': isAdmin }">
                                {{ isAdmin ? 'Administrador' : 'Usuario' }}
                            </span>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="cancel-button" @click="cancelEditing">
                            Cancelar
                        </button>
                        <button type="submit" class="save-button" :disabled="loading">
                            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
                        </button>
                    </div>
                </form>

                <div v-else class="profile-info">
                    <div class="info-section">
                        <h2>Información Personal</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Nombre de usuario</span>
                                <span class="info-value">{{ userName }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Email</span>
                                <span class="info-value">{{ userEmail }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Teléfono</span>
                                <span class="info-value">{{ userAttributes?.phone_number || 'No especificado' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Rol</span>
                                <span class="role-badge" :class="{ 'admin': isAdmin }">
                                    {{ isAdmin ? 'Administrador' : 'Usuario' }}
                                </span>
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
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'
import {
    PencilIcon,
    Loader2Icon,
    AlertCircleIcon,
    RefreshCwIcon
} from 'lucide-vue-next'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref<string | null>(null)
const isEditing = ref(false)

const formData = ref({
    name: authStore.userName || '',
    phone_number: authStore.userAttributes?.phone_number || ''
})

const { userName, userEmail, isAdmin, userAttributes } = authStore

const loadProfile = async () => {
    loading.value = true
    error.value = null
    try {
        await authStore.checkAuth()
        formData.value = {
            name: authStore.userName || '',
            phone_number: authStore.userAttributes?.phone_number || ''
        }
    } catch (err) {
        error.value = 'Error al cargar el perfil'
        console.error(err)
    } finally {
        loading.value = false
    }
}

const startEditing = () => {
    isEditing.value = true
}

const cancelEditing = () => {
    formData.value = {
        name: authStore.userName || '',
        phone_number: authStore.userAttributes?.phone_number || ''
    }
    isEditing.value = false
}

const handleSubmit = async () => {
    loading.value = true
    try {
        // TODO: Implementar actualización de atributos del usuario
        await new Promise(resolve => setTimeout(resolve, 1000))
        await loadProfile()
        isEditing.value = false
    } catch (error) {
        console.error('Error al actualizar el perfil:', error)
    } finally {
        loading.value = false
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

.input-help {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.25rem;
}

.role-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    background-color: #e2e8f0;
    color: #64748b;
}

.role-badge.admin {
    background-color: #fef3c7;
    color: #92400e;
}

.save-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>