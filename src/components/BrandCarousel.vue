<!-- BrandCarousel.vue -->
<template>
    <div class="brands-section">
        <h2 class="brands-title">DESCUBRE LAS MEJORES MARCAS</h2>
        <div class="carousel-container">
            <button @click="prevSlide" class="nav-button prev">
                <ChevronLeftIcon />
            </button>

            <div class="brands-carousel" :style="{ transform: `translateX(-${currentSlide * slideWidth}px)` }">
                <div v-for="(brand, index) in brands" :key="index" class="brand-item">
                    <img :src="brand.logo" :alt="brand.name" class="brand-logo" />
                </div>
            </div>

            <button @click="nextSlide" class="nav-button next">
                <ChevronRightIcon />
            </button>
        </div>

        <div class="carousel-dots">
            <button v-for="index in totalDots" :key="index" @click="goToSlide(index - 1)"
                :class="['dot', { active: Math.floor(currentSlide / brandsPerSlide) === index - 1 }]">
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';

const brands = [
    { name: 'CAROLINA HERRERA', logo: '/brands/carolina-herrera.png' },
    { name: 'RABANNE', logo: '/brands/rabanne.png' },
    { name: 'BOSS', logo: '/brands/boss.png' },
    { name: 'DIOR', logo: '/brands/dior.png' },
    { name: 'GUERLAIN', logo: '/brands/guerlain.png' },
    { name: 'GIVENCHY', logo: '/brands/givenchy.png' },
    // Añade más marcas según necesites
];

const currentSlide = ref(0);
const brandsPerSlide = 5;
const slideWidth = 200; // Ancho de cada marca en px
const autoplayInterval = ref<number | null>(null);

const totalSlides = computed(() => Math.ceil(brands.length / brandsPerSlide));
const totalDots = computed(() => Math.ceil(brands.length / brandsPerSlide));

const nextSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % (brands.length - brandsPerSlide + 1);
};

const prevSlide = () => {
    currentSlide.value = currentSlide.value === 0 ?
        brands.length - brandsPerSlide :
        currentSlide.value - 1;
};

const goToSlide = (index: number) => {
    currentSlide.value = index * brandsPerSlide;
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

onMounted(() => {
    startAutoplay();
});

onBeforeUnmount(() => {
    stopAutoplay();
});
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
    flex: 0 0 200px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.brand-logo {
    max-width: 150px;
    height: auto;
    filter: grayscale(100%);
    transition: all 0.3s ease;
}

.brand-logo:hover {
    filter: grayscale(0%);
    transform: scale(1.1);
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
</style>