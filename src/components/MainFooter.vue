<template>
    <div>
        <!-- Botón flotante de WhatsApp con tooltip -->
        <!-- <div class="whatsapp-container">
            <div class="whatsapp-tooltip" :class="{ 'show-tooltip': showTooltipAuto }">¿Buscas algún producto o
                necesitas ayuda? ¡Escríbenos!</div>
            <a href="https://wa.me/51934505566" class="whatsapp-button" target="_blank" rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                    <path
                        d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
                </svg>
            </a>
        </div> -->

        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h3 class="footer-title">Atención al Cliente</h3>
                    <ul>
                        <li><a href="#">Preguntas Frecuentes</a></li>
                        <li><a href="#">Métodos de Pago</a></li>
                        <li><a href="#">Envíos</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3 class="footer-title">Nosotros</h3>
                    <ul>
                        <li><a href="#">Quiénes Somos</a></li>
                        <li><a href="#">Contáctanos</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3 class="footer-title">Redes Sociales</h3>
                    <div class="social-links">
                        <a href="https://www.instagram.com/atrevido.pe" target="_blank" rel="noopener noreferrer"
                            class="social-link">
                            <InstagramIcon :size="20" />
                        </a>
                        <a href="https://www.tiktok.com/@atrevido.pe" target="_blank" rel="noopener noreferrer"
                            class="social-link">
                            <div class="tiktok-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <g fill="currentColor">
                                        <path
                                            d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                    </g>
                                </svg>
                            </div>
                        </a>
                    </div>
                </div>

                <div class="footer-section info-section">
                    <img src="@/assets/new-logo.png" alt="Atrevido Logo" class="footer-logo invert-colors" />
                    <div class="contact-info">
                        <p><strong>Horario de atención:</strong> Lun - Dom: 9am - 10pm</p>
                        <p><strong>Teléfono:</strong> +51 934 505 566</p>
                        <p><strong>Email:</strong> contacto@atrevido.pe</p>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; {{ currentYear }} Atrevido. Todos los derechos reservados.</p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { InstagramIcon } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

// Para mostrar tooltip automáticamente después de unos segundos
const showTooltipAuto = ref(false)
const currentYear = ref(new Date().getFullYear())

onMounted(() => {
    // Mostrar el tooltip automáticamente después de 3 segundos en la página
    setTimeout(() => {
        showTooltipAuto.value = true

        // Ocultarlo después de 5 segundos
        setTimeout(() => {
            showTooltipAuto.value = false
        }, 5000)
    }, 3000)
})
</script>

<style scoped>
.footer {
    background-color: #000;
    color: white;
    padding: 3rem 1rem 1rem;
    margin-top: auto;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2.5rem;
}

.footer-title {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    position: relative;
}

.footer-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-section ul li {
    margin-bottom: 0.75rem;
}

.footer-section a {
    color: #ccc;
    text-decoration: none;
    transition: color 0.2s, transform 0.2s;
    display: inline-block;
}

.footer-section a:hover {
    color: white;
    transform: translateX(5px);
}

.social-links {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.social-link {
    color: white;
    padding: 0.5rem;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.social-link:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-3px);
}

.tiktok-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.whatsapp-tooltip:after {
    content: '';
    position: absolute;
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 10px 0 10px 10px;
    border-style: solid;
    border-color: transparent transparent transparent white;
}

.info-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.footer-logo {
    max-width: 120px;
    height: auto;
    margin-bottom: 1rem;
}

.invert-colors {
    filter: invert(1) brightness(100%);
}

.contact-info p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    color: #ccc;
}

.payment-methods {
    margin-top: 1rem;
}

.payment-icons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.payment-icon {
    display: inline-block;
    background-color: white;
    border-radius: 4px;
    padding: 2px;
}

/* Botón de WhatsApp flotante con tooltip */
.whatsapp-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}

.whatsapp-button {
    background-color: #25D366;
    color: white;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
}

.whatsapp-button:hover {
    transform: scale(1.1);
    background-color: #20ba5a;
}

.whatsapp-tooltip {
    position: absolute;
    right: 75px;
    bottom: 12px;
    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
    color: #333;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    width: 220px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: translateX(10px) scale(0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    text-align: left;
    line-height: 1.4;
}

.whatsapp-tooltip:after {
    content: '';
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 8px 0 8px 8px;
    border-style: solid;
    border-color: transparent transparent transparent #ffffff;
    filter: drop-shadow(2px 0px 1px rgba(0, 0, 0, 0.05));
}

.whatsapp-tooltip.show-tooltip,
.whatsapp-container:hover .whatsapp-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(0) scale(1);
}

.whatsapp-tooltip.show-tooltip~.whatsapp-button {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(37, 211, 102, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
    }
}

.footer-bottom {
    text-align: center;
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid #333;
}

.footer-bottom p {
    color: #999;
    font-size: 0.875rem;
}

@media (max-width: 768px) {
    .whatsapp-tooltip {
        width: 180px;
        font-size: 13px;
        padding: 8px 12px;
        bottom: 8px;
        right: 70px;
    }
}

@media (max-width: 768px) {
    .footer {
        padding: 2rem 1rem 1rem;
    }

    .footer-content {
        gap: 2rem;
    }

    .footer-title {
        margin-bottom: 1rem;
    }

    .social-links {
        justify-content: center;
    }

    .footer-logo {
        max-width: 120px;
    }
}

@media (max-width: 480px) {
    .footer-section {
        text-align: center;
    }

    .footer-section ul li {
        margin-bottom: 1rem;
    }

    .social-links {
        justify-content: center;
        gap: 1.5rem;
    }

    .footer-logo {
        max-width: 100px;
    }
}
</style>