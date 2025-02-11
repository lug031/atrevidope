<template>
    <div class="not-found">
        <div class="not-found-content">
            <h1 class="title">404</h1>
            <h2 class="subtitle">Página no encontrada</h2>
            <p class="message">Lo sentimos, la página que buscas no existe o ha sido movida.</p>

            <div class="suggestions">
                <ul>
                    <li>
                        <RouterLink to="/" class="link">
                            Volver al inicio
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
}

.not-found-content {
    max-width: 600px;
}

.title {
    font-size: 8rem;
    margin: 0;
    line-height: 1;
    color: #000;
}

.subtitle {
    font-size: 2rem;
    margin: 1rem 0;
    color: #333;
}

.message {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 2rem;
}

.suggestions {
    background-color: #f8f8f8;
    padding: 1.5rem;
    border-radius: 8px;
}

.suggestions p {
    margin: 0 0 1rem 0;
    color: #333;
}

.suggestions ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.suggestions li {
    margin: 0.5rem 0;
}

.link {
    color: #000;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.link:hover {
    color: #666;
}
</style>