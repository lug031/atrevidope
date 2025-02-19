<template>
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3 class="footer-title">Atención al Cliente</h3>
                <ul>
                    <li><a href="#">Preguntas Frecuentes</a></li>
                    <li><a href="#">Métodos de Pago</a></li>
                    <li><a href="#">Envíos</a></li>
                    <li><a href="#">Devoluciones</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3 class="footer-title">Nosotros</h3>
                <ul>
                    <li><a href="#">Quiénes Somos</a></li>
                    <li><a href="#">Nuestras Tiendas</a></li>
                    <li><a href="#">Trabaja con Nosotros</a></li>
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

            <div class="footer-section">
                <h3 class="footer-title">Newsletter</h3>
                <form class="newsletter" @submit.prevent>
                    <input type="email" placeholder="Tu correo electrónico" class="newsletter-input"
                        aria-label="Email para newsletter" />
                    <button type="submit" class="newsletter-button">Suscribirse</button>
                </form>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; 2025 Atrevido. Todos los derechos reservados.</p>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { InstagramIcon, FacebookIcon, TwitterIcon } from 'lucide-vue-next'
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

.newsletter {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.newsletter-input {
    flex: 1;
    min-width: 200px;
    padding: 0.75rem 1rem;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    transition: border-color 0.3s ease;
}

.newsletter-input:focus {
    outline: none;
    border-color: #666;
}

.newsletter-input::placeholder {
    color: #999;
}

.newsletter-button {
    padding: 0.75rem 1.5rem;
    background-color: white;
    color: black;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.newsletter-button:hover {
    background-color: #eee;
    transform: translateY(-2px);
}

.newsletter-button:active {
    transform: translateY(0);
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
    .footer {
        padding: 2rem 1rem 1rem;
    }

    .footer-content {
        gap: 2rem;
    }

    .footer-title {
        margin-bottom: 1rem;
    }

    .newsletter {
        flex-direction: column;
    }

    .newsletter-input,
    .newsletter-button {
        width: 100%;
    }

    .social-links {
        justify-content: center;
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
}
</style>