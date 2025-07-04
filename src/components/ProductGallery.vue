<template>
    <div class="product-gallery-container">
        <!-- Imagen principal -->
        <div class="main-image-container group">
            <div class="image-wrapper">
                <img :src="currentImage" :alt="product?.name || 'Producto'" class="main-image" @load="handleImageLoad"
                    @error="handleImageError" />

                <!-- Overlay con efectos hover -->
                <div class="image-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="overlay-content">
                        <button @click="openLightbox" class="zoom-button" :disabled="!currentImage">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Indicadores de navegación (solo si hay más de una imagen) -->
                <div v-if="images.length > 1" class="navigation-arrows">
                    <button @click="previousImage" class="nav-arrow nav-arrow-left" :disabled="currentIndex === 0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7">
                            </path>
                        </svg>
                    </button>

                    <button @click="nextImage" class="nav-arrow nav-arrow-right"
                        :disabled="currentIndex === images.length - 1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">
                            </path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Indicadores de puntos -->
            <div v-if="images.length > 1" class="dots-container">
                <button v-for="(_, index) in images" :key="index" @click="setCurrentImage(index)" class="dot"
                    :class="{ 'dot-active': index === currentIndex }"></button>
            </div>
        </div>

        <!-- Miniaturas -->
        <!--<div v-if="images.length > 1" class="thumbnails-container">
            <div class="thumbnails-grid">
                <button v-for="(image, index) in images" :key="index" @click="setCurrentImage(index)" class="thumbnail"
                    :class="{ 'thumbnail-active': index === currentIndex }">
                    <img :src="image" :alt="`${product?.name || 'Producto'} - imagen ${index + 1}`"
                        class="thumbnail-image" />
                </button>
            </div>
        </div>-->

        <!-- Lightbox Modal -->
        <Teleport to="body">
            <div v-if="showLightbox" class="lightbox-overlay" @click="closeLightbox">
                <div class="lightbox-container">
                    <button @click="closeLightbox" class="lightbox-close">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>

                    <div class="lightbox-content" @click.stop>
                        <img :src="currentImage" :alt="product?.name || 'Producto'" class="lightbox-image" />
                    </div>

                    <!-- Navegación en lightbox -->
                    <!--<div v-if="images.length > 1" class="lightbox-navigation">
                        <button @click="previousImage" class="lightbox-nav-button lightbox-nav-left"
                            :disabled="currentIndex === 0">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>

                        <button @click="nextImage" class="lightbox-nav-button lightbox-nav-right"
                            :disabled="currentIndex === images.length - 1">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">
                                </path>
                            </svg>
                        </button>
                    </div>-->
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Product } from '@/types/product.types'

interface Props {
    product?: Product
    images: string[]
    autoSlide?: boolean
    autoSlideInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
    images: () => [],
    autoSlide: false,
    autoSlideInterval: 5000
})

const currentIndex = ref(0)
const showLightbox = ref(false)
const autoSlideTimer = ref<NodeJS.Timeout | null>(null)

const currentImage = computed(() => {
    return props.images[currentIndex.value] || '/api/placeholder/600/750'
})

const setCurrentImage = (index: number) => {
    if (index >= 0 && index < props.images.length) {
        currentIndex.value = index
    }
}

const nextImage = () => {
    if (currentIndex.value < props.images.length - 1) {
        currentIndex.value++
    }
}

const previousImage = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--
    }
}

const openLightbox = () => {
    showLightbox.value = true
    document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
    showLightbox.value = false
    document.body.style.overflow = 'auto'
}

const handleImageLoad = () => {
    // Agregar cualquier lógica después de cargar la imagen
}

const handleImageError = () => {
    console.error('Error loading image')
}

const handleKeydown = (event: KeyboardEvent) => {
    if (showLightbox.value) {
        switch (event.key) {
            case 'Escape':
                closeLightbox()
                break
            case 'ArrowLeft':
                previousImage()
                break
            case 'ArrowRight':
                nextImage()
                break
        }
    }
}

const startAutoSlide = () => {
    if (props.autoSlide && props.images.length > 1) {
        autoSlideTimer.value = setInterval(() => {
            if (currentIndex.value < props.images.length - 1) {
                currentIndex.value++
            } else {
                currentIndex.value = 0
            }
        }, props.autoSlideInterval)
    }
}

const stopAutoSlide = () => {
    if (autoSlideTimer.value) {
        clearInterval(autoSlideTimer.value)
        autoSlideTimer.value = null
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    startAutoSlide()
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    stopAutoSlide()
    document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.product-gallery-container {
    width: 100%;
    max-width: 42rem;
    /* max-w-2xl */
    margin-left: auto;
    margin-right: auto;
}

.main-image-container {
    position: relative;
    margin-bottom: 1rem;
    /* mb-4 */
}

.image-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 0.5rem;
    /* rounded-lg */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    /* shadow-lg */
    aspect-ratio: 4 / 5;
}

.main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-image:hover {
    transform: scale(1.05);
}

.image-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.overlay-content {
    display: flex;
    gap: 1rem;
}

.zoom-button {
    background: rgba(255, 255, 255, 0.9);
    color: #1f2937;
    /* text-gray-800 */
    padding: 0.75rem;
    border-radius: 9999px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
}

.zoom-button:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.zoom-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.navigation-arrows {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 1rem;
    padding-right: 1rem;
    pointer-events: none;
}

.nav-arrow {
    background: rgba(255, 255, 255, 0.8);
    color: #1f2937;
    padding: 0.5rem;
    border-radius: 9999px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.2s;
    pointer-events: auto;
}

.nav-arrow:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
}

.nav-arrow:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.nav-arrow-left {
    transform: translateX(-0.5rem);
}

.nav-arrow-left:hover {
    transform: translateX(0);
}

.nav-arrow-right {
    transform: translateX(0.5rem);
}

.nav-arrow-right:hover {
    transform: translateX(0);
}

.dots-container {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
}

.dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 9999px;
    border: 2px solid #d1d5db;
    /* border-gray-300 */
    background: #fff;
    transition: all 0.3s;
}

.dot:hover {
    transform: scale(1.1);
}

.dot-active {
    background: #1f2937;
    /* bg-gray-800 */
    border-color: #1f2937;
    transform: scale(1.1);
}

.thumbnails-container {
    margin-top: 1.5rem;
}

.thumbnails-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.5rem;
}

@media (min-width: 640px) {
    .thumbnails-grid {
        gap: 0.75rem;
    }
}

.thumbnail {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 0.375rem;
    border: 2px solid #e5e7eb;
    transition: all 0.3s;
    aspect-ratio: 1 / 1;
}

.thumbnail:hover {
    border-color: #9ca3af;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.thumbnail-active {
    border-color: #1f2937;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    transform: scale(1.05);
}

.thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.3s;
}

.thumbnail-image:hover {
    transform: scale(1.1);
}

/* Lightbox Styles */
.lightbox-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    animation-fill-mode: both;
    animation: fadeIn 0.3s ease-out;
}

.lightbox-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.lightbox-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.5rem;
    border-radius: 9999px;
    transition: all 0.2s;
    z-index: 10;
}

.lightbox-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.lightbox-content {
    max-width: 30rem;
    max-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lightbox-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation-fill-mode: both;
    animation: zoomIn 0.3s ease-out;
}

.lightbox-navigation {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 2rem;
    padding-right: 2rem;
    pointer-events: none;
}

.lightbox-nav-button {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.75rem;
    border-radius: 9999px;
    transition: all 0.2s;
    pointer-events: auto;
}

.lightbox-nav-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.lightbox-nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.lightbox-nav-left {
    transform: translateX(-1rem);
}

.lightbox-nav-left:hover {
    transform: translateX(0);
}

.lightbox-nav-right {
    transform: translateX(1rem);
}

.lightbox-nav-right:hover {
    transform: translateX(0);
}

/* Responsive Design */
@media (max-width: 640px) {
    .thumbnails-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .navigation-arrows {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }

    .lightbox-navigation {
        padding-left: 1rem;
        padding-right: 1rem;
    }
}

/* Animaciones personalizadas */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes zoomIn {
    from {
        transform: scale(0.75);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.animate-in {
    animation-fill-mode: both;
}

.fade-in {
    animation: fadeIn 0.3s ease-out;
}

.zoom-in-75 {
    animation: zoomIn 0.3s ease-out;
}
</style>