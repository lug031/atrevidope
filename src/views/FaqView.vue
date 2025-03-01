<template>
    <MainLayout>
        <div class="faq-container">
            <!-- Header Banner -->
            <div class="hero-banner-section">
                <div class="hero-banner">
                    <img src="/hero-banner.png" alt="Preguntas Frecuentes" class="hero-image" />
                    <div class="hero-overlay">
                        <h1>PREGUNTAS FRECUENTES</h1>
                        <p class="hero-subtitle">Todo lo que necesitas saber sobre nuestros productos y servicios</p>
                    </div>
                </div>
            </div>

            <!-- FAQ Content -->
            <div class="faq-content">
                <!-- Search Bar -->
                <div class="search-section">
                    <div class="search-container">
                        <input type="text" v-model="searchQuery" placeholder="Buscar preguntas frecuentes..."
                            class="search-input" />
                        <button class="search-button">
                            <SearchIcon class="search-icon" :size="20" />
                        </button>
                    </div>
                </div>

                <!-- Categories -->
                <div class="categories-section">
                    <div class="categories-container">
                        <button v-for="category in categories" :key="category.id" @click="selectCategory(category.id)"
                            :class="['category-button', { active: selectedCategory === category.id }]">
                            {{ category.name }}
                        </button>
                    </div>
                </div>

                <!-- FAQ Questions -->
                <div class="faq-section">
                    <div v-if="loading" class="loading-state">
                        <span class="loader"></span>
                    </div>

                    <div v-else-if="error" class="error-state">
                        Lo sentimos, ha ocurrido un error al cargar las preguntas frecuentes.
                    </div>

                    <div v-else-if="filteredFaqs.length === 0" class="empty-state">
                        No se encontraron preguntas que coincidan con tu búsqueda.
                    </div>

                    <div v-else class="faq-list">
                        <div v-for="faq in filteredFaqs" :key="faq.id" class="faq-item">
                            <div class="faq-question" :class="{ 'active': openFaq === faq.id }"
                                @click="toggleFaq(faq.id)">
                                <h3>{{ faq.question }}</h3>
                                <span class="toggle-icon">{{ openFaq === faq.id ? '−' : '+' }}</span>
                            </div>
                            <div class="faq-answer" :class="{ 'open': openFaq === faq.id }">
                                <div class="formatted-description" v-html="parseMarkdown(faq.answer)"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contact Section -->
                <div class="contact-section">
                    <div class="contact-card">
                        <h2>¿No encontraste lo que buscabas?</h2>
                        <p>Nuestro equipo <strong>Atrevido</strong> de atención al cliente está listo para ayudarte con cualquier duda adicional.
                        </p>
                        <router-link to="/contacto" class="contact-button">Contáctanos</router-link>
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useToast } from '@/composables/useToast';
import { SearchIcon } from 'lucide-vue-next';

// Estados
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedCategory = ref('all');
const openFaq = ref<string | null>(null);
const { showToast } = useToast();

// Datos de ejemplo (normalmente vendrían de una API)
const categories = ref([
    { id: 'all', name: 'Todas' },
    { id: 'orders', name: 'Pedidos' },
    { id: 'shipping', name: 'Envíos' },
    /*{ id: 'returns', name: 'Devoluciones' },*/
    { id: 'products', name: 'Productos' },
    { id: 'payments', name: 'Pagos' }
]);

const faqs = ref([
    {
        id: '1',
        category: 'orders',
        question: '¿Cómo puedo realizar un pedido?',
        answer: 'Para realizar un pedido, simplemente navega por nuestra tienda, elige los productos que deseas y agrégalos a tu carrito. Cuando estés listo para finalizar tu compra, haz clic en el icono del carrito y sigue los pasos para completar el **proceso de pago**.'
    },
    {
        id: '2',
        category: 'shipping',
        question: '¿Cuánto tiempo tarda en llegar mi pedido?',
        answer: 'Los tiempos de entrega dependen de tu ubicación:\n\n* **Lima Metropolitana**: 1-2 días hábiles\n* **Provincias principales**: 3-5 días hábiles\n* **Otras localidades**: 5-7 días hábiles.'
    },
    /*{
        id: '3',
        category: 'returns',
        question: '¿Cuál es la política de devoluciones?',
        answer: 'Aceptamos devoluciones dentro de los **30 días** posteriores a la recepción de tu pedido. El producto debe estar en su estado original, sin usar y con todas las etiquetas. Para iniciar una devolución, por favor contacta a nuestro servicio de atención al cliente a través del formulario de contacto o por WhatsApp.'
    },*/
    {
        id: '4',
        category: 'products',
        question: '¿Cómo sé si un producto estará disponible nuevamente?',
        answer: 'Para productos agotados, puedes registrarte en nuestra web y podras recibir una notificación cuando el producto esté nuevamente disponible. Te enviaremos un correo electrónico tan pronto como el producto esté disponible nuevamente.'
    },
    {
        id: '5',
        category: 'payments',
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos las siguientes formas de pago:\n\n* Tarjetas de crédito y débito (Visa, Mastercard, American Express)\n* Transferencia bancaria\n* Yape\n* Plin\n* Efectivo contra entrega (Lima y Provincias)'
    },
    {
        id: '6',
        category: 'shipping',
        question: '¿Ofrecen envío internacional?',
        answer: 'Actualmente solo realizamos envíos dentro de Perú. Para envio internacional por favor contacta a nuestro servicio de atención al cliente.'
    },
    {
        id: '7',
        category: 'orders',
        question: '¿Puedo modificar mi pedido después de realizarlo?',
        answer: 'Para modificar tu pedido, contacta inmediatamente a nuestro servicio de atención al cliente por WhatsApp o teléfono.'
    },
    /*{
        id: '8',
        category: 'products',
        question: '¿Ofrecen garantía para sus productos?',
        answer: 'Sí, todos nuestros productos cuentan con garantía. La duración de la garantía varía según el tipo de producto:\n\n* Electrónicos: 12 meses\n* Accesorios: 3 meses\n* Ropa y calzado: 30 días por defectos de fabricación\n\nPara hacer efectiva la garantía, deberás presentar tu comprobante de pago.'
    }*/
]);

// Funciones
const parseMarkdown = (text: string): string => {
    if (!text) return '';

    return text
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\s*[-+*]\s+(.*)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // Wrap in paragraphs if not already wrapped
        .replace(/^(.+?)(?:<br>|$)/gm, (_, text) => {
            if (!/^<[h|p|ul|ol|li]/.test(text)) {
                return `<p>${text}</p>`;
            }
            return text;
        });
};

const selectCategory = (categoryId: string) => {
    selectedCategory.value = categoryId;
};

const toggleFaq = (faqId: string) => {
    if (openFaq.value === faqId) {
        openFaq.value = null;
    } else {
        openFaq.value = faqId;
    }
};

const filteredFaqs = computed(() => {
    let result = faqs.value;

    // Filtrar por categoría
    if (selectedCategory.value !== 'all') {
        result = result.filter(faq => faq.category === selectedCategory.value);
    }

    // Filtrar por búsqueda
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
            faq =>
                faq.question.toLowerCase().includes(query) ||
                faq.answer.toLowerCase().includes(query)
        );
    }

    return result;
});

// Simular carga de datos
const loadFaqs = () => {
    loading.value = true;
    error.value = null;

    // Simular llamada a API
    setTimeout(() => {
        // Aquí normalmente se cargarían los datos desde la API
        loading.value = false;
    }, 800);
};

onMounted(() => {
    loadFaqs();
});
</script>

<style scoped>
/* Contenedor principal */
.faq-container {
    padding: 0 20px;
}

/* Sección del banner */
.hero-banner-section {
    margin-bottom: 30px;
}

.hero-banner {
    position: relative;
    display: block;
    width: 100%;
    height: 200px;
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
    font-size: 1.1rem;
    margin: 0;
    text-align: center;
    max-width: 600px;
}

/* Sección de contenido */
.faq-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 0 40px;
}

/* Sección de búsqueda */
.search-section {
    margin-bottom: 30px;
}

.search-container {
    display: flex;
    max-width: 600px;
    margin: 0 auto;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 14px 20px;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 30px;
    outline: none;
    transition: all 0.3s ease;
}

.search-input:focus {
    border-color: #000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.search-button {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 1.2rem;
    padding: 10px;
    cursor: pointer;
}

/* Sección de categorías */
.categories-section {
    margin-bottom: 30px;
}

.categories-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    padding: 0 20px;
}

.category-button {
    padding: 10px 20px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.category-button:hover {
    background-color: #e0e0e0;
}

.category-button.active {
    background-color: #000;
    color: white;
    border-color: #000;
}

/* Sección de preguntas */
.faq-section {
    margin-bottom: 40px;
}

.faq-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.faq-item {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
}

.faq-question {
    background-color: #fff;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.faq-question:hover {
    background-color: #f9f9f9;
}

.faq-question.active {
    background-color: #f5f5f5;
}

.faq-question h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
}

.toggle-icon {
    font-size: 1.5rem;
    font-weight: 300;
    color: #666;
}

.faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, padding 0.3s ease;
    background-color: #fff;
}

.faq-answer.open {
    max-height: 500px;
    padding: 20px;
    border-top: 1px solid #eee;
}

/* Sección de contacto */
.contact-section {
    margin-top: 50px;
}

.contact-card {
    background-color: #f8f8f8;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
}

.contact-card h2 {
    margin-top: 0;
    font-size: 1.5rem;
    margin-bottom: 15px;
}

.contact-card p {
    color: #666;
    margin-bottom: 25px;
}

.contact-button {
    display: inline-block;
    background-color: #000;
    color: white;
    padding: 12px 30px;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
}

.contact-button:hover {
    background-color: #333;
    transform: translateY(-2px);
}

/* Estados de carga y error */
.loading-state {
    text-align: center;
    padding: 50px;
}

.error-state {
    text-align: center;
    color: red;
    padding: 50px;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    background-color: #f9fafb;
    border-radius: 8px;
    color: #6b7280;
    font-size: 1.1rem;
}

.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #000;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Formateo del contenido markdown */
.formatted-description {
    line-height: 1.6;
    color: #374151;
}

.formatted-description h1,
.formatted-description h2,
.formatted-description h3 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
}

.formatted-description h1 {
    font-size: 1.5em;
}

.formatted-description h2 {
    font-size: 1.25em;
}

.formatted-description h3 {
    font-size: 1.125em;
}

.formatted-description p {
    margin-bottom: 1em;
}

.formatted-description ul {
    margin: 1em 0;
    padding-left: 1.5em;
    list-style-type: disc;
}

.formatted-description li {
    margin-bottom: 0.5em;
}

.formatted-description a {
    color: #3b82f6;
    text-decoration: underline;
}

.formatted-description a:hover {
    color: #2563eb;
}

.formatted-description strong {
    font-weight: 600;
}

.formatted-description em {
    font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
    .hero-overlay h1 {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }

    .faq-question h3 {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .category-button {
        font-size: 0.8rem;
        padding: 8px 15px;
    }
}
</style>