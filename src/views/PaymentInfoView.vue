<template>
    <MainLayout>
        <div class="payment-methods-container">
            <!-- Header Banner -->
            <div class="hero-banner-section">
                <div class="hero-banner">
                    <img src="/hero-banner.png" alt="Métodos de Pago" class="hero-image" />
                    <div class="hero-overlay">
                        <h1>MÉTODOS DE PAGO</h1>
                        <p class="hero-subtitle">Opciones seguras y convenientes para tus compras</p>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="payment-content">
                <!-- Introduction Section -->
                <section class="intro-section">
                    <div class="intro-content">
                        <h2>Formas de Pago Disponibles</h2>
                        <p class="intro-text">
                            En ATREVIDO, te ofrecemos diferentes opciones de pago para que puedas realizar tus compras
                            de
                            manera cómoda y segura.
                        </p>
                    </div>
                </section>

                <!-- Payment Methods Section -->
                <section class="methods-section">
                    <!--<div class="method-card">
                        <div class="method-icon">
                            <i class="fa-solid fa-credit-card"></i>
                        </div>
                        <div class="method-details">
                            <h3>Tarjetas de Crédito y Débito</h3>
                            <p>Aceptamos las principales tarjetas de crédito y débito: Visa, MasterCard, American
                                Express y Diners Club.</p>
                            <p class="method-note">El cargo se realiza inmediatamente al confirmar tu pedido.</p>
                        </div>
                    </div>-->

                    <!--<div class="method-card">
                        <div class="method-icon">
                            <i class="fa-solid fa-building-columns"></i>
                        </div>
                        <div class="method-details">
                            <h3>Transferencia Bancaria</h3>
                            <p>Realiza una transferencia a nuestras cuentas bancarias en BCP, Interbank o BBVA.</p>
                            <p class="method-note">Tu pedido se procesará una vez confirmado el pago (24-48 horas).</p>
                        </div>
                    </div>-->

                    <div class="method-card">
                        <div class="method-icon">
                            <i class="fa-solid fa-mobile-screen"></i>
                        </div>
                        <div class="method-details">
                            <h3>Yape / Plin</h3>
                            <p>Paga fácilmente escaneando nuestro código QR</p>
                            <p class="method-note">Envíanos el comprobante de pago para procesar tu pedido
                                inmediatamente.</p>
                        </div>
                    </div>

                    <div class="method-card">
                        <div class="method-icon">
                            <i class="fa-solid fa-money-bill-wave"></i>
                        </div>
                        <div class="method-details">
                            <h3>Contra Entrega</h3>
                            <p>Paga en efectivo al momento de recibir tu pedido (Lima y Provincias).</p>
                            <p class="method-note">Se requiere un adelanto del 20% para reservar el producto.</p>
                        </div>
                    </div>
                </section>

                <!-- Bank Account Information -->
                <!--<section class="bank-accounts-section">
                    <h2>Nuestras Cuentas Bancarias</h2>

                    <div class="bank-accounts">
                        <div class="bank-card">
                            <div class="bank-logo">
                                <img src="@/assets/cut_logo.png" alt="BCP" />
                            </div>
                            <div class="bank-details">
                                <h3>Banco de Crédito BCP</h3>
                                <p><strong>Cuenta Corriente:</strong> 123-456789-0-01</p>
                                <p><strong>Titular:</strong> Atrevido S.A.C.</p>
                                <p><strong>CCI:</strong> 002-123-000456789001-95</p>
                            </div>
                        </div>

                        <div class="bank-card">
                            <div class="bank-logo">
                                <img src="@/assets/cut_logo.png" alt="Interbank" />
                            </div>
                            <div class="bank-details">
                                <h3>Interbank</h3>
                                <p><strong>Cuenta Corriente:</strong> 200-3002567894</p>
                                <p><strong>Titular:</strong> Atrevido S.A.C.</p>
                                <p><strong>CCI:</strong> 003-200-003002567894-37</p>
                            </div>
                        </div>
                    </div>
                </section> -->

                <!-- Mobile Payment Information -->
                <section class="mobile-payment-section">
                    <!--<h2>Pagos Móviles</h2> -->

                    <div class="mobile-payments">
                        <div class="mobile-card">
                            <div class="mobile-logo">
                                <img src="@/assets/qr-yape.jpg" alt="Yape" />
                            </div>
                            <div class="mobile-details">
                                <h3>Yape</h3>
                                <p><strong>Nombre:</strong> Chion C. Kam G.</p>
                                <p><strong>Número:</strong> 955 463 534</p>
                            </div>
                        </div>

                        <div class="mobile-card">
                            <div class="mobile-logo">
                                <img src="@/assets/qr-plin.jpg" alt="Plin" />
                            </div>
                            <div class="mobile-details">
                                <h3>Plin</h3>
                                <p><strong>Nombre:</strong> Chion Chui Kam Gone</p>
                                <p><strong>Número:</strong> 955 463 534</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Call To Action -->
                <section class="cta-section">
                    <div class="cta-content">
                        <h2>¿Tienes alguna duda sobre los métodos de pago?</h2>
                        <p>Nuestro equipo está disponible para responder todas tus consultas y brindarte asistencia.</p>
                        <div class="cta-buttons">
                            <router-link to="/contacto" class="cta-button primary">Contáctanos</router-link>
                            <router-link to="/web-products" class="cta-button secondary">Ver Catálogo</router-link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

/* Contenedor principal */
.payment-methods-container {
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
.payment-content {
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 60px;
}

/* Section title */
.payment-content h2 {
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

/* Métodos de pago */
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

/* Sección de cuentas bancarias */
.bank-accounts-section {
    margin-bottom: 60px;
}

.bank-accounts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.bank-card {
    background-color: white;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s, box-shadow 0.3s;
}

.bank-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.bank-logo {
    width: 100px;
    height: 60px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.bank-logo img {
    width: auto;
    height: 100%;
    max-width: 100%;
    object-fit: contain;
}

.bank-details h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 1.3rem;
}

.bank-details p {
    margin: 0 0 10px;
    color: #555;
    line-height: 1.6;
}

/* Sección de pagos móviles */
.mobile-payment-section {
    margin-bottom: 60px;
}

.mobile-payments {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.mobile-card {
    background-color: white;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s, box-shadow 0.3s;
}

.mobile-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.mobile-logo {
    width: 300px;
    height: 300px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.mobile-logo img {
    width: auto;
    height: 100%;
    max-width: 100%;
    object-fit: contain;
}

.mobile-details h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 1.3rem;
}

.mobile-details p {
    margin: 0 0 10px;
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

    .method-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .bank-card,
    .mobile-card {
        align-items: center;
        text-align: center;
    }
}

@media (max-width: 480px) {

    .method-card,
    .bank-card,
    .mobile-card {
        padding: 20px;
    }

    .method-icon {
        font-size: 2rem;
    }

    .method-details h3,
    .bank-details h3,
    .mobile-details h3 {
        font-size: 1.2rem;
    }
}
</style>