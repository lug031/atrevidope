<template>
    <div class="products-page">
        <!-- Header y búsqueda sin cambios -->
        <div class="header-actions">
            <div class="search-filter">
                <div class="search-box">
                    <SearchIcon :size="20" class="search-icon" />
                    <input type="text" placeholder="Buscar productos..." class="search-input" v-model="searchQuery" />
                </div>
                <button class="primary-button" @click="showCreateModal = true">
                    <PlusIcon :size="20" />
                    Nuevo Producto
                </button>
            </div>
        </div>

        <!-- Estados de loading y error sin cambios -->
        <div v-if="loading" class="loading-state">
            <Loader2Icon :size="40" class="animate-spin" />
            <p>Cargando productos...</p>
        </div>

        <div v-else-if="error" class="error-state">
            <AlertCircleIcon :size="40" class="text-red-500" />
            <p>{{ error }}</p>
            <button @click="loadProducts" class="retry-button">
                <RefreshCwIcon :size="20" />
                Intentar de nuevo
            </button>
        </div>

        <div v-else>
            <!-- Tabla actualizada -->
            <div class="table-container">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Marca</th>
                            <th>Precio Original</th>
                            <th>Descuento</th>
                            <th>Precio Final</th>
                            <th>Stock</th>
                            <th>Promoción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="product in filteredProducts" :key="product.id">
                            <td>
                                <div class="product-info">
                                    <img :src="imageUrls[product.id] || '/api/placeholder/40/40'"
                                        class="product-image" />
                                    <div class="product-details">
                                        <span class="product-name">{{ product.name }}</span>
                                        <span class="product-description">{{ product.description }}</span>
                                    </div>
                                </div>
                            </td>
                            <td>{{ product.brand }}</td>
                            <td>S/{{ product.originalPrice?.toFixed(2) || '0.00' }}</td>
                            <td>
                                <span :class="['discount-badge', product.discountPercentage > 0 ? 'active' : '']">
                                    {{ product.discountPercentage }}%
                                </span>
                            </td>
                            <td>S/{{ product.price.toFixed(2) }}</td>
                            <td>
                                <span :class="['stock-badge', getStockClass(product.stock)]">
                                    {{ product.stock }}
                                </span>
                            </td>
                            <td>
                                <span :class="['promotion-badge', isPromotionActive(product) ? 'active' : '']">
                                    {{ getPromotionStatus(product) }}
                                </span>
                            </td>
                            <td>
                                <span :class="['status-badge', product.active ? 'active' : 'inactive']">
                                    {{ product.active ? 'Activo' : 'Inactivo' }}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="icon-button edit" @click="handleEdit(product)" title="Editar">
                                        <EditIcon :size="18" />
                                    </button>
                                    <button class="icon-button delete" @click="handleDelete(product.id)"
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

        <!-- Modal actualizado -->
        <Modal v-if="showCreateModal" :title="editingId ? 'Editar Producto' : 'Nuevo Producto'"
            @close="handleCloseModal">
            <form @submit.prevent="handleSubmit" class="product-form">
                <!-- Campos básicos -->
                <div class="form-group">
                    <label for="name">Nombre</label>
                    <input id="name" v-model="formData.name" type="text" class="form-input" required />
                </div>

                <div class="form-group">
                    <label for="brand">Marca</label>
                    <input id="brand" v-model="formData.brand" type="text" class="form-input" required />
                </div>

                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" v-model="formData.description" class="form-input" required />
                </div>

                <!-- Campos de precios y promoción -->
                <div class="form-row">
                    <div class="form-group">
                        <label for="originalPrice">Precio Original</label>
                        <input id="originalPrice" v-model.number="formData.originalPrice" type="number" step="0.01"
                            class="form-input" required />
                    </div>

                    <div class="form-group">
                        <label for="discountPercentage">Descuento (%)</label>
                        <input id="discountPercentage" v-model.number="formData.discountPercentage" type="number"
                            min="0" max="100" class="form-input" :disabled="!formData.isPromoted" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="price">Precio Final</label>
                        <input id="price" v-model.number="formData.price" type="number" step="0.01" class="form-input"
                            required />
                    </div>

                    <div class="form-group">
                        <label for="stock">Stock</label>
                        <input id="stock" v-model.number="formData.stock" type="number" class="form-input" required />
                    </div>
                </div>

                <!-- Campos de promoción -->
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="formData.isPromoted" />
                        Aplicar promoción
                    </label>
                </div>

                <div v-if="formData.isPromoted" class="form-row">
                    <div class="form-group">
                        <label for="promotionStartDate">Inicio de promoción</label>
                        <input type="date" id="promotionStartDate" v-model="formData.promotionStartDate"
                            class="form-input" />
                    </div>

                    <div class="form-group">
                        <label for="promotionEndDate">Fin de promoción</label>
                        <input type="date" id="promotionEndDate" v-model="formData.promotionEndDate"
                            class="form-input" />
                    </div>
                </div>

                <div v-if="formData.isPromoted" class="form-group">
                    <label for="promotionType">Tipo de promoción</label>
                    <select id="promotionType" v-model="formData.promotionType" class="form-input">
                        <option value="discount">Descuento porcentual</option>
                        <option value="special">Oferta especial</option>
                        <option value="clearance">Liquidación</option>
                    </select>
                </div>

                <!-- Campo de categoría -->
                <div class="form-group">
                    <label for="category">Categoría</label>
                    <select id="category" v-model="formData.categoryID" class="form-input" required>
                        <option value="">Selecciona una categoría</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id"
                            :disabled="!category.active">
                            {{ category.name }}
                        </option>
                    </select>
                </div>

                <!-- Campo de imagen
                <div class="form-group">
                    <label for="imageUrl">URL de la imagen</label>
                    <input id="imageUrl" v-model="formData.imageUrl" type="text" class="form-input" />
                </div> -->

                <div class="form-group">
                    <label>Imagen del producto</label>
                    <div class="image-upload-container">
                        <input type="file" id="productImage" accept="image/*" @change="handleFileSelect"
                            class="file-input" hidden>
                        <label for="productImage" class="upload-button">
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
                        Producto activo
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
import { useProducts } from '@/composables/useProducts'
import { useCategories } from '@/composables/useCategories'
import type { Product } from '@/types/product.types'
import Modal from '@/components/Modal.vue'
import { uploadData, getUrl } from 'aws-amplify/storage';
const imageUrls = ref<Record<string, string>>({});

const loadImageUrls = async () => {
    for (const product of products.value) {
        if (product.imageUrl) {
            try {
                const { url } = await getUrl({ path: product.imageUrl });
                imageUrls.value[product.id] = url.toString();
            } catch (error) {
                console.error("Error cargando imagen:", error);
            }
        }
    }
};
const {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = useProducts()

const { categories, loadCategories } = useCategories()

const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const uploadProgress = ref(0)

const showCreateModal = ref(false)
const searchQuery = ref('')

const initialFormData = {
    name: '',
    brand: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    stock: 0,
    active: true,
    isPromoted: false,
    categoryID: '',
    imageUrl: '',
    promotionStartDate: '',
    promotionEndDate: '',
    promotionType: 'discount'
}

const formData = ref({ ...initialFormData })
const editingId = ref<string | null>(null)

watch([() => formData.value.originalPrice, () => formData.value.discountPercentage],
    ([newOriginalPrice, newDiscountPercentage]) => {
        if (formData.value.isPromoted && newOriginalPrice && newDiscountPercentage) {
            formData.value.price = newOriginalPrice * (1 - newDiscountPercentage / 100)
        } else {
            formData.value.price = newOriginalPrice
        }
    })

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
    const input = document.getElementById('productImage') as HTMLInputElement
    if (input) input.value = ''
}

const isPromotionActive = (product: Product): boolean => {
    if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
        return false;
    }

    const today = getCurrentPeruDate();

    return product.promotionStartDate <= today && today <= product.promotionEndDate;
};

const getCurrentPeruDate = (): string => {
  const date = new Date();
  const peruDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));
  
  const year = peruDate.getFullYear();
  const month = String(peruDate.getMonth() + 1).padStart(2, '0');
  const day = String(peruDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const formatDateToSpanish = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long'
    }).format(date);
};

const getPromotionStatus = (product: Product): string => {
    if (!product.isPromoted) return 'Sin promoción';
    if (!product.promotionStartDate || !product.promotionEndDate) return 'Sin fechas';

    const today = getCurrentPeruDate();

    if (product.promotionStartDate === product.promotionEndDate) {
        if (today === product.promotionStartDate) {
            return '¡Solo por hoy!';
        }
    }

    console.log(product.promotionEndDate)
    if (today < product.promotionStartDate) {
        return `Inicia el ${formatDateToSpanish(product.promotionStartDate)}`;
    }

    if (today > product.promotionEndDate) {
        return 'Promoción finalizada';
    }

    if (product.promotionStartDate === product.promotionEndDate) {
        return `Solo por el ${formatDateToSpanish(product.promotionStartDate)}`;
    }

    return `Válido del ${formatDateToSpanish(product.promotionStartDate)} al ${formatDateToSpanish(product.promotionEndDate)}`;
};

const uploadImage = async (): Promise<string> => {
    if (!selectedFile.value) return formData.value.imageUrl;

    try {
        const path = `products/${Date.now()}-${selectedFile.value.name.replace(/\s+/g, '-')}`;

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
};

const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value

    const query = searchQuery.value.toLowerCase()
    return products.value.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    )
})

const handleEdit = (product: Product) => {
    formData.value = {
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        active: product.active,
        isPromoted: product.isPromoted,
        categoryID: product.categoryID,
        imageUrl: product.imageUrl || '',
        promotionStartDate: product.promotionStartDate || '',
        promotionEndDate: product.promotionEndDate || '',
        promotionType: product.promotionType || 'discount'
    }
    editingId.value = product.id
    showCreateModal.value = true
}

const resetForm = () => {
    formData.value = { ...initialFormData }
    editingId.value = null
}

const handleCloseModal = () => {
    showCreateModal.value = false
    resetForm()
    clearImage()
}

const handleSubmit = async () => {
    try {
        const imageUrl = await uploadImage()

        const productData = {
            ...formData.value,
            imageUrl: imageUrl || formData.value.imageUrl
        }

        if (editingId.value) {
            await updateProduct(editingId.value, productData)
        } else {
            await createProduct(productData)
        }

        handleCloseModal()
    } catch (error) {
        console.error('Error:', error)
    }
}

const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        try {
            await deleteProduct(id)
        } catch (error) {
            console.error('Error:', error)
        }
    }
}

const getStockClass = (stock: number) => {
    if (stock > 20) return 'high'
    if (stock > 5) return 'medium'
    return 'low'
}

onMounted(async () => {
    await Promise.all([loadProducts(), loadCategories()])
})

watch(products, loadImageUrls, { immediate: true });

</script>

<style scoped>
.products-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
    width: 80px;
    height: 80px;
    border-radius: 0.375rem;
    overflow: hidden;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.clear-image-button {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.25rem;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    cursor: pointer;
}

.upload-status {
    font-size: 0.875rem;
    color: #64748b;
    margin-top: 0.25rem;
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

.products-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
}

.products-table th,
.products-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.products-table th {
    background: #f8fafc;
    font-weight: 500;
    color: #64748b;
}

.product-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.product-image {
    width: 40px;
    height: 40px;
    border-radius: 0.25rem;
    object-fit: cover;
}

.product-details {
    display: flex;
    flex-direction: column;
}

.product-name {
    font-weight: 500;
    color: #0f172a;
}

.product-description {
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

    .products-table th,
    .products-table td {
        padding: 0.75rem;
        white-space: nowrap;
    }

    .product-description {
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

.discount-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    background-color: #f0f0f0;
}

.discount-badge.active {
    background-color: #FF5722;
    color: white;
}

.promotion-badge {
    display: inline-flex;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    background-color: #e5e7eb;
    color: #374151;
}

.promotion-badge.active {
    background-color: #dcfce7;
    color: #166534;
}

.promotion-badge:not(.active) {
    background-color: #f3f4f6;
    color: #6b7280;
}
</style>