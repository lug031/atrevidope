<template>
  <div class="categories-menu">
    <ul class="menu-list" v-if="!loading && !error">
      <li v-for="category in activeCategories" :key="category.id">
        <a href="#" class="menu-link">
          {{ category.name }}
          <span class="hover-line"></span>
        </a>
      </li>
    </ul>
    <div v-else-if="loading" class="loading">
      <div class="loading-animation">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>
    </div>
    <div v-else-if="error" class="error">
      Lo sentimos, no pudimos cargar nuestro catálogo
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCategories } from '@/composables/useCategories';
import type { Category } from '@/types/category.types';

const { categories, loading, error, loadCategories } = useCategories();

const activeCategories = computed(() => {
  return categories.value
    .filter(category => category.active)
    .sort((a, b) => a.name.localeCompare(b.name));
});

onMounted(async () => {
  await loadCategories();
});
</script>

<style scoped>
.categories-menu {
  background: linear-gradient(to right, #1a1a1a, #2d2d2d);
  padding: 1.25rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
}

.menu-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  list-style: none;
  gap: 2.5rem;
  margin: 0;
  padding: 0 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.menu-list li {
  position: relative;
}

.menu-link {
  color: #f8f8f8;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 0.5rem 0;
  transition: color 0.3s ease;
  position: relative;
  display: inline-block;
}

.hover-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #ffffff;
  transition: width 0.3s ease;
}

.menu-link:hover {
  color: #ffffff;
}

.menu-link:hover .hover-line {
  width: 100%;
}

.loading {
  color: #f8f8f8;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  min-height: 2rem;
}

.loading-animation {
  display: flex;
  gap: 0.5rem;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background-color: #ffffff;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 1.4s infinite ease-in-out;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

.error {
  color: #ff6b6b;
  text-align: center;
  font-style: italic;
  padding: 1rem;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  margin: 0 1rem;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .menu-list {
    gap: 1.5rem;
    padding: 0 0.75rem;
  }

  .menu-link {
    font-size: 14px;
  }
}
</style>