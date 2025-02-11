<template>
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>Atención al Cliente</h3>
                <ul>
                    <li><a href="#">Preguntas Frecuentes</a></li>
                    <li><a href="#">Métodos de Pago</a></li>
                    <li><a href="#">Envíos</a></li>
                    <li><a href="#">Devoluciones</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>Nosotros</h3>
                <ul>
                    <li><a href="#">Quiénes Somos</a></li>
                    <li><a href="#">Nuestras Tiendas</a></li>
                    <li><a href="#">Trabaja con Nosotros</a></li>
                    <li><a href="#">Contáctanos</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3>Redes Sociales</h3>
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
                <h3>Newsletter</h3>
                <div class="newsletter">
                    <input type="email" placeholder="Tu correo electrónico" class="newsletter-input" />
                    <button class="newsletter-button">Suscribirse</button>
                </div>
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
    padding: 3rem 0 1rem;
    margin-top: auto;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    padding: 0 2rem;
}

.footer-section h3 {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
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
    transition: color 0.2s;
}

.footer-section a:hover {
    color: white;
}

.social-links {
    display: flex;
    gap: 1rem;
}

.social-link {
    color: white;
    padding: 0.5rem;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.social-link:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.newsletter {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.newsletter-input {
    padding: 0.75rem;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
}

.newsletter-input::placeholder {
    color: #ccc;
}

.newsletter-button {
    padding: 0.75rem;
    background-color: white;
    color: black;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.newsletter-button:hover {
    background-color: #eee;
}

.footer-bottom {
    text-align: center;
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid #333;
}

.footer-bottom p {
    color: #ccc;
    font-size: 0.875rem;
}
</style>