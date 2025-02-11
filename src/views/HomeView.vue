<template>
  <MainLayout>
    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="banner-content">
        <h1>Miss Dior</h1>
        <button class="discover-button" @click="router.push('/web-products')">
          DESCUBRIR
        </button>
      </div>
      <div class="banner-dots">
        <span class="dot active"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';

const router = useRouter();
</script>

<style scoped>
.hero-banner {
  height: 500px;
  background: linear-gradient(to right, #ffe6e6, #fff);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  text-align: center;
}

.banner-content h1 {
  font-size: 4rem;
  font-family: serif;
  margin-bottom: 2rem;
}

.discover-button {
  background-color: #000;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.banner-dots {
  position: absolute;
  bottom: 20px;
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: #ddd;
  border-radius: 50%;
  cursor: pointer;
}

.dot.active {
  background-color: #000;
}

.promo-banner {
  height: 300px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
}

.promo-banner h2 {
  font-size: 2.5rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
</style>