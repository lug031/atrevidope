<template>
    <MainLayout>
        <div class="contact-container">
            <!-- Header Banner -->
            <div class="hero-banner-section">
                <div class="hero-banner">
                    <img src="/hero-banner.png" alt="Contáctanos" class="hero-image" />
                    <div class="hero-overlay">
                        <h1>CONTÁCTANOS</h1>
                        <p class="hero-subtitle">Estamos aquí para ayudarte</p>
                    </div>
                </div>
            </div>

            <!-- Contact Section -->
            <div class="contact-content">
                <div class="contact-intro">
                    <h2>¿Cómo podemos ayudarte?</h2>
                    <p>Ponte en contacto con nosotros a través de cualquiera de nuestros canales de atención. Estamos
                        listos para resolver tus dudas y brindarte la mejor experiencia.</p>
                </div>

                <!-- Contact Info Cards -->
                <div class="contact-cards">
                    <div class="contact-card">
                        <div class="card-icon">
                            <PhoneCall class="icon" />
                        </div>
                        <h3>Llámanos</h3>
                        <p class="contact-value">+51 934 505 566</p>
                        <div class="contact-details">
                            <p>
                                <Clock class="mini-icon" /> Lunes a Viernes: 9am - 6pm
                            </p>
                            <p>
                                <Clock class="mini-icon" /> Sábados: 9am - 1pm
                            </p>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="card-icon">
                            <Mail class="icon" />
                        </div>
                        <h3>Correo Electrónico</h3>
                        <p class="contact-value">contacto@atrevido.pe</p>
                        <div class="contact-details">
                            <p>
                                <HelpCircle class="mini-icon" /> Para consultas generales
                            </p>
                            <p>
                                <ShoppingBag class="mini-icon" /> Para información de pedidos
                            </p>
                        </div>
                    </div>

                    <div class="contact-card">
                        <div class="card-icon">
                            <MessagesSquare class="icon" />
                        </div>
                        <h3>Chat WhatsApp</h3>
                        <p class="contact-value">Chat disponible en la web</p>
                        <div class="contact-details">
                            <p>
                                <Clock class="mini-icon" /> Lunes a Domingo: 8am - 10pm
                            </p>
                            <p>
                                <MessageCircle class="mini-icon" /> Tiempo de respuesta 2-5 minutos
                            </p>
                        </div>
                    </div>

                    <!-- <div class="contact-card">
                        <div class="card-icon">
                            <MapPin class="icon" />
                        </div>
                        <h3>Visítanos</h3>
                        <p class="contact-value">Av. Principal 123, Miraflores</p>
                        <div class="contact-details">
                            <p>
                                <Navigation class="mini-icon" /> Lima, Perú
                            </p>
                            <p>
                                <Clock class="mini-icon" /> Horario: 10am - 7pm (Lun-Sáb)
                            </p>
                        </div>
                    </div> -->
                </div>

                <!-- Social Media Section -->
                <div class="social-section">
                    <h3>Síguenos en redes sociales</h3>
                    <p>Mantente al día con las últimas novedades, promociones y lanzamientos</p>
                    <div class="social-icons">
                        <a href="https://www.tiktok.com/@atrevido.pe" target="_blank" class="social-icon" aria-label="TikTok">
                            <div class="tiktok-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <g fill="currentColor">
                                        <path
                                            d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                    </g>
                                </svg>
                            </div>
                        </a>
                        <a href="https://www.instagram.com/atrevido.pe" target="_blank" class="social-icon" aria-label="Instagram">
                            <Instagram />
                        </a>
                    </div>
                </div>
            </div>

            <!-- FAQ Section -->
            <div class="faq-mini-section">
                <h3>Preguntas frecuentes</h3>
                <p>Encuentra respuestas rápidas a las preguntas más comunes.</p>
                <div class="faq-mini-items">
                    <div class="faq-mini-item">
                        <HelpCircle class="faq-icon" />
                        <h4>¿Cuánto tiempo tarda en llegar mi pedido?</h4>
                        <p>El tiempo de entrega varía según tu ubicación. En Lima Metropolitana: 1-2 días hábiles.
                            Provincias: 2-5 días hábiles.</p>
                    </div>
                    <div class="faq-mini-item">
                        <HelpCircle class="faq-icon" />
                        <h4>¿Qué métodos de pago aceptan?</h4>
                        <p>Aceptamos las siguientes formas de pago: Tarjeta de crédito, débito,
                            transferencia bancaria, YAPE, PLIN y pago contra entrega.</p>
                    </div>
                </div>
                <router-link to="/faq" class="see-more-button">
                    <span>Ver todas las preguntas</span>
                    <ArrowRight class="button-icon" />
                </router-link>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MainLayout from '@/layouts/MainLayout.vue';
import {
    PhoneCall,
    Mail,
    MapPin,
    MessagesSquare,
    Clock,
    HelpCircle,
    ShoppingBag,
    MessageCircle,
    Navigation,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    ArrowRight,
    Truck,
    RefreshCcw,
} from 'lucide-vue-next';
</script>

<style scoped>
/* Contenedor principal */
.contact-container {
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
.contact-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 0 40px;
}

.contact-intro {
    text-align: center;
    max-width: 800px;
    margin: 0 auto 40px;
}

.contact-intro h2 {
    font-size: 1.8rem;
    margin-bottom: 15px;
}

.contact-intro p {
    color: #666;
    line-height: 1.6;
}

/* Tarjetas de contacto */
.contact-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin-bottom: 50px;
}

.contact-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.contact-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-icon {
    width: 60px;
    height: 60px;
    background-color: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
}

.icon {
    width: 30px;
    height: 30px;
    color: #000;
}

.mini-icon {
    width: 16px;
    height: 16px;
    margin-right: 5px;
    vertical-align: middle;
}

.contact-card h3 {
    font-size: 1.2rem;
    margin: 0 0 15px 0;
}

.contact-value {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 15px;
}

.contact-details {
    color: #666;
    font-size: 0.9rem;
}

.contact-details p {
    margin: 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Sección de redes sociales */
.social-section {
    background-color: #f8f8f8;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    margin-bottom: 50px;
}

.social-section h3 {
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 15px;
}

.social-section p {
    color: #666;
    margin-bottom: 25px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.social-icons {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.social-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background-color: #000;
    color: white;
    border-radius: 50%;
    text-decoration: none;
    transition: transform 0.2s ease, background-color 0.2s ease;
}

.social-icon:hover {
    transform: translateY(-3px);
    background-color: #333;
}

/* Sección de FAQ mini */
.faq-mini-section {
    max-width: 1200px;
    margin: 0 auto 60px;
    text-align: center;
}

.faq-mini-section h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
}

.faq-mini-section>p {
    color: #666;
    margin-bottom: 30px;
}

.faq-mini-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.faq-mini-item {
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 25px;
    text-align: left;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
}

.faq-mini-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.faq-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 24px;
    height: 24px;
    color: #000;
    opacity: 0.5;
}

.faq-mini-item h4 {
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 15px;
    padding-right: 30px;
}

.faq-mini-item p {
    color: #666;
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
}

.see-more-button {
    display: inline-flex;
    align-items: center;
    background-color: #f5f5f5;
    color: #000;
    padding: 12px 25px;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
}

.see-more-button:hover {
    background-color: #000;
    color: white;
}

.button-icon {
    width: 18px;
    height: 18px;
    margin-left: 8px;
}

/* Responsive */
@media (max-width: 992px) {
    .contact-cards {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .hero-overlay h1 {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }

    .contact-cards {
        grid-template-columns: 1fr;
    }

    .faq-mini-items {
        grid-template-columns: 1fr;
    }

    .social-section {
        padding: 30px 20px;
    }
}

@media (max-width: 480px) {
    .contact-card {
        padding: 20px;
    }
}
</style>