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
                    <a href="#" class="social-link">
                        <InstagramIcon :size="20" />
                    </a>
                    <a href="#" class="social-link">
                        <FacebookIcon :size="20" />
                    </a>
                    <a href="#" class="social-link">
                        <TwitterIcon :size="20" />
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