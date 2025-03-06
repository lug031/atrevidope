<template>
    <MainLayout>
        <div class="about-container">
            <!-- Header Banner -->
            <div class="hero-banner-section">
                <div class="hero-banner">
                    <img src="/hero-banner.png" alt="Quiénes Somos" class="hero-image" />
                    <div class="hero-overlay">
                        <h1>QUIÉNES SOMOS</h1>
                        <p class="hero-subtitle">Nuestra pasión por la perfumería</p>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="about-content">
                <!-- Introduction Section -->
                <section class="intro-section">
                    <div class="intro-content">
                        <h2>Atrevido | Perfumería y más </h2>
                        <p class="intro-text">
                            En ATREVIDO, nos especializamos en la venta de perfumes originales y sellados para hombres y
                            mujeres en todo el Perú.
                            Ofrecemos una exclusiva selección de fragancias de perfumería árabe, diseñador y nicho,
                            garantizando autenticidad y
                            calidad en cada producto. Nuestro compromiso es brindar a nuestros clientes una experiencia
                            de compra confiable,
                            con precios competitivos y entregas seguras en todo el país. ¡Atrévete a destacar con la
                            fragancia perfecta y deja
                            una impresión inolvidable!
                        </p>
                    </div>
                    <div class="intro-image">
                        <img src="@/assets/cut_logo.png" alt="Nuestra tienda" />
                    </div>
                </section>

                <!-- Entregas Satisfactorias -->
                <section class="testimonials-section">
                    <h2 class="section-title">Lo Que Dicen Nuestros Clientes</h2>
                    <div class="separator centered"></div>

                    <div class="testimonial-slider" ref="testimonialSlider">
                        <div class="slider-container" ref="sliderContainer">
                            <!-- Testimonio 1 -->
                            <div class="testimonial-card" :class="{ active: activeTestimonial === 0 }">
                                <div class="testimonial-quote">
                                    <i class="fa-solid fa-quote-left"></i>
                                </div>
                                <div class="testimonial-content">
                                    <div class="testimonial-image">
                                        <img src="@/assets/cliente-1.jpg" alt="Tom Ford Tobacco Vanille" />
                                    </div>
                                    <p class="testimonial-text">Compré el Tom Ford Tobacco Vanille y puedo confirmar que
                                        es
                                        100% original. La fragancia es increíble y la duración supera las 12 horas.
                                        ¡ATREVIDO nunca decepciona!</p>
                                </div>
                                <div class="testimonial-author">
                                    <div class="icon-container">
                                        <UserIcon :size="48" class="author-icon" />
                                    </div>
                                    <div class="author-info">
                                        <h4>Joel Pinto</h4>
                                        <p>Compra: Tom Ford Tobacco Vanille</p>
                                        <div class="rating">
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Testimonio 2 -->
                            <div class="testimonial-card" :class="{ active: activeTestimonial === 1 }">
                                <div class="testimonial-quote">
                                    <i class="fa-solid fa-quote-left"></i>
                                </div>
                                <div class="testimonial-content">
                                    <div class="testimonial-image">
                                        <img src="@/assets/cliente-2.jpg" alt="Armaf Odyssey Mandarin Sky" />
                                    </div>
                                    <p class="testimonial-text">Siempre compro mis perfumes árabes en ATREVIDO. La
                                        calidad
                                        es excepcional y el servicio de entrega es rápido y seguro. Totalmente
                                        recomendado.</p>
                                </div>
                                <div class="testimonial-author">
                                    <div class="icon-container">
                                        <UserIcon :size="48" class="author-icon" />
                                    </div>
                                    <div class="author-info">
                                        <h4>Angelo Fajardo</h4>
                                        <p>Compra: Armaf Odyssey Mandarin Sky</p>
                                        <div class="rating">
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Testimonio 3 -->
                            <div class="testimonial-card" :class="{ active: activeTestimonial === 2 }">
                                <div class="testimonial-quote">
                                    <i class="fa-solid fa-quote-left"></i>
                                </div>
                                <div class="testimonial-content">
                                    <div class="testimonial-image">
                                        <img src="@/assets/cliente-3.jpg" alt="Dior Sauvage EDP" />
                                    </div>
                                    <p class="testimonial-text">Estuve buscando Dior Sauvage original a buen precio y
                                        encontré ATREVIDO. El perfume es auténtico, llegó perfectamente sellado y el
                                        aroma
                                        es exactamente como debe ser.</p>
                                </div>
                                <div class="testimonial-author">
                                    <div class="icon-container">
                                        <UserIcon :size="48" class="author-icon" />
                                    </div>
                                    <div class="author-info">
                                        <h4>Luis Torres</h4>
                                        <p>Compra: Dior Sauvage EDP</p>
                                        <div class="rating">
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Controles del slider -->
                        <div class="slider-controls">
                            <button class="slider-arrow prev" @click="prevTestimonial">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <div class="slider-dots">
                                <span v-for="n in 3" :key="n" class="dot"
                                    :class="{ active: activeTestimonial === n - 1 }" @click="setTestimonial(n - 1)">
                                </span>
                            </div>
                            <button class="slider-arrow next" @click="nextTestimonial">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Call To Action -->
                <section class="cta-section">
                    <div class="cta-content">
                        <h2>Atrevido | Perfumería y más</h2>
                        <p>Descubre nuestra exclusiva colección de fragancias y encuentra la que mejor exprese tu
                            personalidad.</p>
                        <div class="cta-buttons">
                            <router-link to="/web-products" class="cta-button primary">Ver Catálogo</router-link>
                            <router-link to="/contacto" class="cta-button secondary">Contáctanos</router-link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
import { UserIcon } from 'lucide-vue-next';
import { ref, onMounted, onUnmounted } from 'vue';

const activeTestimonial = ref(0);
const testimonialSlider = ref<HTMLElement | null>(null);
const sliderContainer = ref<HTMLElement | null>(null);
const autoSlideInterval = ref<number | null>(null);

// Métodos para controlar el slider
const nextTestimonial = () => {
    activeTestimonial.value = (activeTestimonial.value + 1) % 3;
    resetAutoSlide();
};

const prevTestimonial = () => {
    activeTestimonial.value = (activeTestimonial.value - 1 + 3) % 3;
    resetAutoSlide();
};

const setTestimonial = (index: any) => {
    activeTestimonial.value = index;
    resetAutoSlide();
};

// Funciones para el autoplay
const startAutoSlide = () => {
    autoSlideInterval.value = window.setInterval(() => {
        nextTestimonial();
    }, 5000); // Cambia de slide cada 5 segundos
};

const resetAutoSlide = () => {
    if (autoSlideInterval.value !== null) {
        window.clearInterval(autoSlideInterval.value);
        startAutoSlide();
    }
};

// Funciones para control táctil
const handleTouchStart = (event: TouchEvent) => {
    if (sliderContainer.value) {
        const touchStartX = event.touches[0].clientX;
        sliderContainer.value.setAttribute('data-start-x', touchStartX.toString());
    }
};

const handleTouchEnd = (event: TouchEvent) => {
    if (sliderContainer.value) {
        const touchEndX = event.changedTouches[0].clientX;
        const touchStartX = parseInt(sliderContainer.value.getAttribute('data-start-x') || '0');
        const difference = touchEndX - touchStartX;

        // Si el deslizamiento es mayor a 50px, cambiamos de slide
        if (Math.abs(difference) > 50) {
            if (difference > 0) {
                prevTestimonial(); // Deslizamiento hacia la derecha
            } else {
                nextTestimonial(); // Deslizamiento hacia la izquierda
            }
        }
    }
};

// Iniciar y limpiar en los hooks de ciclo de vida
onMounted(() => {
    // Iniciar autoplay
    startAutoSlide();

    // Añadir eventos touch
    if (sliderContainer.value) {
        sliderContainer.value.addEventListener('touchstart', handleTouchStart);
        sliderContainer.value.addEventListener('touchend', handleTouchEnd);
    }
});

onUnmounted(() => {
    // Limpiar intervalo
    if (autoSlideInterval.value !== null) {
        window.clearInterval(autoSlideInterval.value);
    }

    // Limpiar eventos touch
    if (sliderContainer.value) {
        sliderContainer.value.removeEventListener('touchstart', handleTouchStart);
        sliderContainer.value.removeEventListener('touchend', handleTouchEnd);
    }
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

/* Contenedor principal */
.about-container {
    padding: 0 20px;
}

/* Sección del banner */
.hero-banner-section {
    margin-bottom: 50px;
}

.hero-banner {
    position: relative;
    display: block;
    width: 100%;
    height: 300px;
    overflow: hidden;
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.hero-overlay h1 {
    color: white;
    font-size: 2.5rem;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
    color: white;
    font-size: 1.2rem;
    margin: 0;
    text-align: center;
    max-width: 600px;
}

/* Contenido principal */
.about-content {
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 60px;
}

/* Section title & separator */
.section-title {
    font-size: 1.8rem;
    text-align: center;
    color: #333;
    margin-bottom: 10px;
}

/* Sección de Introducción */
.intro-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 60px;
    align-items: center;
}

.intro-content h2 {
    font-size: 1.8rem;
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
}

.intro-text {
    font-size: 1.1rem;
    line-height: 1.7;
    color: #555;
}

.intro-image {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.intro-image img {
    width: 100%;
    height: auto;
    display: block;
}

/* Sección de Testimonios */
.testimonials-section {
    padding: 80px 0;
}

.testimonial-slider {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
    overflow: hidden;
}

.slider-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

.testimonial-card {
    background-color: white;
    border-radius: 15px;
    padding: 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    max-width: 600px;
    width: 100%;
    opacity: 0;
    position: absolute;
    transition: all 0.5s ease;
    transform: translateX(100px);
}

.testimonial-card.active {
    opacity: 1;
    position: relative;
    transform: translateX(0);
}

.testimonial-quote {
    font-size: 2rem;
    color: #000;
    opacity: 0.2;
    margin-bottom: 20px;
}

.testimonial-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}

.testimonial-image {
    width: 350px;
    height: 250px;
    margin-bottom: 20px;
    overflow: hidden;
}

.testimonial-image img {
    width: auto;
    height: 100%;
    max-width: 100%;
    object-fit: contain;
    display: block;
    margin: 0 auto;
}

.testimonial-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #555;
    font-style: italic;
    margin-bottom: 10px;
    text-align: center;
}

.icon-container {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    border-radius: 50%;
    margin-right: 15px;
}

.author-icon {
    color: #333;
}

.testimonial-author {
    display: flex;
    align-items: center;
    gap: 20px;
    border-top: 1px solid #eee;
    padding-top: 20px;
    width: 100%;
}

.author-image {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #f5f5f5;
}

.author-info h4 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
}

.author-info p {
    margin: 5px 0 10px;
    font-size: 0.9rem;
    color: #777;
}

.rating {
    color: gold;
    font-size: 0.9rem;
}

.slider-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 30px;
    gap: 20px;
}

.slider-arrow {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #333;
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
}

.slider-arrow:hover {
    background-color: #000;
    color: white;
}

/* Sección de Call to Action */
.cta-section {
    background-color: #f8f8f8;
    border-radius: 12px;
    padding: 60px 40px;
    margin-top: 40px;
}

.cta-content {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.cta-content h2 {
    font-size: 2rem;
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
}

.cta-content p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #555;
    margin-bottom: 30px;
}

.cta-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
}

.cta-button {
    display: inline-block;
    padding: 14px 30px;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
}

.cta-button.primary {
    background-color: #000;
    color: white;
}

.cta-button.secondary {
    background-color: transparent;
    color: #000;
    border: 2px solid #000;
}

.cta-button.primary:hover {
    background-color: #333;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.cta-button.secondary:hover {
    background-color: #f0f0f0;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

/* Responsive */
@media (max-width: 992px) {
    .intro-section {
        grid-template-columns: 1fr;
    }

    .intro-image {
        order: -1;
    }

    .cta-buttons {
        flex-direction: column;
        max-width: 300px;
        margin: 0 auto;
    }
}

/* Animaciones para los testimonios */
@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Estilos responsive para testimonios */
@media (max-width: 768px) {
    .testimonial-card {
        padding: 30px;
    }

    .testimonial-text {
        font-size: 1rem;
    }

    .author-image {
        width: 60px;
        height: 60px;
    }

    .slider-container {
        min-height: 520px;
    }

    .testimonial-image {
        width: 120px;
        height: 120px;
    }
}

@media (max-width: 480px) {
    .testimonial-card {
        padding: 20px;
    }

    .testimonial-author {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .slider-container {
        min-height: 580px;
    }

    .testimonial-image {
        width: 100px;
        height: 100px;
    }
}

@media (max-width: 768px) {
    .hero-banner {
        height: 200px;
    }

    .hero-overlay h1 {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }
}
</style>