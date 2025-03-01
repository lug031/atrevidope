<template>
    <MainLayout>
        <div class="shipping-container">
            <!-- Header Banner -->
            <div class="hero-banner-section">
                <div class="hero-banner">
                    <img src="/hero-banner.png" alt="Envíos" class="hero-image" />
                    <div class="hero-overlay">
                        <h1>ENVÍOS</h1>
                        <p class="hero-subtitle">Información sobre nuestros servicios de entrega</p>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="shipping-content">
                <!-- Introduction Section -->
                <section class="intro-section">
                    <div class="intro-content">
                        <h2>Servicio de Envíos a Todo el Perú</h2>
                        <p class="intro-text">
                            En ATREVIDO, nos comprometemos a entregarte tus fragancias favoritas de manera segura y
                            rápida.
                            Nos aseguramos que recibas tu pedido
                            en perfectas condiciones y en el menor tiempo posible.
                        </p>
                    </div>
                </section>

                <!-- Shipping Methods Section -->
                <section class="methods-section">
                    <div class="method-card">
                        <div class="method-icon">
                            <i class="fa-solid fa-truck-fast"></i>
                        </div>
                        <div class="method-details">
                            <h3>Envío Express Lima</h3>
                            <p>Entrega el mismo día o siguiente día hábil para pedidos en Lima Metropolitana.</p>
                            <p class="method-note">Disponible para pedidos realizados antes de las 1:00 PM en días
                                hábiles.</p>
                        </div>
                    </div>

                    <div class="method-card">
                        <div class="method-icon">
                            <i class="fa-solid fa-truck"></i>
                        </div>
                        <div class="method-details">
                            <h3>Envío a Provincia</h3>
                            <p>Entrega en 2-4 días hábiles a las principales ciudades del Perú.</p>
                            <p class="method-note">El tiempo de entrega puede variar según la localidad.</p>
                        </div>
                    </div>

                    <!--<div class="method-card">
                        <div class="method-icon">
                            <i class="fa-solid fa-store"></i>
                        </div>
                        <div class="method-details">
                            <h3>Recojo en Tienda</h3>
                            <p>Recoge tu pedido en nuestra tienda ubicada en Miraflores, sin costo adicional.</p>
                            <p class="method-note">Disponible de lunes a domingo de 10:00 AM a 8:00 PM.</p>
                        </div>
                    </div>-->

                    <div class="method-card">
                        <div class="method-icon">
                            <i class="fa-solid fa-calendar-check"></i>
                        </div>
                        <div class="method-details">
                            <h3>Envío Programado</h3>
                            <p>Programa la fecha y hora de entrega según tu disponibilidad (solo Lima).</p>
                            <p class="method-note">Sujeto a disponibilidad. Coordinar con anticipación.</p>
                        </div>
                    </div>
                </section>

                <!-- Shipping Costs Section -->
                <section class="shipping-costs-section">
                    <h2>Costos de Envío</h2>

                    <div class="costs-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Destino</th>
                                    <th>Tiempo estimado</th>
                                    <th>Costo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Lima Metropolitana (Estándar)</td>
                                    <td>1-2 días hábiles</td>
                                    <td>S/. 10.00</td>
                                </tr>
                                <tr>
                                    <td>Lima Metropolitana (Express)</td>
                                    <td>Mismo día / Día siguiente</td>
                                    <td>S/. 15.00</td>
                                </tr>
                                <tr>
                                    <td>Callao</td>
                                    <td>1-2 días hábiles</td>
                                    <td>S/. 12.00</td>
                                </tr>
                                <tr>
                                    <td>Provincias principales</td>
                                    <td>2-3 días hábiles</td>
                                    <td>S/. 18.00</td>
                                </tr>
                                <tr>
                                    <td>Otras provincias</td>
                                    <td>3-5 días hábiles</td>
                                    <td>S/. 22.00</td>
                                </tr>
                                <tr class="highlight">
                                    <td>Envío GRATIS</td>
                                    <td>Para compras mayores a S/. 200</td>
                                    <td>S/. 0.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Tracking Information -->
                <section class="tracking-section">
                    <h2>Seguimiento de Pedidos</h2>

                    <div class="tracking-info">
                        <div class="tracking-card">
                            <div class="tracking-icon">
                                <i class="fa-solid fa-magnifying-glass-location"></i>
                            </div>
                            <div class="tracking-details">
                                <h3>¿Cómo rastrear tu pedido?</h3>
                                <p>Puedes consultar el estado de tu pedido ingresando a tu cuenta en nuestra web
                                    y revisando la sección "Ver mis Pedidos" en la barra superior.</p>
                                <p>Si tienes alguna duda sobre el estado de tu envío, no dudes en contactarnos por
                                    WhatsApp.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Shipping FAQ -->
                <!--<section class="faq-section">
                    <h2>Preguntas Frecuentes</h2>

                    <div class="faq-accordion">
                        <div class="faq-item">
                            <div class="faq-question">
                                <h3>¿Qué sucede si no estoy en casa cuando llegue mi pedido?</h3>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>El courier intentará la entrega hasta en 2 ocasiones. Si después de estos intentos no
                                    se logra concretar la entrega, el paquete retornará a nuestro almacén y nos
                                    pondremos en contacto contigo para coordinar un nuevo envío (puede generar un costo
                                    adicional).</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">
                                <h3>¿Entregan los fines de semana o feriados?</h3>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Los envíos Express en Lima pueden realizarse los sábados, dependiendo de la
                                    disponibilidad del courier. Los domingos y feriados nacionales no se realizan
                                    entregas.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">
                                <h3>¿Qué hago si mi paquete llega dañado?</h3>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Al recibir tu pedido, verifica el estado del paquete antes de firmar la conformidad.
                                    Si notas daños, notifica al courier y contáctanos inmediatamente enviando fotos del
                                    estado del paquete. Gestionaremos el reemplazo lo antes posible.</p>
                            </div>
                        </div>

                        <div class="faq-item">
                            <div class="faq-question">
                                <h3>¿Realizan envíos internacionales?</h3>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Actualmente solo realizamos envíos dentro del territorio peruano. Estamos trabajando
                                    para expandir nuestro servicio a países vecinos en el futuro.</p>
                            </div>
                        </div>
                    </div>
                </section>-->

                <!-- Call To Action -->
                <section class="cta-section">
                    <div class="cta-content">
                        <h2>¿Listo para recibir tus fragancias favoritas?</h2>
                        <p>Navega por nuestro catálogo y elige los mejores perfumes con la seguridad de una entrega
                            rápida y segura.</p>
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
import { ref, onMounted } from 'vue';

// Para controlar el acordeón de FAQ
const toggleFaqItem = (event: Event) => {
    const target = event.currentTarget as HTMLElement;
    const faqItem = target.closest('.faq-item') as HTMLElement;

    if (faqItem) {
        faqItem.classList.toggle('active');
    }
};

onMounted(() => {
    // Añadir event listeners para los items de FAQ
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', toggleFaqItem);
    });
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

/* Contenedor principal */
.shipping-container {
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
.shipping-content {
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 60px;
}

/* Section title */
.shipping-content h2 {
    font-size: 1.8rem;
    text-align: center;
    color: #333;
    margin-bottom: 30px;
}

/* Sección de Introducción */
.intro-section {
    margin-bottom: 50px;
}

.intro-content h2 {
    font-size: 1.8rem;
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
}

.intro-text {
    font-size: 1.1rem;
    line-height: 1.7;
    color: #555;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

/* Métodos de envío */
.methods-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-bottom: 60px;
}

.method-card {
    background-color: white;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 20px;
    transition: transform 0.3s, box-shadow 0.3s;
}

.method-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.method-icon {
    font-size: 2.5rem;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.method-details h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 1.3rem;
}

.method-details p {
    margin: 0 0 10px;
    color: #555;
    line-height: 1.6;
}

.method-note {
    font-size: 0.9rem;
    color: #777;
    font-style: italic;
}

/* Tabla de costos de envío */
.shipping-costs-section {
    margin-bottom: 60px;
}

.costs-table {
    overflow-x: auto;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
    border-radius: 10px;
}

.costs-table table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
}

.costs-table th,
.costs-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.costs-table th {
    background-color: #f8f8f8;
    color: #333;
    font-weight: 600;
}

.costs-table tr:last-child td {
    border-bottom: none;
}

.costs-table tr:hover {
    background-color: #f9f9f9;
}

.costs-table tr.highlight {
    background-color: rgba(0, 0, 0, 0.03);
    font-weight: 600;
}

.costs-table tr.highlight td {
    color: #000;
}

/* Sección de seguimiento */
.tracking-section {
    margin-bottom: 60px;
}

.tracking-card {
    background-color: white;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 20px;
}

.tracking-icon {
    font-size: 2.5rem;
    color: #000;
    display: flex;
    align-items: flex-start;
    padding-top: 5px;
}

.tracking-details h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 1.3rem;
}

.tracking-details p {
    margin: 0 0 15px;
    color: #555;
    line-height: 1.6;
}

/* Sección de FAQ */
.faq-section {
    margin-bottom: 60px;
}

.faq-accordion {
    max-width: 900px;
    margin: 0 auto;
}

.faq-item {
    background-color: white;
    border-radius: 10px;
    margin-bottom: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.faq-question {
    padding: 20px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.3s;
}

.faq-question:hover {
    background-color: #f9f9f9;
}

.faq-question h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
}

.faq-question i {
    transition: transform 0.3s;
}

.faq-item.active .faq-question i {
    transform: rotate(180deg);
}

.faq-answer {
    padding: 0 20px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, padding 0.3s ease;
}

.faq-item.active .faq-answer {
    padding: 0 20px 20px;
    max-height: 300px;
}

.faq-answer p {
    margin: 0;
    color: #555;
    line-height: 1.6;
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
    .cta-buttons {
        flex-direction: column;
        max-width: 300px;
        margin: 0 auto;
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

    .method-card,
    .tracking-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .tracking-icon {
        margin-bottom: 15px;
    }

    .faq-question h3 {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {

    .method-card,
    .tracking-card {
        padding: 20px;
    }

    .method-icon,
    .tracking-icon {
        font-size: 2rem;
    }

    .method-details h3,
    .tracking-details h3 {
        font-size: 1.2rem;
    }

    .costs-table th,
    .costs-table td {
        padding: 10px;
        font-size: 0.9rem;
    }
}
</style>