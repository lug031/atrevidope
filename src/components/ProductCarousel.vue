<template>
    <div class="carousel-container">
        <!-- Slides -->
        <div class="slides-container" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="(product, index) in allProductsCarousel" :key="product.id" class="slide"
                :style="{ left: `${index * 100}%` }">
                <div class="slide-content">
                    <img :src="imageCache[product.id] || '/api/placeholder/800/500'" :alt="product.name"
                        class="slide-image" loading="lazy" />
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
import { useProducts } from '@/composables/useProducts';
import { useImageCache } from '@/composables/useImageCache';

const router = useRouter();
const currentSlide = ref(0);
const autoplayInterval = ref<number | null>(null);

const { allProductsCarousel, loadAllProductsCarousel } = useProducts();
const { imageCache, preloadImages } = useImageCache();

// Optimizada la función de carga de imágenes
const loadImageUrls = async () => {
    if (!allProductsCarousel.value) return;

    const productsToLoad = allProductsCarousel.value
        .filter(product => product.imageUrl)
        .map(product => ({
            id: product.id,
            imageUrl: product.imageUrl || ''
        }));

    await preloadImages(productsToLoad);
};

// Función para precargar la siguiente imagen
const preloadNextImage = () => {
    if (!allProductsCarousel.value) return;

    const nextIndex = (currentSlide.value + 1) % allProductsCarousel.value.length;
    const nextProduct = allProductsCarousel.value[nextIndex];

    if (nextProduct && nextProduct.imageUrl) {
        preloadImages([{
            id: nextProduct.id,
            imageUrl: nextProduct.imageUrl
        }]);
    }
};

const nextSlide = () => {
    if (!allProductsCarousel.value) return;
    currentSlide.value = (currentSlide.value + 1) % allProductsCarousel.value.length;
    preloadNextImage(); // Precargar la siguiente imagen
};

const prevSlide = () => {
    if (!allProductsCarousel.value) return;
    currentSlide.value = currentSlide.value === 0 ? allProductsCarousel.value.length - 1 : currentSlide.value - 1;
};

const goToSlide = (index: number) => {
    currentSlide.value = index;
    preloadNextImage(); // Precargar la siguiente imagen cuando se cambia manualmente
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
    await loadAllProductsCarousel();
    await loadImageUrls();
    startAutoplay();
});

onBeforeUnmount(() => {
    stopAutoplay();
});

// Observar cambios en los productos
watch(() => allProductsCarousel.value, async (newProducts) => {
    if (newProducts && newProducts.length > 0) {
        await loadImageUrls();
    }
}, { immediate: true });

// Observar cambios en el slide actual para precargar la siguiente imagen
watch(() => currentSlide.value, () => {
    preloadNextImage();
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

/* Animaciones para transiciones de slides */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(1.1);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.slide-enter-active {
    animation: fadeIn 0.5s ease-out;
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