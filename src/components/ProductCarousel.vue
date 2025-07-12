<template>
    <div class="carousel-container">
        <!-- Skeleton Loading -->
        <div v-if="isInitialLoading" class="carousel-skeleton">
            <div class="skeleton-slide">
                <div class="skeleton-image"></div>
                <div class="skeleton-overlay">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-button"></div>
                </div>
            </div>
            <div class="skeleton-nav-buttons">
                <div class="skeleton-nav-button skeleton-nav-left"></div>
                <div class="skeleton-nav-button skeleton-nav-right"></div>
            </div>
            <div class="skeleton-dots">
                <div v-for="i in 3" :key="i" class="skeleton-dot"></div>
            </div>
        </div>

        <template v-else>
            <!-- Slides -->
            <div class="slides-container" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                <div v-for="(product, index) in allProductsCarousel" :key="product.id" class="slide"
                    :style="{ left: `${index * 100}%` }">
                    <div class="slide-content">
                        <!-- Mostrar placeholder mientras carga -->
                        <div v-if="!getCachedImage(product.id)" class="slide-placeholder">
                            <div class="loading-spinner"></div>
                        </div>
                        <img v-else :src="getCachedImage(product.id)" :alt="product.name" class="slide-image"
                            loading="lazy" @load="onImageLoad(product.id)" @error="onImageError(product.id)" />
                        <div class="slide-overlay">
                            <div class="slide-text">
                                <h2>{{ product.name }}</h2>
                                <button @click="router.push(`/product/${product.id}`)" class="discover-button">
                                    VER
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation Arrows -->
            <button @click="prevSlide" class="nav-button prev">
                <ChevronLeftIcon />
            </button>
            <button @click="nextSlide" class="nav-button next">
                <ChevronRightIcon />
            </button>

            <!-- Dots Navigation -->
            <div class="carousel-dots">
                <button v-for="(_, index) in allProductsCarousel" :key="index" @click="goToSlide(index)"
                    :class="['dot', { active: index === currentSlide }]" :aria-label="`Go to slide ${index + 1}`">
                </button>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
import { useProducts } from '@/composables/useProducts';
import { useImageCache } from '@/composables/useImageCache';

const isInitialLoading = ref(true)
const router = useRouter();
const currentSlide = ref(0);
const autoplayInterval = ref<number | null>(null);
const loadedImages = ref<Set<string>>(new Set());

const { allProductsCarousel, loadAllProductsCarousel } = useProducts();
const { imageCache, getImageUrl, preloadImage, getCachedImage } = useImageCache();

// Cargar imágenes de manera inteligente
const loadImageUrls = async () => {
    if (!allProductsCarousel.value?.length) return;

    // Primero cargar la imagen actual
    const currentProduct = allProductsCarousel.value[currentSlide.value];
    if (currentProduct?.imageUrl) {
        await getImageUrl(currentProduct.id, currentProduct.imageUrl);
        isInitialLoading.value = false; // Agregar esta línea
    }

    // Luego cargar las siguientes 2 imágenes en segundo plano
    const totalSlides = allProductsCarousel.value.length;
    for (let i = 1; i <= 2; i++) {
        const nextIndex = (currentSlide.value + i) % totalSlides;
        const nextProduct = allProductsCarousel.value[nextIndex];
        if (nextProduct?.imageUrl) {
            // Precargar sin esperar
            preloadImage(nextProduct.id, nextProduct.imageUrl);
        }
    }

    // Finalmente cargar el resto de manera asíncrona
    setTimeout(() => {
        allProductsCarousel.value.forEach((product, index) => {
            if (product.imageUrl && index !== currentSlide.value) {
                preloadImage(product.id, product.imageUrl);
            }
        });
    }, 100);
};

const onImageLoad = (productId: string) => {
    loadedImages.value.add(productId);
};

const onImageError = (productId: string) => {
    console.error(`Error loading image for product ${productId}`);
};

// Precargar la siguiente imagen antes de cambiar
const preloadNextImage = async () => {
    if (!allProductsCarousel.value?.length) return;

    const nextIndex = (currentSlide.value + 1) % allProductsCarousel.value.length;
    const nextProduct = allProductsCarousel.value[nextIndex];

    if (nextProduct?.imageUrl && !getCachedImage(nextProduct.id)) {
        await getImageUrl(nextProduct.id, nextProduct.imageUrl);
    }
};

const nextSlide = async () => {
    if (!allProductsCarousel.value?.length) return;

    // Precargar la siguiente imagen antes de cambiar
    await preloadNextImage();

    currentSlide.value = (currentSlide.value + 1) % allProductsCarousel.value.length;
};

const prevSlide = async () => {
    if (!allProductsCarousel.value?.length) return;

    const prevIndex = currentSlide.value === 0 ? allProductsCarousel.value.length - 1 : currentSlide.value - 1;
    const prevProduct = allProductsCarousel.value[prevIndex];

    // Precargar la imagen anterior si no está cargada
    if (prevProduct?.imageUrl && !getCachedImage(prevProduct.id)) {
        await getImageUrl(prevProduct.id, prevProduct.imageUrl);
    }

    currentSlide.value = prevIndex;
};

const goToSlide = async (index: number) => {
    if (!allProductsCarousel.value?.length) return;

    const targetProduct = allProductsCarousel.value[index];

    // Precargar la imagen del slide objetivo
    if (targetProduct?.imageUrl && !getCachedImage(targetProduct.id)) {
        await getImageUrl(targetProduct.id, targetProduct.imageUrl);
    }

    currentSlide.value = index;
};

const startAutoplay = () => {
    stopAutoplay();
    autoplayInterval.value = window.setInterval(nextSlide, 5000);
};

const stopAutoplay = () => {
    if (autoplayInterval.value) {
        clearInterval(autoplayInterval.value);
        autoplayInterval.value = null;
    }
};

onMounted(async () => {
    isInitialLoading.value = true; // Agregar al inicio

    // Cargar productos primero
    await loadAllProductsCarousel();

    // Esperar a que Vue actualice el DOM
    await nextTick();

    // Cargar imágenes de manera inteligente
    await loadImageUrls();

    // Iniciar autoplay después de cargar las imágenes iniciales
    startAutoplay();
});

onBeforeUnmount(() => {
    stopAutoplay();
});

// Observar cambios en los productos
watch(() => allProductsCarousel.value, async (newProducts) => {
    if (newProducts?.length > 0) {
        await loadImageUrls();
    }
}, { immediate: false });

// Precargar imágenes cuando cambia el slide
watch(() => currentSlide.value, () => {
    // Precargar la siguiente imagen en background
    setTimeout(preloadNextImage, 100);
});
</script>

<style scoped>
.carousel-container {
    position: relative;
    width: 100%;
    height: 600px;
    overflow: hidden;
    background-color: #000;
}

.slides-container {
    position: relative;
    height: 100%;
    width: 100%;
    transition: transform 0.5s ease-in-out;
}

.slide {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.slide-content {
    position: relative;
    width: 100%;
    height: 100%;
}

.slide-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.slide-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease-in-out;
}

.slide:hover .slide-image {
    transform: scale(1.05);
}

.slide-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom,
            rgba(0, 0, 0, 0.2) 0%,
            rgba(0, 0, 0, 0.5) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.slide-text {
    text-align: center;
    color: #fff;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.5s ease-in-out;
}

.slide:hover .slide-text {
    opacity: 1;
    transform: translateY(0);
}

.slide-text h2 {
    font-size: 3.5rem;
    font-family: serif;
    margin-bottom: 2rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.discover-button {
    background-color: #fff;
    color: #000;
    padding: 15px 40px;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.discover-button:hover {
    background-color: #000;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.8);
    color: #000;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    opacity: 0;
}

.carousel-container:hover .nav-button {
    opacity: 1;
}

.nav-button:hover {
    background-color: #fff;
    transform: translateY(-50%) scale(1.1);
}

.nav-button.prev {
    left: 20px;
}

.nav-button.next {
    right: 20px;
}

.carousel-dots {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
    background-color: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
}

.dot:hover {
    background-color: rgba(255, 255, 255, 0.5);
}

.dot.active {
    background-color: #fff;
    transform: scale(1.2);
}

.carousel-skeleton {
    position: relative;
    width: 100%;
    height: 100%;
    background: #f0f0f0;
    overflow: hidden;
}

.skeleton-slide {
    position: relative;
    width: 100%;
    height: 100%;
}

.skeleton-image {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 2s infinite;
}

.skeleton-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}

.skeleton-title {
    width: 300px;
    height: 40px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 2s infinite;
    border-radius: 4px;
    margin-bottom: 20px;
}

.skeleton-button {
    width: 120px;
    height: 45px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 2s infinite;
    border-radius: 4px;
    margin: 0 auto;
}

.skeleton-nav-buttons {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
}

.skeleton-nav-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 2s infinite;
}

.skeleton-dots {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
}

.skeleton-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 2s infinite;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

/* Responsive skeleton */
@media (max-width: 768px) {
    .skeleton-title {
        width: 250px;
        height: 35px;
    }

    .skeleton-button {
        width: 100px;
        height: 40px;
    }

    .skeleton-nav-button {
        width: 40px;
        height: 40px;
    }
}

@media (max-width: 480px) {
    .skeleton-title {
        width: 200px;
        height: 30px;
    }

    .skeleton-button {
        width: 90px;
        height: 35px;
    }

    .skeleton-nav-button {
        width: 35px;
        height: 35px;
    }
}

/* Estilos responsivos */
@media (max-width: 768px) {
    .carousel-container {
        height: 400px;
    }

    .slide-text h2 {
        font-size: 2.5rem;
    }

    .discover-button {
        padding: 12px 30px;
    }

    .nav-button {
        width: 40px;
        height: 40px;
    }
}

@media (max-width: 480px) {
    .carousel-container {
        height: 300px;
    }

    .slide-text h2 {
        font-size: 2rem;
    }

    .discover-button {
        padding: 10px 25px;
        font-size: 0.9rem;
    }

    .nav-button {
        width: 35px;
        height: 35px;
    }
}
</style>