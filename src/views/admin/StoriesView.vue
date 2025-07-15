<!-- views/admin/AdminStoriesView.vue -->
<template>
    <div class="stories-page">
        <!-- Header y búsqueda -->
        <div class="header-actions">
            <div class="search-filter">
                <div class="search-box">
                    <SearchIcon :size="20" class="search-icon" />
                    <input type="text" placeholder="Buscar historias..." class="search-input" v-model="searchQuery" />
                </div>
                <button class="primary-button" @click="showCreateModal = true">
                    <PlusIcon :size="20" />
                    Nueva Historia
                </button>
            </div>
        </div>

        <!-- Estadísticas de Historias -->
        <div v-if="!loading && !error" class="stats-grid">
            <div class="stat-card">
                <PlayCircleIcon :size="24" class="stat-icon" />
                <div class="stat-info">
                    <span class="stat-label">Total Historias</span>
                    <span class="stat-value">{{ storyStats.total }}</span>
                </div>
            </div>
            <div class="stat-card">
                <CheckCircleIcon :size="24" class="stat-icon active" />
                <div class="stat-info">
                    <span class="stat-label">Historias Activas</span>
                    <span class="stat-value">{{ storyStats.active }}</span>
                </div>
            </div>
            <div class="stat-card">
                <EyeIcon :size="24" class="stat-icon views" />
                <div class="stat-info">
                    <span class="stat-label">Total Vistas</span>
                    <span class="stat-value">{{ storyStats.totalViews }}</span>
                </div>
            </div>
            <div class="stat-card">
                <HeartIcon :size="24" class="stat-icon likes" />
                <div class="stat-info">
                    <span class="stat-label">Total Likes</span>
                    <span class="stat-value">{{ storyStats.totalLikes }}</span>
                </div>
            </div>
        </div>

        <!-- Estados de loading y error -->
        <div v-if="loading" class="loading-state">
            <Loader2Icon :size="40" class="animate-spin" />
            <p>Cargando historias...</p>
        </div>

        <div v-else-if="error" class="error-state">
            <AlertCircleIcon :size="40" class="text-red-500" />
            <p>{{ error }}</p>
            <button @click="loadStories" class="retry-button">
                <RefreshCwIcon :size="20" />
                Intentar de nuevo
            </button>
        </div>

        <div v-else>
            <!-- Tabla de historias -->
            <div class="table-container">
                <table class="stories-table">
                    <thead>
                        <tr>
                            <th>Historia</th>
                            <!-- <th>Producto</th> -->
                            <th>Vistas</th>
                            <th>Likes</th>
                            <!-- <th>Wants</th> -->
                            <th>Estado</th>
                            <th>Tiempo Restante</th> <!-- NUEVO -->
                            <!-- <th>Orden</th>-->
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="story in filteredStories" :key="story.id">
                            <td>
                                <div class="story-info">
                                    <div class="story-image-container">
                                        <img :src="getStoryImage(story)" :alt="story.title" class="story-image" />
                                        <div class="story-overlay" @click="previewStory(story)">
                                            <PlayIcon :size="20" class="play-icon" />
                                        </div>
                                    </div>
                                    <div class="story-details">
                                        <span class="story-title">{{ story.title }}</span>
                                        <span class="story-description">{{ truncateText(story.description) }}</span>
                                        <div class="story-meta">
                                            <span v-if="story.audioUrl" class="has-audio">
                                                <Volume2Icon :size="14" /> Con audio
                                            </span>
                                            <span v-if="story.externalLink" class="has-link">
                                                <ExternalLinkIcon :size="14" /> Con enlace
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <!-- <td>
                                <div v-if="story.product" class="product-ref">
                                    <img :src="story.product.imageUrl || '/api/placeholder/30/30'"
                                        :alt="story.product.name" class="product-thumb" />
                                    <div class="product-info">
                                        <span class="product-name">{{ story.product.name }}</span>
                                        <span class="product-price">S/{{ story.product.price?.toFixed(2) }}</span>
                                    </div>
                                </div>
                                <span v-else class="no-product">Sin producto</span>
                            </td>-->
                            <td>
                                <span class="stat-number views">{{ story.views || 0 }}</span>
                            </td>
                            <td>
                                <span class="stat-number likes">{{ story.likes || 0 }}</span>
                            </td>
                            <!-- <td>
                                <span class="stat-number wants">{{ story.wants || 0 }}</span>
                            </td>-->
                            <td>
                                <span :class="['status-badge', story.active ? 'active' : 'inactive']">
                                    {{ story.active ? 'Activa' : 'Inactiva' }}
                                </span>
                            </td>
                            <!-- <td>
                                <div class="order-control">
                                    <span class="order-number">{{ story.order || 0 }}</span>
                                    <div class="order-buttons">
                                        <button @click="moveStoryUp(story)" class="order-btn up"
                                            :disabled="isFirstStory(story)" title="Subir">
                                            <ChevronUpIcon :size="14" />
                                        </button>
                                        <button @click="moveStoryDown(story)" class="order-btn down"
                                            :disabled="isLastStory(story)" title="Bajar">
                                            <ChevronDownIcon :size="14" />
                                        </button>
                                    </div>
                                </div>
                            </td>-->
                            <td>
                                <div class="time-remaining">
                                    <span v-if="!getTimeRemaining(story.expiresAt).expired"
                                        :class="['time-text', getTimeRemaining(story.expiresAt).hours <= 2 ? 'urgent' : '']">
                                        {{ formatTimeRemaining(story.expiresAt) }}
                                    </span>
                                    <span v-else class="expired-text">Vencida</span>
                                </div>
                            </td>
                            <td>
                                <div class="story-date">
                                    <span class="date">{{ formatDate(story.createdAt) }}</span>
                                    <span class="time">{{ formatTime(story.createdAt) }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <!-- <button class="icon-button preview" @click="previewStory(story)"
                                        title="Vista previa">
                                        <PlayIcon :size="18" />
                                    </button> -->
                                    <button v-if="!getTimeRemaining(story.expiresAt).expired" class="icon-button edit"
                                        @click="handleEdit(story)" title="Editar">
                                        <EditIcon :size="16" />
                                    </button>
                                    <!-- <button class="icon-button toggle" @click="toggleStoryStatus(story)"
                                        :title="story.active ? 'Desactivar' : 'Activar'">
                                        <ToggleRightIcon v-if="story.active" :size="18" />
                                        <ToggleLeftIcon v-else :size="18" />
                                    </button> -->
                                    <!-- <button v-if="!getTimeRemaining(story.expiresAt).expired"
                                        @click="forceExpire(story.id)" class="icon-button test-expire"
                                        title="🧪 Forzar vencimiento (TEST)" :disabled="!story.id">
                                        ⏰
                                    </button>-->
                                    <button v-else @click="resetExpiration(story.id)" class="icon-button test-reset"
                                        title="Restaurar 24h" :disabled="!story.id">
                                        <RefreshCwIcon :size="16" />
                                    </button>
                                    <button class="icon-button delete" @click="handleDelete(story.id)" title="Eliminar">
                                        <Trash2Icon :size="16" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal para crear/editar historia -->
        <Modal v-if="showCreateModal" :title="editingId ? 'Editar Historia' : 'Nueva Historia'" :loading="isSubmitting"
            @close="handleCloseModal">
            <form @submit.prevent="handleSubmit" class="story-form">
                <!-- Información básica -->
                <div class="form-group">
                    <label for="title">Título</label>
                    <input id="title" v-model="formData.title" type="text" class="form-input"
                        placeholder="Título de la historia" required />
                </div>

                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" v-model="formData.description" class="form-input textarea" rows="3"
                        placeholder="Descripción breve de la historia" required></textarea>
                </div>

                <!-- Producto relacionado -->
                <div class="form-group">
                    <label for="product">Producto relacionado (opcional)</label>
                    <select id="product" v-model="formData.productID" class="form-input">
                        <option value="">Sin producto relacionado</option>
                        <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                            {{ product.name }} - {{ product.brand }}
                        </option>
                    </select>
                </div>

                <!-- Enlace externo -->
                <div class="form-group">
                    <label for="externalLink">Enlace externo (opcional)</label>
                    <input id="externalLink" v-model="formData.externalLink" type="url" class="form-input"
                        placeholder="https://tiktok.com/@usuario/video..." />
                    <!-- <span class="form-hint">Enlace a TikTok, Instagram, YouTube, etc.</span>-->
                </div>

                <!-- Configuración de duración y orden -->
                <div class="form-row">
                    <div class="form-group">
                        <label for="duration">Duración (segundos)</label>
                        <input id="duration" v-model.number="formData.duration" type="number" min="3" max="30"
                            class="form-input" required />
                        <span class="form-hint">Entre 3 y 30 segundos como maximo</span>
                    </div>
                    <!-- <div class="form-group">
                        <label for="order">Orden de aparición</label>
                        <input id="order" v-model.number="formData.order" type="number" min="0" class="form-input"
                            required />
                    </div>-->
                </div>

                <!-- Imagen de la historia -->
                <div class="form-group">
                    <label>Imagen de la historia <span class="required">*</span></label>
                    <div class="media-upload-container">
                        <input type="file" id="storyImage" accept="image/*" @change="handleImageSelect"
                            class="file-input" hidden>
                        <label for="storyImage" class="upload-button">
                            <ImageIcon :size="16" />
                            {{ selectedImageFile ? 'Cambiar imagen' : 'Seleccionar imagen' }}
                        </label>

                        <!-- Advertencia sobre cambio de imagen 
                        <div v-if="editingId && selectedImageFile" class="warning-message">
                            <AlertTriangleIcon :size="16" />
                            <span>⚠️ Al cambiar la imagen se reiniciarán los contadores de vistas y likes</span>
                        </div>-->

                        <div v-if="imagePreview" class="media-preview">
                            <img :src="imagePreview" alt="Vista previa" class="preview-image" />
                            <button v-if="selectedImageFile" @click="clearImage" class="clear-media-button"
                                type="button">
                                <XIcon :size="16" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Audio de la historia -->
                <div class="form-group">
                    <label>Audio de la historia (opcional)</label>
                    <div class="media-upload-container">
                        <input type="file" id="storyAudio" accept="audio/*" @change="handleAudioSelect"
                            class="file-input" hidden>
                        <label for="storyAudio" class="upload-button secondary">
                            <Volume2Icon :size="16" />
                            {{ selectedAudioFile ? 'Cambiar audio' : 'Seleccionar audio' }}
                        </label>

                        <div v-if="audioPreview" class="media-preview audio">
                            <div class="audio-info">
                                <Volume2Icon :size="20" />
                                <span>{{ selectedAudioFile?.name }}</span>
                            </div>
                            <audio :src="audioPreview" controls class="audio-player"></audio>
                            <button v-if="selectedAudioFile" @click="clearAudio" class="clear-media-button"
                                type="button">
                                <XIcon :size="16" />
                            </button>
                        </div>
                    </div>
                    <span class="form-hint">Formatos: MP3, WAV, AAC (máx. 10MB)</span>
                </div>

                <!-- Estado activo -->
                <!-- <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="formData.active" />
                        Historia activa
                    </label>
                </div>-->

                <!-- Botones del modal -->
                <div class="modal-footer">
                    <button type="button" class="secondary-button" @click="handleCloseModal" :disabled="isSubmitting">
                        Cancelar
                    </button>
                    <button type="submit" class="primary-button" :disabled="isSubmitting || !isFormValid">
                        {{ editingId ? 'Actualizar' : 'Crear' }}
                    </button>
                </div>
            </form>
        </Modal>

        <!-- Modal de vista previa -->
        <StoryPreviewModal v-if="showPreviewModal && previewStoryData" :story="previewStoryData"
            @close="showPreviewModal = false" />
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
    PlayIcon,
    PlayCircleIcon,
    CheckCircleIcon,
    EyeIcon,
    HeartIcon,
    Volume2Icon,
    ExternalLinkIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ToggleRightIcon,
    ToggleLeftIcon,
    ImageIcon,
    XIcon
} from 'lucide-vue-next'
import { useStories } from '@/composables/useStories'
import { useProducts } from '@/composables/useProducts'
import type { Story } from '@/types/story.types'
import type { Product } from '@/types/product.types'
import Modal from '@/components/Modal.vue'
import { uploadData, getUrl, remove } from 'aws-amplify/storage'
import { useToast } from '@/composables/useToast'
import StoryPreviewModal from '@/components/StoryPreviewModal.vue'
import { useStoryStore } from '@/stores/story'
const storyStore = useStoryStore()

// Composables
const { stories, loading, error, loadStories, createStory, updateStory, deleteStory, refreshStoryStats, forceExpireStory, resetStoryExpiration } = useStories()
const { allProductsWeb: availableProducts, loadAllProductsWeb } = useProducts()
const { showToast } = useToast()

// Estado del componente
const searchQuery = ref('')
const showCreateModal = ref(false)
const showPreviewModal = ref(false)
const previewStoryData = ref<Story | null>(null)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)

// Archivos multimedia
const selectedImageFile = ref<File | null>(null)
const selectedAudioFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const audioPreview = ref<string | null>(null)
const storyImages = ref<Record<string, string>>({})

// Datos del formulario
const initialFormData = {
    title: '',
    description: '',
    productID: '',
    externalLink: '',
    duration: 10,
    //order: 0,
    active: true
}

const formData = ref({ ...initialFormData })

// Computed properties
const filteredStories = computed(() => {
    if (!searchQuery.value) return stories.value

    const query = searchQuery.value.toLowerCase()
    return stories.value.filter(story =>
        story.title.toLowerCase().includes(query) ||
        story.description.toLowerCase().includes(query) ||
        story.product?.name.toLowerCase().includes(query)
    )
})

const storyStats = computed(() => {
    const stats = {
        total: stories.value.length,
        active: 0,
        totalViews: 0,
        totalLikes: 0,
        totalWants: 0
    }

    stories.value.forEach(story => {
        if (story.active) stats.active++
        stats.totalViews += story.views || 0
        stats.totalLikes += story.likes || 0
        stats.totalWants += story.wants || 0
    })

    return stats
})

const forceExpire = async (storyId: string) => {
    if (confirm('🧪 TESTING: ¿Forzar vencimiento de esta historia?')) {
        try {
            //console.log('🧪 Vista: Iniciando forzar vencimiento para:', storyId);

            // Verificar que la función existe
            if (!forceExpireStory) {
                throw new Error('Función forceExpireStory no está disponible');
            }

            await forceExpireStory(storyId);

            showToast({
                type: 'info',
                message: '🧪 Historia forzada a vencer para testing'
            });
        } catch (error) {
            console.error('🧪 Error completo en vista:', error);
            showToast({
                type: 'error',
                message: `Error al forzar vencimiento: ${error instanceof Error ? error.message : 'Error desconocido'}`
            });
        }
    }
};

const resetExpiration = async (storyId: string) => {
    if (confirm('¿Restaurar historia a 24h? (Esto reiniciará los views/likes)')) {
        try {
            //console.log('🧪 Vista: Iniciando restauración para:', storyId);

            // Verificar que la función existe
            if (!resetStoryExpiration) {
                throw new Error('Función resetStoryExpiration no está disponible');
            }

            await resetStoryExpiration(storyId);

            showToast({
                type: 'success',
                message: 'Historia restaurada a 24h'
            });
        } catch (error) {
            console.error('Error completo en vista:', error);
            showToast({
                type: 'error',
                message: `Error al restaurar historia: ${error instanceof Error ? error.message : 'Error desconocido'}`
            });
        }
    }
};

// Reemplaza el computed isFormValid
const isFormValid = computed(() => {
    const hasTitle = formData.value.title.trim() !== ''
    const hasDescription = formData.value.description.trim() !== ''

    // En modo edición, no requerir nueva imagen si ya existe una
    const hasImage = editingId.value !== null ?
        (selectedImageFile.value !== null || imagePreview.value !== null) :
        selectedImageFile.value !== null

    return hasTitle && hasDescription && hasImage
})

// Métodos para manejo de imágenes
const getStoryImage = (story: Story): string => {
    return storyImages.value[story.id] || '/api/placeholder/60/80'
}

const loadStoryImages = async () => {
    for (const story of stories.value) {
        if (story.imageUrl) {
            try {
                const { url } = await getUrl({ path: story.imageUrl })
                storyImages.value[story.id] = url.toString()
            } catch (error) {
                console.error('Error loading story image:', error)
            }
        }
    }
}

// Métodos de formulario
const handleImageSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files?.length) {
        const file = input.files[0]

        // Validar tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast({
                type: 'error',
                message: 'La imagen no puede ser mayor a 5MB'
            })
            return
        }

        selectedImageFile.value = file
        imagePreview.value = URL.createObjectURL(file)
    }
}

const handleAudioSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files?.length) {
        const file = input.files[0]

        // Validar tamaño (máx 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showToast({
                type: 'error',
                message: 'El audio no puede ser mayor a 10MB'
            })
            return
        }

        selectedAudioFile.value = file
        audioPreview.value = URL.createObjectURL(file)
    }
}

const clearImage = () => {
    selectedImageFile.value = null
    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value)
        imagePreview.value = null
    }
    const input = document.getElementById('storyImage') as HTMLInputElement
    if (input) input.value = ''
}

const clearAudio = () => {
    selectedAudioFile.value = null
    if (audioPreview.value) {
        URL.revokeObjectURL(audioPreview.value)
        audioPreview.value = null
    }
    const input = document.getElementById('storyAudio') as HTMLInputElement
    if (input) input.value = ''
}

const getTimeRemaining = (expiresAt: string) => {
    return storyStore.getTimeRemaining(expiresAt)
}

const formatTimeRemaining = (expiresAt: string): string => {
    const { hours, minutes, expired } = getTimeRemaining(expiresAt)
    if (expired) return 'Vencida'

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

// Métodos CRUD
const handleSubmit = async () => {
    if (!isFormValid.value) return

    try {
        isSubmitting.value = true

        let imageUrl = ''
        let audioUrl = ''
        //let shouldResetCounters = false

        // Subir imagen si hay una nueva
        if (selectedImageFile.value) {
            const imagePath = `stories/${Date.now()}-image-${selectedImageFile.value.name.replace(/\s+/g, '-')}`
            await uploadData({
                data: selectedImageFile.value,
                path: imagePath,
                options: {
                    contentType: selectedImageFile.value.type
                }
            }).result
            imageUrl = imagePath
            //shouldResetCounters = !!editingId.value // Solo resetear si es edición
        }

        // Subir audio si hay uno nuevo
        if (selectedAudioFile.value) {
            const audioPath = `stories/${Date.now()}-audio-${selectedAudioFile.value.name.replace(/\s+/g, '-')}`
            await uploadData({
                data: selectedAudioFile.value,
                path: audioPath,
                options: {
                    contentType: selectedAudioFile.value.type
                }
            }).result
            audioUrl = audioPath
        }

        if (editingId.value) {
            // Para ediciones, crear objeto sin views/likes/wants si no se resetean
            const updateData: any = {
                title: formData.value.title,
                description: formData.value.description,
                productID: formData.value.productID || undefined,
                externalLink: formData.value.externalLink || undefined,
                duration: formData.value.duration,
                //order: formData.value.order,
                active: formData.value.active,
                imageUrl: imageUrl || undefined,
                audioUrl: audioUrl || undefined,
            }

            // Solo incluir contadores si se van a resetear
            /*if (shouldResetCounters) {
                updateData.views = 0
                updateData.likes = 0
                updateData.wants = 0
            }*/

            await updateStory(editingId.value, updateData)
            showToast({
                type: 'success',
                message: 'Historia actualizada con éxito'
            })

            /*if (shouldResetCounters) {
                showToast({
                    type: 'info',
                    message: 'Historia actualizada. Los contadores se han reiniciado por el cambio de imagen.'
                })
            } else {
                showToast({
                    type: 'success',
                    message: 'Historia actualizada con éxito'
                })
            }*/
        } else {
            // Para creaciones, siempre usar valores por defecto
            const storyData = {
                title: formData.value.title,
                description: formData.value.description,
                productID: formData.value.productID || undefined,
                externalLink: formData.value.externalLink || undefined,
                duration: formData.value.duration,
                //order: formData.value.order,
                active: formData.value.active,
                imageUrl: imageUrl || '',
                audioUrl: audioUrl || '',
                views: 0,
                likes: 0,
                wants: 0
            }

            await createStory(storyData)
            showToast({
                type: 'success',
                message: 'Historia creada con éxito'
            })
        }

        handleCloseModal()
    } catch (error) {
        console.error('Error al guardar historia:', error)
        showToast({
            type: 'error',
            message: 'Error al guardar la historia'
        })
    } finally {
        isSubmitting.value = false
    }
}

const handleEdit = async (story: Story) => {
    formData.value = {
        title: story.title,
        description: story.description,
        productID: story.productID || '',
        externalLink: story.externalLink || '',
        duration: story.duration,
        //order: story.order,
        active: story.active
    }

    // Cargar imagen existente
    if (story.imageUrl) {
        try {
            const { url } = await getUrl({ path: story.imageUrl })
            imagePreview.value = url.toString()
        } catch (error) {
            console.error('Error loading existing image:', error)
        }
    }

    // Cargar audio existente
    if (story.audioUrl) {
        try {
            const { url } = await getUrl({ path: story.audioUrl })
            audioPreview.value = url.toString()
        } catch (error) {
            console.error('Error loading existing audio:', error)
        }
    }

    editingId.value = story.id
    showCreateModal.value = true
}

const handleDelete = async (storyId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta historia?')) {
        try {
            await deleteStory(storyId)
            showToast({
                type: 'success',
                message: 'Historia eliminada con éxito'
            })
        } catch (error) {
            console.error('Error:', error)
            showToast({
                type: 'error',
                message: 'Error al eliminar la historia'
            })
        }
    }
}

const toggleStoryStatus = async (story: Story) => {
    try {
        const updatedData = { active: !story.active }
        await updateStory(story.id, updatedData)

        showToast({
            type: 'success',
            message: `Historia ${updatedData.active ? 'activada' : 'desactivada'}`
        })
    } catch (error) {
        console.error('Error toggling story status:', error)
        showToast({
            type: 'error',
            message: 'Error al cambiar el estado de la historia'
        })
    }
}

// Métodos de ordenamiento
const moveStoryUp = async (story: Story) => {
    const sortedStories = [...stories.value].sort((a, b) => (a.order || 0) - (b.order || 0))
    const currentIndex = sortedStories.findIndex(s => s.id === story.id)

    if (currentIndex <= 0) return

    const currentStory = sortedStories[currentIndex]
    const previousStory = sortedStories[currentIndex - 1]

    // Intercambiar órdenes
    const tempOrder = currentStory.order || 0
    await updateStory(currentStory.id, { order: previousStory.order || 0 })
    await updateStory(previousStory.id, { order: tempOrder })
}

const moveStoryDown = async (story: Story) => {
    const sortedStories = [...stories.value].sort((a, b) => (a.order || 0) - (b.order || 0))
    const currentIndex = sortedStories.findIndex(s => s.id === story.id)

    if (currentIndex >= sortedStories.length - 1) return

    const currentStory = sortedStories[currentIndex]
    const nextStory = sortedStories[currentIndex + 1]

    // Intercambiar órdenes
    const tempOrder = currentStory.order || 0
    await updateStory(currentStory.id, { order: nextStory.order || 0 })
    await updateStory(nextStory.id, { order: tempOrder })
}

const isFirstStory = (story: Story): boolean => {
    const sortedStories = [...stories.value].sort((a, b) => (a.order || 0) - (b.order || 0))
    return sortedStories.findIndex(s => s.id === story.id) === 0
}

const isLastStory = (story: Story): boolean => {
    const sortedStories = [...stories.value].sort((a, b) => (a.order || 0) - (b.order || 0))
    return sortedStories.findIndex(s => s.id === story.id) === sortedStories.length - 1
}

// Vista previa
const previewStory = async (story: Story) => {
    await refreshStoryStats(story.id);
    previewStoryData.value = stories.value.find(s => s.id === story.id) || story;
    showPreviewModal.value = true;
}

// Métodos de utilidad
const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return ''
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...'
}

const formatDate = (dateStr?: string): string => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const formatTime = (dateStr?: string): string => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

const resetForm = () => {
    formData.value = { ...initialFormData }
    editingId.value = null
    clearImage()
    clearAudio()
}

const handleCloseModal = () => {
    showCreateModal.value = false
    resetForm()
}

// Lifecycle
onMounted(async () => {
    await Promise.all([
        loadStories(),
        loadAllProductsWeb()
    ])
    await loadStoryImages()
})

// Watchers
watch(stories, loadStoryImages, { immediate: true })
</script>

<style scoped>
/* Reutilizar estilos base de ProductsView */
.stories-page {
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

/* Stats Section */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-icon {
    color: #8b5cf6;
}

.stat-icon.active {
    color: #22c55e;
}

.stat-icon.views {
    color: #3b82f6;
}

.stat-icon.likes {
    color: #ef4444;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-label {
    font-size: 0.875rem;
    color: #64748b;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
}

/* Table Styles */
.table-container {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
    width: 100%;
}

.stories-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1000px;
}

.stories-table th,
.stories-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.stories-table th {
    background: #f8fafc;
    font-weight: 500;
    color: #64748b;
    position: sticky;
    top: 0;
    z-index: 10;
}

.stories-table tr:hover {
    background-color: #f8fafc;
}

/* Story Info Styles */
.story-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.story-image-container {
    position: relative;
    width: 60px;
    height: 80px;
    flex-shrink: 0;
    background-color: #f8fafc;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
}

.story-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.story-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.2s;
    cursor: pointer;
}

.story-image-container:hover .story-overlay {
    opacity: 1;
}

.play-icon {
    color: white;
}

.story-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.story-title {
    font-weight: 500;
    color: #0f172a;
    font-size: 0.875rem;
}

.story-description {
    font-size: 0.75rem;
    color: #64748b;
    line-height: 1.4;
}

.story-meta {
    display: flex;
    gap: 1rem;
    margin-top: 0.25rem;
}

.has-audio,
.has-link {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #6b7280;
}

.has-audio {
    color: #8b5cf6;
}

.has-link {
    color: #3b82f6;
}

/* Product Reference */
.product-ref {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.product-thumb {
    width: 30px;
    height: 30px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

.product-info {
    display: flex;
    flex-direction: column;
}

.product-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: #0f172a;
    line-height: 1.2;
}

.product-price {
    font-size: 0.75rem;
    color: #64748b;
}

.no-product {
    font-size: 0.75rem;
    color: #9ca3af;
    font-style: italic;
}

/* Stats Numbers */
.stat-number {
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
}

.stat-number.views {
    background: #eff6ff;
    color: #2563eb;
}

.stat-number.likes {
    background: #fef2f2;
    color: #dc2626;
}

.stat-number.wants {
    background: #f0fdf4;
    color: #16a34a;
}

/* Status Badge */
.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
}

.status-badge.active {
    background: #dcfce7;
    color: #166534;
}

.status-badge.inactive {
    background: #fee2e2;
    color: #991b1b;
}

/* Order Control */
.order-control {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.order-number {
    font-weight: 600;
    color: #0f172a;
    font-size: 0.875rem;
}

.order-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.order-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 20px;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    background-color: white;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
}

.order-btn:hover:not(:disabled) {
    background-color: #f1f5f9;
    color: #1e293b;
}

.order-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.order-btn.up:hover:not(:disabled) {
    background-color: #dcfce7;
    border-color: #bbf7d0;
    color: #16a34a;
}

.order-btn.down:hover:not(:disabled) {
    background-color: #fee2e2;
    border-color: #fecaca;
    color: #dc2626;
}

/* Date Display */
.story-date {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.date {
    color: #0f172a;
    font-size: 0.875rem;
}

.time {
    font-size: 0.75rem;
    color: #64748b;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.icon-button {
    padding: 0.5rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    min-height: 40px;
}

.icon-button.preview {
    color: #8b5cf6;
    background: #f3f4f6;
}

.icon-button.preview:hover {
    background: #e5e7eb;
}

.icon-button.edit {
    color: #0ea5e9;
    background: #e0f2fe;
}

.icon-button.edit:hover {
    background: #bae6fd;
}

.icon-button.toggle {
    color: #f59e0b;
    background: #fef3c7;
}

.icon-button.toggle:hover {
    background: #fde68a;
}

.icon-button.delete {
    color: #ef4444;
    background: #fee2e2;
}

.icon-button.delete:hover {
    background: #fecaca;
}

/* Loading & Error States */
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
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.retry-button:hover {
    background: #dc2626;
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* Form Styles */
.story-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.form-input {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.textarea {
    resize: vertical;
    min-height: 80px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-hint {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
}

.required {
    color: #ef4444;
}

/* Media Upload */
.media-upload-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.upload-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
    width: fit-content;
}

.upload-button:hover {
    background: #e2e8f0;
}

.upload-button.secondary {
    background: #2563EB;
    border-color: #2563EB;
    color: #ffffff;
}

.upload-button.secondary:hover {
    background: #0043d4;
}

.media-preview {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
}

.media-preview.audio {
    flex-direction: column;
    align-items: flex-start;
}

.preview-image {
    width: 120px;
    height: 160px;
    object-fit: cover;
    border-radius: 0.375rem;
    border: 1px solid #e2e8f0;
}

.audio-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
}

.audio-player {
    width: 100%;
    height: 40px;
}

.clear-media-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(239, 68, 68, 0.9);
    color: white;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
}

.clear-media-button:hover {
    background-color: rgba(239, 68, 68, 1);
}

/* Checkbox */
.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #374151;
}

.checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #3b82f6;
}

/* Modal Footer */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.secondary-button {
    padding: 0.75rem 1rem;
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.secondary-button:hover:not(:disabled) {
    background: #f1f5f9;
}

.secondary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.primary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
    .search-filter {
        flex-direction: column;
        gap: 0.5rem;
    }

    .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;
    }

    .stat-card {
        padding: 1rem;
    }

    .stat-value {
        font-size: 1.25rem;
    }

    .table-container {
        margin: 0 -1rem;
        width: calc(100% + 2rem);
        border-radius: 0;
    }

    .stories-table th,
    .stories-table td {
        padding: 0.75rem;
    }

    .story-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .story-image-container {
        width: 50px;
        height: 65px;
    }

    .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .media-preview {
        flex-direction: column;
        align-items: flex-start;
    }

    .preview-image {
        width: 100px;
        height: 130px;
    }
}

/* Responsive */
@media (max-width: 768px) {

    .stories-table th,
    .stories-table td {
        padding: 0.75rem;
    }

    .story-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .story-image-container {
        width: 50px;
        height: 65px;
    }

    .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
    }

    .icon-button {
        padding: 0.375rem;
        min-width: 36px;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .order-control {
        align-items: center;
    }

    .order-buttons {
        flex-direction: row;
        gap: 0.25rem;
    }

    .order-btn {
        width: 28px;
        height: 24px;
    }

    .table-container {
        margin: 0 -1rem;
        width: calc(100% + 2rem);
        border-radius: 0;
    }
}

.time-remaining {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
}

.time-text {
    font-weight: 600;
    color: #0f172a;
    font-size: 0.875rem;
}

.time-text.urgent {
    color: #dc2626;
    background: #fee2e2;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
}

.expired-text {
    font-size: 0.75rem;
    color: #991b1b;
    background: #fee2e2;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-weight: 500;
}

.warning-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 0.375rem;
    color: #92400e;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.warning-message svg {
    color: #f59e0b;
    flex-shrink: 0;
}

.icon-button.test-expire {
    background: #fef3c7;
    color: #d97706;
    font-size: 14px;
}

.icon-button.test-expire:hover {
    background: #fde68a;
}

.icon-button.test-reset {
    background: #dcfce7;
    color: #16a34a;
    font-size: 14px;
}

.icon-button.test-reset:hover {
    background: #bbf7d0;
}
</style>