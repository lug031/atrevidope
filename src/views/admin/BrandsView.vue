<template>
    <div class="brands-page">
        <div class="header-actions">
            <div class="search-filter">
                <div class="search-box">
                    <SearchIcon :size="20" class="search-icon" />
                    <input type="text" placeholder="Buscar marcas..." class="search-input" v-model="searchQuery" />
                </div>
                <button class="primary-button" @click="showCreateModal = true">
                    <PlusIcon :size="20" />
                    Nueva Marca
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading-state">
            <Loader2Icon :size="40" class="animate-spin" />
            <p>Cargando marcas...</p>
        </div>

        <div v-else-if="error" class="error-state">
            <AlertCircleIcon :size="40" class="text-red-500" />
            <p>{{ error }}</p>
            <button @click="loadBrands" class="retry-button">
                <RefreshCwIcon :size="20" />
                Intentar de nuevo
            </button>
        </div>

        <div v-else>
            <div class="table-container">
                <table class="brands-table">
                    <thead>
                        <tr>
                            <th>Marca</th>
                            <th>Descripción</th>
                            <th>Productos</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="brand in filteredBrands" :key="brand.id">
                            <td>
                                <div class="brand-info">
                                    <img v-if="imageUrls[brand.id]"
                                        :src="imageUrls[brand.id] || '/api/placeholder/40/40'" class="brand-image"
                                        alt="Logo de la marca" />
                                    <span class="brand-name">{{ brand.name }}</span>
                                </div>
                            </td>
                            <td>{{ brand.description }}</td>
                            <td>
                                <span v-if="brandProductCounts[brand.id] !== undefined">
                                    {{ brandProductCounts[brand.id] }}
                                </span>
                                <span v-else class="loading-count">
                                    <Loader2Icon :size="16" class="animate-spin" />
                                </span>
                            </td>
                            <td>
                                <span :class="['status-badge', brand.active ? 'active' : 'inactive']">
                                    {{ brand.active ? 'Activa' : 'Inactiva' }}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="icon-button edit" @click="handleEdit(brand)" title="Editar">
                                        <EditIcon :size="18" />
                                    </button>
                                    <button class="icon-button delete" @click="handleDelete(brand.id)" title="Eliminar">
                                        <Trash2Icon :size="18" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal para crear/editar marca -->
        <Modal v-if="showCreateModal" :title="editingId ? 'Editar Marca' : 'Nueva Marca'" @close="handleCloseModal"
            :loading="isSubmitting">
            <form @submit.prevent="handleSubmit" class="brand-form">
                <div class="form-group">
                    <label for="name">Nombre</label>
                    <input id="name" v-model="formData.name" type="text" class="form-input" required />
                </div>

                <!-- <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" v-model="formData.description" class="form-input" required />
                </div>  -->

                <input type="hidden" v-model="formData.description" />

                <div class="form-group">
                    <label>Logo de la marca</label>
                    <div class="image-upload-container">
                        <input type="file" id="brandLogo" accept="image/*" @change="handleFileSelect" class="file-input"
                            hidden>
                        <label for="brandLogo" class="upload-button">
                            <UploadIcon :size="16" />
                            {{ selectedFile ? 'Cambiar imagen' : 'Seleccionar archivo' }}
                        </label>

                        <div v-if="imagePreview" class="image-preview">
                            <img :src="imagePreview" alt="Vista previa" class="preview-image" />
                            <button v-if="selectedFile" @click="clearImage" class="clear-image-button">
                                <XIcon :size="16" />
                            </button>
                        </div>
                    </div>
                    <p v-if="uploadProgress > 0" class="upload-status">
                        Subiendo: {{ uploadProgress }}%
                    </p>
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="formData.active" />
                        Marca activa
                    </label>
                </div>

                <div class="modal-footer">
                    <button type="button" class="secondary-button" @click="handleCloseModal" :disabled="isSubmitting">
                        Cancelar
                    </button>
                    <button type="submit" class="primary-button" :disabled="isSubmitting">
                        {{ editingId ? 'Actualizar' : 'Crear' }}
                    </button>
                </div>
            </form>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import {
    SearchIcon,
    PlusIcon,
    EditIcon,
    Trash2Icon,
    Loader2Icon,
    AlertCircleIcon,
    RefreshCwIcon,
    UploadIcon,
    XIcon
} from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import { useBrands } from '@/composables/useBrands'
import type { Brand } from '@/types/brand.types'
import { uploadData, getUrl } from 'aws-amplify/storage';
import { useToast } from '@/composables/useToast';

const {
    brands,
    loading,
    error,
    loadBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandProducts
} = useBrands()

const brandProductCounts = ref<Record<string, number>>({})

const loadProductCounts = async () => {
    for (const brand of brands.value) {
        try {
            const products = await getBrandProducts(brand.id)
            brandProductCounts.value[brand.id] = products.length
        } catch (error) {
            console.error(`Error cargando productos para marca ${brand.id}:`, error)
            brandProductCounts.value[brand.id] = 0
        }
    }
}

const showCreateModal = ref(false)
const searchQuery = ref('')

const filteredBrands = computed(() => {
    if (!searchQuery.value) return brands.value

    const query = searchQuery.value.toLowerCase()
    return brands.value.filter(brand =>
        brand.name.toLowerCase().includes(query) ||
        brand.description.toLowerCase().includes(query)
    )
})

const initialFormData = {
    name: '',
    description: '',
    logo: '',
    active: true
}

const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const uploadProgress = ref(0)
const imageUrls = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const { showToast } = useToast()

const formData = ref({ ...initialFormData })
const editingId = ref<string | null>(null)

const resetForm = () => {
    formData.value = { ...initialFormData }
    editingId.value = null
}

const handleCloseModal = () => {
    showCreateModal.value = false
    resetForm()
    clearImage()
}

const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files?.length) {
        selectedFile.value = input.files[0]
        imagePreview.value = URL.createObjectURL(input.files[0])
    }
}

const clearImage = () => {
    selectedFile.value = null
    imagePreview.value = null
    const input = document.getElementById('brandLogo') as HTMLInputElement
    if (input) input.value = ''
}

const uploadImage = async (): Promise<string> => {
    if (!selectedFile.value) return formData.value.logo;

    try {
        const path = `brands/${Date.now()}-${selectedFile.value.name.replace(/\s+/g, '-')}`;

        await uploadData({
            data: selectedFile.value,
            path: path,
            options: {
                contentType: selectedFile.value.type,
                onProgress: ({ transferredBytes, totalBytes }) => {
                    uploadProgress.value = totalBytes
                        ? Math.round((transferredBytes / totalBytes) * 100)
                        : 0;
                }
            }
        }).result;

        return path;
    } catch (error) {
        console.error("Error subiendo imagen:", error);
        throw error;
    }
}

const loadImageUrls = async () => {
    for (const brand of brands.value) {
        if (brand.logo) {
            try {
                const { url } = await getUrl({ path: brand.logo });
                imageUrls.value[brand.id] = url.toString();
            } catch (error) {
                console.error("Error cargando imagen:", error);
            }
        }
    }
}

const handleSubmit = async () => {
    try {
        isSubmitting.value = true;

        // Subir imagen si hay una seleccionada
        const logoPath = await uploadImage();

        const brandData: Omit<Brand, "id"> = {
            name: formData.value.name,
            description: formData.value.description,
            logo: logoPath || formData.value.logo,
            active: formData.value.active
        };

        if (editingId.value) {
            await updateBrand(editingId.value, brandData);
            showToast({
                type: 'success',
                message: 'Marca actualizada con éxito'
            });
        } else {
            await createBrand(brandData);
            showToast({
                type: 'success',
                message: 'Marca creada con éxito'
            });
        }
        handleCloseModal();

        // Recargar las URLs de imágenes para la nueva marca
        await loadImageUrls();
    } catch (error) {
        console.error('Error:', error);
        showToast({
            type: 'error',
            message: 'Error al guardar la marca'
        });
    } finally {
        isSubmitting.value = false;
    }
}

const handleEdit = (brand: Brand) => {
    formData.value = {
        name: brand.name,
        description: brand.description,
        logo: brand.logo,
        active: brand.active
    }

    // Si hay un logo, cargar vista previa
    if (brand.logo && imageUrls.value[brand.id]) {
        imagePreview.value = imageUrls.value[brand.id];
    } else {
        imagePreview.value = null;
    }

    editingId.value = brand.id
    showCreateModal.value = true
}

const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
        try {
            await deleteBrand(id)
            showToast({
                type: 'success',
                message: 'Marca eliminada con éxito'
            });
        } catch (error) {
            console.error('Error:', error)
            showToast({
                type: 'error',
                message: 'Error al eliminar la marca'
            });
        }
    }
}

onMounted(async () => {
    await loadBrands()
    await loadProductCounts()
    await loadImageUrls()
})

// Observar cambios en las marcas para actualizar imágenes
watch(brands, async () => {
    await loadImageUrls()
}, { immediate: true })

watch(() => formData.value.name, (nuevoValor) => {
    formData.value.description = nuevoValor;
});

// Recarga los conteos cuando filtras la tabla
const filteredBrandsChanged = watch(brands, async () => {
    await loadProductCounts()
})
</script>

<style scoped>
.brands-page {
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

.image-upload-container {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.upload-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.upload-button:hover {
    background: #e2e8f0;
}

.image-preview {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 0.375rem;
    overflow: hidden;
    background: #f8fafc;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.clear-image-button {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
}

.clear-image-button:hover {
    background: rgba(0, 0, 0, 0.7);
}

.upload-status {
    font-size: 0.875rem;
    color: #3b82f6;
}

.table-container {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
    width: 100%;
    -webkit-overflow-scrolling: touch;
}

.brands-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
}

.brands-table th,
.brands-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.brands-table th {
    background: #f8fafc;
    font-weight: 500;
    color: #64748b;
}

.brand-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.brand-image {
    width: 40px;
    height: 40px;
    border-radius: 0.25rem;
    object-fit: contain;
    background-color: #f8fafc;
}

.brand-name {
    font-weight: 500;
    color: #0f172a;
}

.input-help {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.25rem;
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

    .brands-table th,
    .brands-table td {
        padding: 0.75rem;
        white-space: nowrap;
    }
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

.loading-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
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