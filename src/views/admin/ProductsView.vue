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
                            <th>Carousel</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="product in filteredProducts" :key="product.id">
                            <td>
                                <div class="product-info">
                                    <img :src="imageUrls[product.id] || '/api/placeholder/40/40'"
                                        class="product-image cursor-pointer hover:opacity-80 transition-opacity"
                                        @click="handleImageClick(product)" />
                                    <div class="product-details">
                                        <span class="product-name">{{ product.name }}</span>
                                        <span class="product-description"
                                            v-html="truncateDescription(product.description)"></span>
                                    </div>
                                </div>
                            </td>
                            <td>{{ product.brand }}</td>
                            <td>S/{{ product.originalPrice?.toFixed(2) || '0.00' }}</td>
                            <td>
                                <span :class="['discount-badge', product.discountPercentage > 0 ? 'active' : '']">
                                    {{ getDisplayDiscount(product) > 0 ? formatDiscount(product) : '0' }}
                                </span>
                            </td>
                            <td>S/{{ getTablePrice(product).toFixed(2) }}</td>
                            <td>
                                <div class="stock-control column">
                                    <span :class="['stock-badge', getStockClass(product.stock)]">
                                        {{ product.stock }}
                                    </span>
                                    <div class="stock-buttons">
                                        <button @click="decreaseStock(product)" class="stock-btn decrease"
                                            :disabled="product.stock <= 0" title="Disminuir stock">
                                            <MinusIcon :size="14" />
                                        </button>
                                        <button @click="increaseStock(product)" class="stock-btn increase"
                                            title="Aumentar stock">
                                            <PlusIcon :size="14" />
                                        </button>
                                    </div>
                                </div>
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
                                <div class="carousel-toggle">
                                    <input type="checkbox" :id="'carousel-' + product.id" :checked="product.carousel"
                                        @change="toggleCarousel(product)" class="carousel-checkbox" />
                                    <label :for="'carousel-' + product.id" class="carousel-label"></label>
                                </div>
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
                                    <button class="icon-button notify" @click="handleNotify(product.id)"
                                        title="Notificar">
                                        <BellIcon :size="18" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal actualizado -->
        <Modal v-if="showCreateModal" :title="editingId ? 'Editar Producto' : 'Nuevo Producto'" :loading="isSubmitting"
            @close="handleCloseModal">
            <form @submit.prevent="handleSubmit" class="product-form">
                <!-- Campos básicos -->
                <div class="form-group">
                    <label for="name">Nombre</label>
                    <input id="name" v-model="formData.name" type="text" class="form-input" required />
                </div>

                <div class="form-group">
                    <label for="brand">Marca</label>
                    <select id="brand" v-model="formData.brandID" class="form-input" required>
                        <option value="">Selecciona una marca</option>
                        <option v-for="brand in brands" :key="brand.id" :value="brand.id" :disabled="!brand.active">
                            {{ brand.name }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <div class="description-header">
                        <label for="description">Descripción</label>
                        <button type="button" @click="togglePreview" class="preview-toggle"
                            :class="{ 'active': showPreview }">
                            <EyeIcon v-if="!showPreview" :size="16" />
                            <EyeOffIcon v-else :size="16" />
                            {{ showPreview ? 'Ocultar' : 'Mostrar' }}
                        </button>
                    </div>
                    <div class="description-editor" :class="{ 'with-preview': showPreview }">
                        <div class="editor-section">
                            <div class="editor-toolbar">
                                <button type="button" @click="insertMarkdown('**')" title="Negrita"
                                    class="toolbar-button">
                                    <BoldIcon :size="16" />
                                </button>
                                <button type="button" @click="insertMarkdown('*')" title="Cursiva"
                                    class="toolbar-button">
                                    <ItalicIcon :size="16" />
                                </button>
                            </div>
                            <textarea id="description" v-model="formData.description" class="form-input markdown-editor"
                                required :style="{ height: showPreview ? '200px' : '150px' }" />
                        </div>
                        <div v-show="showPreview" class="preview-section">
                            <div class="preview-header">Vista previa</div>
                            <div class="markdown-preview" v-html="markdownPreview"></div>
                        </div>
                    </div>
                </div>

                <!-- Campos de precios y promoción -->
                <div class="form-row">
                    <div class="form-group">
                        <label for="originalPrice">Precio Original</label>
                        <input id="originalPrice" v-model.number="formData.originalPrice" type="number" step="0.01"
                            class="form-input" required />
                    </div>

                    <div class="form-group">
                        <label for="price">Precio Final</label>
                        <input id="price" v-model.number="formData.price" type="number" step="0.01" class="form-input"
                            required />
                    </div>
                </div>

                <!-- Campos de promoción modificados -->
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="formData.isPromoted" />
                        Aplicar promoción
                    </label>
                </div>

                <!-- Tipo de descuento nuevo -->
                <div v-if="formData.isPromoted" class="form-group">
                    <label for="promotionType">Tipo de descuento</label>
                    <div class="discount-types">
                        <button type="button" class="discount-type-btn"
                            :class="{ active: formData.promotionType === 'percentage' }"
                            @click="setDiscountType('percentage')">
                            <PercentIcon :size="16" />
                            Porcentual (%)
                        </button>
                        <button type="button" class="discount-type-btn"
                            :class="{ active: formData.promotionType === 'fixed' }" @click="setDiscountType('fixed')">
                            <DollarSignIcon :size="16" />
                            Monto fijo (S/)
                        </button>
                    </div>
                </div>

                <!-- Campo de descuento modificado -->
                <div v-if="formData.isPromoted" class="form-group">
                    <label for="discountPercentage">
                        {{ formData.promotionType === 'percentage' ? 'Descuento (%)' : 'Monto de descuento (S/)' }}
                    </label>
                    <input id="discountPercentage" v-model.number="formData.discountPercentage" type="number" min="0"
                        max="formData.promotionType === 'percentage' ? 100 : null" class="form-input"
                        :class="{ 'error': formData.isPromoted && (!formData.discountPercentage || formData.discountPercentage <= 0) }"
                        required />
                </div>

                <div v-if="formData.isPromoted" class="form-group promotion-dates">
                    <label class="promotion-dates-label">Periodo de promoción</label>
                    <div class="promotion-types">
                        <button type="button" class="promotion-type-btn"
                            :class="{ active: promotionDuration === 'single' }" @click="setPromotionDuration('single')">
                            <CalendarIcon :size="16" />
                            Día específico
                        </button>
                        <button type="button" class="promotion-type-btn"
                            :class="{ active: promotionDuration === 'range' }" @click="setPromotionDuration('range')">
                            <CalendarRangeIcon :size="16" />
                            Rango de fechas
                        </button>
                    </div>

                    <div class="date-inputs">
                        <template v-if="promotionDuration === 'single'">
                            <div class="date-field">
                                <label>Fecha de promoción</label>
                                <div class="date-input-wrapper">
                                    <CalendarIcon :size="16" class="date-icon" />
                                    <input type="date" v-model="formData.promotionStartDate" class="form-input"
                                        :min="getCurrentPeruDate()" @change="setSingleDate" />
                                </div>
                            </div>
                        </template>

                        <template v-else>
                            <div class="date-field">
                                <label>Inicio</label>
                                <div class="date-input-wrapper">
                                    <CalendarIcon :size="16" class="date-icon" />
                                    <input type="date" v-model="formData.promotionStartDate" class="form-input"
                                        :min="getCurrentPeruDate()" />
                                </div>
                            </div>
                            <div class="date-field">
                                <label>Fin</label>
                                <div class="date-input-wrapper">
                                    <CalendarIcon :size="16" class="date-icon" />
                                    <input type="date" v-model="formData.promotionEndDate" class="form-input"
                                        :min="formData.promotionStartDate" />
                                </div>
                            </div>
                        </template>
                    </div>

                    <div v-if="showDateError" class="date-error">
                        <AlertCircleIcon :size="16" />
                        La fecha de fin debe ser posterior a la fecha de inicio
                    </div>
                </div>

                <div class="form-group">
                    <label for="stock">Stock</label>
                    <div class="label-container">
                        <span v-if="formData.stock === 0" class="stock-tag">
                            sin stock
                        </span>
                    </div>
                    <input id="stock" v-model.number="formData.stock" type="number" min="0" class="form-input"
                        required />
                </div>

                <!-- Campo de categoría -->
                <div class="form-group">
                    <label>Categorías</label>
                    <div class="categories-container">
                        <div class="categories-tags">
                            <button v-for="category in categories" :key="category.id" type="button" :class="[
                                'category-tag',
                                formData.categoryIDs.includes(category.id) ? 'selected' : '',
                                !category.active ? 'disabled' : ''
                            ]" :disabled="!category.active" @click="toggleCategory(category.id)">
                                {{ category.name }}
                                <XIcon v-if="formData.categoryIDs.includes(category.id)" :size="14"
                                    class="remove-icon" />
                            </button>
                        </div>
                        <span v-if="formData.categoryIDs.length === 0" class="categories-hint">
                            Selecciona al menos una categoría
                        </span>
                    </div>
                </div>

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

                    <label class="checkbox-label">
                        <input type="checkbox" v-model="formData.carousel" />
                        Producto carousel
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

        <ImageModal :show="showImageModal" :image-url="selectedImageUrl" :product-name="selectedProductName"
            @close="showImageModal = false" />
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
    XIcon,
    BellIcon,
    EyeIcon,
    EyeOffIcon,
    BoldIcon,
    ItalicIcon,
    CalendarIcon,
    CalendarRangeIcon,
    MinusIcon,
    PercentIcon,
    DollarSignIcon
} from 'lucide-vue-next'
import { useProducts } from '@/composables/useProducts'
import { useCategories } from '@/composables/useCategories'
import type { Product } from '@/types/product.types'
import Modal from '@/components/Modal.vue'
import { uploadData, getUrl } from 'aws-amplify/storage';
import ImageModal from '@/components/ImageModal.vue'
import { useToast } from '@/composables/useToast';
import { useBrands } from '@/composables/useBrands'

const imageUrls = ref<Record<string, string>>({});
const promotionDuration = ref('single')
const markdownPreview = computed(() => {
    return simpleMarkdown(formData.value.description)
})
const formError = ref('')
const isSubmitting = ref(false)
const { brands, loadBrands } = useBrands()

// Formatear el descuento según el tipo (porcentual o fijo)
const formatDiscount = (product: Product): string => {
    const effectiveDiscount = getDisplayDiscount(product);

    if (effectiveDiscount <= 0) {
        return '0';
    }

    if (product.promotionType === 'fixed') {
        return `S/${effectiveDiscount.toFixed(2)}`;
    } else {
        return `${effectiveDiscount}%`;
    }
};

// Establecer el tipo de descuento
const setDiscountType = (type: 'percentage' | 'fixed') => {
    formData.value.promotionType = type;

    // Restablecer el valor del descuento para evitar confusiones
    formData.value.discountPercentage = 0;

    // Actualizar el precio final según el tipo de descuento
    calculateFinalPrice();
}

// Calcular precio final basado en el tipo de descuento
const calculateFinalPrice = () => {
    if (!formData.value.isPromoted || !formData.value.discountPercentage) {
        formData.value.price = formData.value.originalPrice;
        return;
    }

    if (formData.value.promotionType === 'percentage') {
        // Descuento porcentual
        formData.value.price = formData.value.originalPrice * (1 - formData.value.discountPercentage / 100);
    } else {
        // Descuento de monto fijo
        formData.value.price = Math.max(0, formData.value.originalPrice - formData.value.discountPercentage);
    }
}

const validateForm = (): boolean => {
    // Limpiamos error previo
    formError.value = ''

    if (!formData.value.brandID) {
        formError.value = 'Debes seleccionar una marca'
        return false
    }

    if (formData.value.categoryIDs.length === 0) {
        formError.value = 'Debes seleccionar al menos una categoría'
        return false
    }

    if (formData.value.isPromoted && (!formData.value.discountPercentage || formData.value.discountPercentage <= 0)) {
        formError.value = 'Cuando se aplica una promoción, el descuento debe ser mayor a 0'
        return false
    }

    // Validación adicional para descuento porcentual
    if (formData.value.isPromoted && formData.value.promotionType === 'percentage' && formData.value.discountPercentage > 100) {
        formError.value = 'El descuento porcentual no puede ser mayor a 100%'
        return false
    }

    // Validación para descuento fijo
    if (formData.value.isPromoted && formData.value.promotionType === 'fixed' && formData.value.discountPercentage > formData.value.originalPrice) {
        formError.value = 'El descuento fijo no puede ser mayor que el precio original'
        return false
    }

    return true
}

const simpleMarkdown = (text: string): string => {
    return text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^- (.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        // Convert newlines to <br>
        .replace(/\n/g, '<br>')
}
const showImageModal = ref(false)
const selectedImageUrl = ref('')
const selectedProductName = ref('')

const showPreview = ref(false)

const showDateError = ref(false)

const togglePreview = () => {
    showPreview.value = !showPreview.value
}

const handleImageClick = (product: Product) => {
    const imageUrl = imageUrls.value[product.id] || '/api/placeholder/400/400'
    selectedImageUrl.value = imageUrl
    selectedProductName.value = product.name
    showImageModal.value = true
}

const { showToast } = useToast();

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

const handleNotify = (productId: string) => {
    // TODO: Implement notification system
    showToast({
        type: 'success',
        message: `Notificacion enviada del producto con ID:  ${productId}`
    });
}

const setPromotionDuration = (type: 'single' | 'range') => {
    promotionDuration.value = type
    if (type === 'single') {
        setSingleDate()
    }
}

const setSingleDate = () => {
    formData.value.promotionEndDate = formData.value.promotionStartDate
}

const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('description') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.value.description

    formData.value.description =
        text.substring(0, start) +
        syntax +
        text.substring(start, end) +
        syntax +
        text.substring(end)

    textarea.focus()
}

const decreaseStock = async (product: Product) => {
    if (product.stock <= 0) return;

    try {
        const updatedProduct = {
            ...product,
            stock: product.stock - 1
        };

        // Obtener los IDs de las categorías actuales del producto
        const categoryIds = product.categories?.map(cat => cat.id) || [];

        await updateProduct(product.id, updatedProduct, categoryIds);

        // Animación del badge
        const badge = document.querySelector(`[data-product-id="${product.id}"] .stock-badge`);
        if (badge) {
            badge.classList.add('animate');
            setTimeout(() => badge.classList.remove('animate'), 500);
        }

        // Notificación de stock bajo
        if (updatedProduct.stock <= 5) {
            showToast({
                type: 'warning',
                message: `Stock bajo para ${product.name}: ${updatedProduct.stock} unidades`
            });
        }
    } catch (error) {
        console.error('Error al actualizar el stock:', error);
        showToast({
            type: 'error',
            message: 'Error al actualizar el stock'
        });
    }
};

const toggleCarousel = async (product: Product) => {
    try {
        const updatedProduct = {
            ...product,
            carousel: !product.carousel
        };

        // Obtener los IDs de las categorías actuales del producto
        const categoryIds = product.categories?.map(cat => cat.id) || [];

        await updateProduct(product.id, updatedProduct, categoryIds);

        showToast({
            type: 'success',
            message: `Producto ${updatedProduct.carousel ? 'agregado al' : 'removido del'} carousel`
        });
    } catch (error) {
        console.error('Error al actualizar el estado del carousel:', error);
        showToast({
            type: 'error',
            message: 'Error al actualizar el estado del carousel'
        });
    }
};

const increaseStock = async (product: Product) => {
    try {
        const updatedProduct = {
            ...product,
            stock: product.stock + 1
        };

        // Obtener los IDs de las categorías actuales del producto
        const categoryIds = product.categories?.map(cat => cat.id) || [];

        await updateProduct(product.id, updatedProduct, categoryIds);

        // Animación del badge
        const badge = document.querySelector(`[data-product-id="${product.id}"] .stock-badge`);
        if (badge) {
            badge.classList.add('animate');
            setTimeout(() => badge.classList.remove('animate'), 500);
        }
    } catch (error) {
        console.error('Error al actualizar el stock:', error);
        showToast({
            type: 'error',
            message: 'Error al actualizar el stock'
        });
    }
};

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

const formatMarkdown = (text: string): string => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

const truncateDescription = (text: string, maxLength: number = 100): string => {
    if (!text) return '';
    const formatted = formatMarkdown(text);
    if (formatted.length <= maxLength) return formatted;
    return formatted.substring(0, maxLength) + '...';
}

const initialFormData = {
    name: '',
    brand: '',
    brandID: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    stock: 0,
    active: true,
    carousel: true,
    isPromoted: false,
    categoryIDs: [] as string[],
    imageUrl: '',
    promotionStartDate: '',
    promotionEndDate: '',
    promotionType: 'percentage' // Valor predeterminado: descuento porcentual
}

const toggleCategory = (categoryId: string) => {
    const index = formData.value.categoryIDs.indexOf(categoryId);
    if (index === -1) {
        formData.value.categoryIDs.push(categoryId);
    } else {
        formData.value.categoryIDs.splice(index, 1);
    }
}

const formData = ref({ ...initialFormData })
const editingId = ref<string | null>(null)

// Observar cambios en los valores de descuento y precio original
watch(
    [
        () => formData.value.originalPrice,
        () => formData.value.discountPercentage,
        () => formData.value.promotionType,
        () => formData.value.isPromoted
    ],
    () => {
        calculateFinalPrice();
    }
)

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

const isPromotionExpired = (product: Product): boolean => {
    if (!product.isPromoted || !product.promotionEndDate) {
        return false;
    }

    const today = getCurrentPeruDate();
    return today > product.promotionEndDate;
};

const getDisplayDiscount = (product: Product): number => {
    if (!product.isPromoted || !product.discountPercentage || isPromotionExpired(product)) {
        return 0;
    }
    return product.discountPercentage;
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

    if (today > product.promotionEndDate) {
        return 'Promoción finalizada';
    }

    if (today < product.promotionStartDate) {
        return `Inicia el ${formatDateToSpanish(product.promotionStartDate)}`;
    }

    if (product.promotionStartDate === product.promotionEndDate) {
        return '¡Solo por hoy!';
    }

    return `Válido hasta el ${formatDateToSpanish(product.promotionEndDate)}`;
};

const updateExpiredPromotions = async () => {
    const expiredProducts = products.value.filter(product =>
        product.isPromoted && isPromotionExpired(product)
    );

    for (const product of expiredProducts) {
        try {
            const updatedProduct = {
                ...product,
                isPromoted: false,
                discountPercentage: 0,
                price: product.originalPrice
            };

            const categoryIds = product.categories?.map(cat => cat.id) || [];
            await updateProduct(product.id, updatedProduct, categoryIds);
        } catch (error) {
            console.error(`Error al actualizar promoción expirada para ${product.name}:`, error);
        }
    }

    if (expiredProducts.length > 0) {
        showToast({
            type: 'info',
            message: `Se han desactivado ${expiredProducts.length} promociones expiradas`
        });
    }
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
    const promotionExpired = isPromotionExpired(product);

    formData.value = {
        name: product.name,
        brand: product.brand,
        brandID: product.brandID || '',
        description: product.description,
        price: promotionExpired ? product.originalPrice : product.price, // Usar precio original si expiró
        originalPrice: product.originalPrice,
        discountPercentage: promotionExpired ? 0 : product.discountPercentage, // 0 si expiró
        stock: product.stock,
        active: product.active,
        carousel: product.carousel,
        isPromoted: promotionExpired ? false : product.isPromoted, // Desactivar si expiró
        categoryIDs: product.categories?.map(cat => cat.id) || [],
        imageUrl: product.imageUrl || '',
        promotionStartDate: product.promotionStartDate || '',
        promotionEndDate: product.promotionEndDate || '',
        promotionType: product.promotionType || 'percentage'
    };

    // Mostrar mensaje si la promoción expiró
    if (promotionExpired && product.isPromoted) {
        showToast({
            type: 'warning',
            message: 'La promoción de este producto ha expirado y se ha desactivado automáticamente'
        });
    }

    if (product.imageUrl && imageUrls.value[product.id]) {
        imagePreview.value = imageUrls.value[product.id];
    } else {
        imagePreview.value = null;
    }

    editingId.value = product.id;
    showCreateModal.value = true;
};

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
    if (!validateForm()) {
        showToast({
            type: 'error',
            message: formError.value
        });
        return;
    }

    try {
        isSubmitting.value = true

        const imageUrl = await uploadImage();

        const selectedBrand = brands.value.find(b => b.id === formData.value.brandID);
        const brandName = selectedBrand ? selectedBrand.name : formData.value.brand;

        // Asegurarnos de que el productData coincida con la interfaz Product
        const productData: Omit<Product, 'id' | 'categories'> = {
            name: formData.value.name,
            brand: brandName, // Usar el nombre de la marca
            brandID: formData.value.brandID, // Agregar el ID de la marca
            description: formData.value.description,
            price: formData.value.price,
            originalPrice: formData.value.originalPrice,
            discountPercentage: formData.value.discountPercentage,
            stock: formData.value.stock,
            active: formData.value.active,
            carousel: formData.value.carousel,
            isPromoted: formData.value.isPromoted,
            imageUrl: imageUrl || formData.value.imageUrl,
            promotionStartDate: formData.value.promotionStartDate || '',
            promotionEndDate: formData.value.promotionEndDate || '',
            promotionType: formData.value.promotionType || 'percentage'
        };

        if (editingId.value) {
            await updateProduct(editingId.value, productData, formData.value.categoryIDs)
            showToast({
                type: 'success',
                message: 'Producto actualizado con éxito'
            })
        } else {
            await createProduct(productData, formData.value.categoryIDs)
            showToast({
                type: 'success',
                message: 'Producto creado con éxito'
            })
        }

        handleCloseModal();
    } catch (error) {
        console.error('Error al procesar el producto:', error);
        showToast({
            type: 'error',
            message: 'Error al guardar el producto'
        });
    } finally {
        isSubmitting.value = false
    }
};

// Manejar activación/desactivación de promoción
watch(() => formData.value.isPromoted, (newValue) => {
    if (!newValue) {
        // Si se desactiva la promoción, reseteamos los valores de descuento
        formData.value.discountPercentage = 0;
        formData.value.price = formData.value.originalPrice;
        formError.value = '';
    } else if (newValue && (!formData.value.discountPercentage || formData.value.discountPercentage <= 0)) {
        // Si se activa la promoción, establecemos valores predeterminados
        formData.value.promotionType = 'percentage'; // Por defecto, descuento porcentual
    }
})

const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        try {
            await deleteProduct(id)
            showToast({
                type: 'success',
                message: 'Producto eliminado con éxito'
            })
        } catch (error) {
            console.error('Error:', error)
        }
    }
}

const getStockClass = (stock: number) => {
    if (stock > 20) return 'high';
    if (stock > 10) return 'medium';
    if (stock > 5) return 'low';
    return 'critical';
}

const getTablePrice = (product: Product): number => {
    if (isPromotionExpired(product)) {
        return product.originalPrice;
    }
    return product.price;
};

onMounted(async () => {
    await Promise.all([loadProducts(), loadCategories(), loadBrands()]);

    // Verificar y actualizar promociones expiradas después de cargar los productos
    setTimeout(() => {
        updateExpiredPromotions();
    }, 1000);
});

watch([
    () => formData.value.promotionStartDate,
    () => formData.value.promotionEndDate
], ([startDate, endDate]) => {
    if (promotionDuration.value === 'range' && startDate && endDate) {
        showDateError.value = endDate < startDate
    } else {
        showDateError.value = false
    }
})

watch(products, loadImageUrls, { immediate: true });
</script>

<style scoped>
.products-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.label-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.stock-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 12px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 500;
    background-color: #ef4444;
    color: white;
    text-transform: lowercase;
}

.form-input {
    margin-top: 4px;
    width: 100%;
}

.form-input.error {
    border-color: #ef4444;
}

.error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
}

.description-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.preview-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    background-color: white;
    color: #64748b;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.preview-toggle:hover {
    background-color: #f8fafc;
}

.preview-toggle.active {
    background-color: #e2e8f0;
    color: #1e293b;
}

.notify {
    color: #6366f1;
}

.notify:hover {
    background-color: #e0e7ff;
}

.description-editor {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: #f8fafc;
}

.editor-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.preview-section {
    border-top: 1px solid #e2e8f0;
    padding-top: 1rem;
    margin-top: 0.5rem;
}

.preview-header {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.5rem;
}

.editor-toolbar {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
}

.toolbar-button {
    padding: 0.25rem 0.5rem;
    border: none;
    background: none;
    color: #64748b;
    cursor: pointer;
    border-radius: 0.25rem;
}

.toolbar-button:hover {
    background-color: #f1f5f9;
    color: #1e293b;
}

.markdown-editor {
    min-height: 120px;
    resize: vertical;
}

.markdown-preview {
    background-color: white;
    border-radius: 0.375rem;
    padding: 1rem;
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;
}

.promotion-dates {
    background-color: #f8fafc;
    border-radius: 0.5rem;
    padding: 1rem;
}

.promotion-types {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.promotion-type-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    background-color: white;
    color: #64748b;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.promotion-type-btn:hover {
    background-color: #f1f5f9;
}

.promotion-type-btn.active {
    background-color: #e2e8f0;
    color: #1e293b;
    border-color: #cbd5e1;
}

/* Estilos para los botones de tipo de descuento */
.discount-types {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
}

.discount-type-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    flex: 1;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    background-color: white;
    color: #64748b;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.discount-type-btn:hover {
    background-color: #f1f5f9;
}

.discount-type-btn.active {
    background-color: #3b82f6;
    color: white;
    border-color: #2563eb;
}

.date-inputs {
    display: flex;
    gap: 1rem;
}

.date-field {
    flex: 1;
}

.date-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.date-icon {
    position: absolute;
    left: 0.75rem;
    color: #64748b;
}

.date-input-wrapper input {
    padding-left: 2.5rem;
}

.date-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.image-upload-container {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 0.5rem;
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
    border: 1px solid #e2e8f0;
    background-color: #f8fafc;
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
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
}

.clear-image-button:hover {
    background-color: rgba(0, 0, 0, 0.7);
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

.animate-spin {
    animation: spin 1s linear infinite;
}

.categories-container {
    width: 100%;
}

.categories-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.category-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    border: 1px solid #e2e8f0;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s;
}

.category-tag:hover:not(.disabled) {
    background-color: #f1f5f9;
}

.category-tag.selected {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.category-tag.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.categories-hint {
    display: block;
    color: #64748b;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.remove-icon {
    opacity: 0.7;
}

.remove-icon:hover {
    opacity: 1;
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

.carousel-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
}

.carousel-checkbox {
    position: absolute;
    opacity: 0;
    height: 0;
    width: 0;
}

.carousel-label {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 20px;
    transition: background-color 0.3s;
    cursor: pointer;
}

.carousel-label::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: white;
    transition: 0.3s;
}

.carousel-checkbox:checked+.carousel-label {
    background-color: #4CAF50;
}

.carousel-checkbox:checked+.carousel-label::after {
    transform: translateX(20px);
}

.carousel-checkbox:focus+.carousel-label {
    box-shadow: 0 0 1px #4CAF50;
}

/* Para la animación al hacer cambios */
.carousel-label:active::after {
    width: 22px;
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
    object-fit: cover;
    border-radius: 4px;
    transition: transform 0.2s;
}

.product-image:hover {
    transform: scale(1.05);
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
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 300px;
}

.product-description :deep(strong) {
    font-weight: 600;
}

.product-description :deep(em) {
    font-style: italic;
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
    transition: all 0.3s ease;
}

.stock-badge.animate {
    animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
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

.stock-badge.critical {
    background: #fecdd3;
    color: #be123c;
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

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

.stock-control {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.stock-control.column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.stock-control.column .stock-badge {
    margin-bottom: 0.25rem;
}

.stock-buttons {
    display: flex;
    gap: 0.25rem;
}

.stock-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 0.375rem;
    border: 1px solid #e2e8f0;
    background-color: white;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
}

.stock-btn:hover:not(:disabled) {
    background-color: #f1f5f9;
    color: #1e293b;
}

.stock-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f1f5f9;
}

.stock-btn.decrease:hover:not(:disabled) {
    background-color: #fee2e2;
    border-color: #fecaca;
    color: #dc2626;
}

.stock-btn.increase:hover:not(:disabled) {
    background-color: #dcfce7;
    border-color: #bbf7d0;
    color: #16a34a;
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