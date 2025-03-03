<template>
    <div class="brands-section">
        <h2 class="brands-title">DESCUBRE LAS MEJORES MARCAS</h2>
        <div v-if="loading" class="loading-container">
            <div class="loader"></div>
        </div>
        <div v-else-if="error" class="error-message">
            No se pudieron cargar las marcas
        </div>
        <div v-else-if="brandsCarousel.length > 0" class="carousel-container">
            <button @click="prevSlide" class="nav-button prev">
                <ChevronLeftIcon />
            </button>

            <div class="brands-carousel" :style="{ transform: `translateX(-${currentSlide * slideWidth}px)` }">
                <div v-for="brand in brandsCarousel" :key="brand.id" class="brand-item" :style="{ width: slideWidth + 'px' }">
                    <router-link :to="{ name: 'BrandProducts', params: { brandId: brand.id } }" class="brand-link">
                        <img v-if="brandLogos[brand.id]" :src="brandLogos[brand.id]" :alt="brand.name"
                            class="brand-logo" />
                        <div v-else class="brand-placeholder">{{ brand.name }}</div>
                    </router-link>
                </div>
            </div>

            <button @click="nextSlide" class="nav-button next">
                <ChevronRightIcon />
            </button>
        </div>

        <!-- <div v-if="brandsCarousel.length > 0" class="carousel-dots">
            <button v-for="index in totalDots" :key="index" @click="goToSlide(index - 1)"
                :class="['dot', { active: Math.floor(currentSlide / brandsPerSlide) === index - 1 }]">
            </button>
        </div> -->
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
import { useBrands } from '@/composables/useBrands';
import { getUrl } from 'aws-amplify/storage';

// Usar el composable de marcas
const { brandsCarousel, loading, error, loadBrandsCarousel } = useBrands();
const brandLogos = ref<Record<string, string>>({});

const currentSlide = ref(0);
const brandsPerSlide = ref(5); // Será ajustado según el ancho de la pantalla
const slideWidth = ref(200);
const autoplayInterval = ref<number | null>(null);

const totalSlides = computed(() => {
    if (!brandsCarousel.value || brandsCarousel.value.length === 0) return 0;
    return Math.max(1, Math.ceil(brandsCarousel.value.length - brandsPerSlide.value + 1));
});

const totalDots = computed(() => {
    if (!brandsCarousel.value || brandsCarousel.value.length === 0) return 0;
    return Math.ceil(brandsCarousel.value.length / brandsPerSlide.value);
});

const nextSlide = () => {
    if (brandsCarousel.value.length <= brandsPerSlide.value) return;

    if (currentSlide.value >= brandsCarousel.value.length - brandsPerSlide.value) {
        currentSlide.value = 0; // Volver al inicio cuando llegamos al final
    } else {
        currentSlide.value++;
    }
};

const prevSlide = () => {
    if (brandsCarousel.value.length <= brandsPerSlide.value) return;

    if (currentSlide.value === 0) {
        currentSlide.value = brandsCarousel.value.length - brandsPerSlide.value; // Ir al final cuando estamos al inicio
    } else {
        currentSlide.value--;
    }
};

const goToSlide = (index: number) => {
    const maxSlide = Math.max(0, brandsCarousel.value.length - brandsPerSlide.value);
    currentSlide.value = Math.min(maxSlide, index * brandsPerSlide.value);
};

const startAutoplay = () => {
    stopAutoplay();
    autoplayInterval.value = window.setInterval(nextSlide, 3000);
};

const stopAutoplay = () => {
    if (autoplayInterval.value) {
        clearInterval(autoplayInterval.value);
        autoplayInterval.value = null;
    }
};

// Cargar los logos de las marcas
const loadBrandLogos = async () => {
    try {
        for (const brand of brandsCarousel.value) {
            if (brand.logo) {
                try {
                    const { url } = await getUrl({ path: brand.logo });
                    brandLogos.value[brand.id] = url.toString();
                } catch (error) {
                    console.error(`Error cargando logo para marca ${brand.id}:`, error);
                }
            }
        }
    } catch (err) {
        console.error("Error cargando logos de marcas:", err);
    }
};

// Ajustar número de marcas por slide según el ancho de la pantalla
const adjustBrandsPerSlide = () => {
    const width = window.innerWidth;
    if (width < 600) {
        brandsPerSlide.value = 1;
        slideWidth.value = width - 80; // Considerar el padding y botones
    } else if (width < 900) {
        brandsPerSlide.value = 2;
        slideWidth.value = (width - 80) / 2;
    } else if (width < 1200) {
        brandsPerSlide.value = 3;
        slideWidth.value = (width - 80) / 3;
    } else {
        brandsPerSlide.value = 5;
        slideWidth.value = (Math.min(width, 1200) - 80) / 5;
    }
};

// Escuchar cambios en el tamaño de la ventana
let resizeListener: EventListener;

onMounted(async () => {
    // Cargar las marcas
    await loadBrandsCarousel();

    // Cargar los logos
    await loadBrandLogos();

    // Ajustar según el ancho de la pantalla
    adjustBrandsPerSlide();

    // Escuchar cambios en el tamaño de la ventana
    resizeListener = () => {
        adjustBrandsPerSlide();
        // Asegurar que el currentSlide no exceda el máximo
        if (brandsCarousel.value.length > brandsPerSlide.value) {
            const maxSlide = brandsCarousel.value.length - brandsPerSlide.value;
            currentSlide.value = Math.min(currentSlide.value, maxSlide);
        } else {
            currentSlide.value = 0;
        }
    };

    window.addEventListener('resize', resizeListener);

    // Iniciar autoplay
    startAutoplay();
});

onBeforeUnmount(() => {
    stopAutoplay();
    if (resizeListener) {
        window.removeEventListener('resize', resizeListener);
    }
});

// Observar cambios en las marcas para cargar sus logos
watch(brandsCarousel, async () => {
    if (brandsCarousel.value.length > 0) {
        await loadBrandLogos();
    }
}, { immediate: true });
</script>

<style scoped>
.brands-section {
    padding: 40px 0;
    background-color: #fff;
}

.brands-title {
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 40px;
    letter-spacing: 2px;
}

.carousel-container {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    overflow: hidden;
    padding: 0 40px;
}

.brands-carousel {
    display: flex;
    transition: transform 0.5s ease-in-out;
}

.brand-item {
    flex: 0 0 auto;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    /* Altura fija para cada elemento del carrusel */
}

.brand-link {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
}

.brand-link:hover {
    transform: scale(1.05);
}

.brand-logo {
    max-width: 180px;
    /* Aumentado de 150px */
    max-height: 100px;
    /* Aumentado de 80px */
    filter: grayscale(100%);
    transition: all 0.3s ease;
    object-fit: contain;
}

.brand-placeholder {
    width: 180px;
    /* Aumentado de 150px */
    height: 100px;
    /* Aumentado de 80px */
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f1f1f1;
    border-radius: 8px;
    font-weight: bold;
    color: #666;
    filter: grayscale(100%);
    transition: all 0.3s ease;
}

.brand-logo:hover,
.brand-placeholder:hover {
    filter: grayscale(0%);
}

.nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background-color: #000;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 1;
}

.nav-button:hover {
    background-color: #333;
}

.nav-button.prev {
    left: 0;
}

.nav-button.next {
    right: 0;
}

.carousel-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ddd;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dot.active {
    background-color: #000;
    transform: scale(1.2);
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 150px;
}

.loader {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #000;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.error-message {
    text-align: center;
    color: #e53e3e;
    padding: 20px;
    font-weight: bold;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .brand-item {
        height: 100px;
    }

    .brand-logo {
        max-width: 150px;
        max-height: 80px;
    }

    .brand-placeholder {
        width: 150px;
        height: 80px;
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .brand-item {
        height: 90px;
    }

    .brand-logo {
        max-width: 120px;
        max-height: 70px;
    }

    .brand-placeholder {
        width: 120px;
        height: 70px;
        font-size: 0.8rem;
    }
}
</style>