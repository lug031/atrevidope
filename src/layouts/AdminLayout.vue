<template>
    <div class="layout-container">
        <MainNavigation />
        <main class="admin-main">
            <div class="content-area">
                <slot></slot>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import MainNavigation from '@/components/MainNavigation.vue'
</script>

<style scoped>
.layout-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
}

.admin-main {
    flex: 1;
    padding: 2rem;
    padding-top: 6rem;
}

.content-area {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

@media (max-width: 768px) {
    .admin-main {
        padding: 1rem;
        padding-top: 5rem;
    }

    .content-area {
        padding: 1rem;
    }
}
</style>