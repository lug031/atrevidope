<template>
    <div class="categories-page">
        <div class="header-actions">
            <div class="search-filter">
                <div class="search-box">
                    <SearchIcon :size="20" class="search-icon" />
                    <input type="text" placeholder="Buscar categorías..." class="search-input" v-model="searchQuery" />
                </div>
                <button class="primary-button" @click="showCreateModal = true">
                    <PlusIcon :size="20" />
                    Nueva Categoría
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading-state">
            <Loader2Icon :size="40" class="animate-spin" />
            <p>Cargando categorías...</p>
        </div>

        <div v-else-if="error" class="error-state">
            <AlertCircleIcon :size="40" class="text-red-500" />
            <p>{{ error }}</p>
            <button @click="loadCategories" class="retry-button">
                <RefreshCwIcon :size="20" />
                Intentar de nuevo
            </button>
        </div>

        <div v-else>
            <div class="table-container">
                <table class="categories-table">
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th>Descripción</th>
                            <!-- <th>Productos</th>-->
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="category in filteredCategories" :key="category.id">
                            <td>
                                <div class="category-info">
                                    <span class="category-name">{{ category.name }}</span>
                                </div>
                            </td>
                            <td>{{ category.description }}</td>
                            <!-- <td>{{ category.products?.length || 0 }}</td>-->
                            <td>
                                <span :class="['status-badge', category.active ? 'active' : 'inactive']">
                                    {{ category.active ? 'Activa' : 'Inactiva' }}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="icon-button edit" @click="handleEdit(category)" title="Editar">
                                        <EditIcon :size="18" />
                                    </button>
                                    <button class="icon-button delete" @click="handleDelete(category.id)"
                                        title="Eliminar">
                                        <Trash2Icon :size="18" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal para crear/editar categoría -->
        <Modal v-if="showCreateModal" :title="editingId ? 'Editar Categoría' : 'Nueva Categoría'"
            @close="handleCloseModal">
            <form @submit.prevent="handleSubmit" class="category-form">
                <div class="form-group">
                    <label for="name">Nombre</label>
                    <input id="name" v-model="formData.name" type="text" class="form-input" required />
                </div>

                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" v-model="formData.description" class="form-input" required />
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="formData.active" />
                        Categoría activa
                    </label>
                </div>

                <div class="modal-footer">
                    <button type="button" class="secondary-button" @click="handleCloseModal">
                        Cancelar
                    </button>
                    <button type="submit" class="primary-button" :disabled="loading">
                        {{ editingId ? 'Actualizar' : 'Crear' }}
                    </button>
                </div>
            </form>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
    SearchIcon,
    PlusIcon,
    EditIcon,
    Trash2Icon,
    Loader2Icon,
    AlertCircleIcon,
    RefreshCwIcon
} from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import { useCategories } from '@/composables/useCategories'
import type { Category } from '@/types/category.types'

const {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = useCategories()

const showCreateModal = ref(false)
const searchQuery = ref('')

const filteredCategories = computed(() => {
    if (!searchQuery.value) return categories.value

    const query = searchQuery.value.toLowerCase()
    return categories.value.filter(category =>
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query)
    )
})

const initialFormData = {
    name: '',
    description: '',
    active: true
}

const formData = ref({ ...initialFormData })
const editingId = ref<string | null>(null)

const resetForm = () => {
    formData.value = { ...initialFormData }
    editingId.value = null
}

const handleCloseModal = () => {
    showCreateModal.value = false
    resetForm()
}

const handleSubmit = async () => {
    try {
        if (editingId.value) {
            await updateCategory(editingId.value, formData.value)
        } else {
            await createCategory(formData.value)
        }
        handleCloseModal()
    } catch (error) {
        console.error('Error:', error)
    }
}

const handleEdit = (category: Category) => {
    formData.value = {
        name: category.name,
        description: category.description,
        active: category.active
    }
    editingId.value = category.id
    showCreateModal.value = true
}

const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
        try {
            await deleteCategory(id)
        } catch (error) {
            console.error('Error:', error)
        }
    }
}

onMounted(loadCategories)
</script>

<style scoped>
.categories-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    width: 100%;
}

.search-filter {
    display: flex;
    gap: 1rem;
    align-items: center;
    width: 100%;
}

.search-box {
    position: relative;
    flex: 1;
    min-width: 0;
}

.search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
}

.search-input {
    width: 100%;
    padding: 0.5rem 1rem 0.5rem 2.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
}

@media (max-width: 768px) {
    .search-filter {
        flex-direction: column;
        width: 100%;
        gap: 0.5rem;
    }

    .search-box {
        width: 100%;
    }

    .primary-button {
        width: 100%;
        justify-content: center;
    }
}

.table-container {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
    width: 100%;
    -webkit-overflow-scrolling: touch;
}

.categories-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
}

.categories-table th,
.categories-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.categories-table th {
    background: #f8fafc;
    font-weight: 500;
    color: #64748b;
}

.category-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.category-image {
    width: 40px;
    height: 40px;
    border-radius: 0.25rem;
    object-fit: cover;
}

.category-details {
    display: flex;
    flex-direction: column;
}

.category-name {
    font-weight: 500;
    color: #0f172a;
}

.category-description {
    font-size: 0.875rem;
    color: #64748b;
}

@media (max-width: 768px) {
    .search-filter {
        flex-direction: column;
        width: 100%;
        gap: 0.5rem;
    }

    .search-box {
        width: 100%;
    }

    .primary-button {
        width: 100%;
        justify-content: center;
    }

    .table-container {
        margin: 0 -1rem;
        width: calc(100% + 2rem);
        border-radius: 0;
    }

    .categories-table th,
    .categories-table td {
        padding: 0.75rem;
        white-space: nowrap;
    }

    .category-description {
        white-space: normal;
        max-width: 200px;
    }
}

.stock-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
}

.stock-badge.high {
    background: #dcfce7;
    color: #166534;
}

.stock-badge.medium {
    background: #fef9c3;
    color: #854d0e;
}

.stock-badge.low {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
}

.status-badge.active {
    background: #dbeafe;
    color: #1e40af;
}

.status-badge.inactive {
    background: #f1f5f9;
    color: #64748b;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.icon-button {
    padding: 0.5rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.icon-button.edit {
    color: #0ea5e9;
    background: #e0f2fe;
}

.icon-button.edit:hover {
    background: #bae6fd;
}

.icon-button.delete {
    color: #ef4444;
    background: #fee2e2;
}

.icon-button.delete:hover {
    background: #fecaca;
}

.primary-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.primary-button:hover {
    background: #1d4ed8;
}

.secondary-button {
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.secondary-button:hover {
    background: #e2e8f0;
}

/* Loading State */
.loading-state {
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

/* Error State */
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

.animate-spin {
    animation: spin 1s linear infinite;
}

.form-group {
    margin-bottom: 1rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}

.retry-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>