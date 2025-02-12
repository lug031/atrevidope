<template>
  <MainLayout>
    <div class="promotional-products">
      <!-- Updated Header Banner -->
      <div class="hero-banner-section">
        <router-link to="/promotions" class="hero-banner">
          <img src="/hero-banner.png" alt="Promociones" class="hero-image" />
          <div class="hero-overlay">
            <h1>PROMOCIONES</h1>
            <button class="discover-btn">Descubrir</button>
          </div>
        </router-link>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-container">
          <label>Ordenar por:</label>
          <select v-model="sortBy" class="sort-select">
            <option value="position">Posición</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name">Nombre</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="loading" class="loading-state">
        <span class="loader"></span>
      </div>

      <div v-else-if="error" class="error-state">
        Lo sentimos, ha ocurrido un error al cargar los productos.
      </div>

      <div v-else class="products-grid">
        <div v-for="product in sortedProducts" :key="product.id" class="product-card">
          <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" class="product-content">
            <!-- Badge de promoción futura con validación -->
            <div v-if="hasUpcomingPromotion(product) && product.promotionStartDate" class="promotion-badge">
              <span class="promotion-date">Próximamente en promoción</span>
              <span class="promotion-discount">-{{ product.discountPercentage || 0 }}%</span>
              <span class="promotion-start">{{ formatPromotionDate(product.promotionStartDate) }}</span>
            </div>

            <div class="product-image">
              <img :src="imageUrls[product.id] || '/api/placeholder/40/40'" :alt="product.name" />
            </div>

            <div class="product-info">
              <h3 class="brand-name">{{ product.brand }}</h3>
              <p class="product-name">{{ product.name }}</p>
              <p class="product-description">{{ product.description }}</p>

              <!-- Precios -->
              <div class="price-info" :class="{ 'has-promotion': hasUpcomingPromotion(product) }">
                <p class="product-price">
                  <template v-if="hasUpcomingPromotion(product)">
                    <span class="current-price">S/{{ product.originalPrice.toFixed(2) }}</span>
                  </template>
                  <template v-else>
                    <span class="current-price">S/{{ product.price.toFixed(2) }}</span>
                  </template>
                </p>
              </div>

              <!-- Stock Status -->
              <div class="stock-status" :class="{
                'out-of-stock': product.stock === 0,
                'low-stock': product.stock > 0 && product.stock <= 5
              }">
                <span v-if="product.stock === 0">Agotado</span>
                <span v-else-if="product.stock <= 5">¡Últimas {{ product.stock }} unidades!</span>
                <span v-else>Stock disponible</span>
              </div>
            </div>
          </router-link>

          <button @click.stop="addToCart(product)" class="add-to-cart" :class="{ 'disabled': product.stock === 0 }"
            :disabled="product.stock === 0">
            {{ product.stock === 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO' }}
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useProducts } from '@/composables/useProducts';
import { useCartStore } from '@/stores/cart';
import { useToast } from '../composables/useToast';
import type { Product } from '@/types/product.types';
import type { CartItem } from '@/types/cart.types';
import { uploadData, getUrl } from 'aws-amplify/storage';

const imageUrls = ref<Record<string, string>>({});
const { products, loading, error, loadProducts } = useProducts();
const cartStore = useCartStore();
const { showToast } = useToast();
const sortBy = ref('position');

const loadImageUrls = async () => {
  for (const product of products.value) {
    if (product.imageUrl) {
      try {
        const { url } = await getUrl({ path: product.imageUrl });
        imageUrls.value[product.id] = url.toString();
      } catch (error) {
        console.error("Error cargando imagen:", error);
      }
    }
  }
};

const hasUpcomingPromotion = (product: Product): boolean => {
  if (!product.isPromoted || !product.promotionStartDate || !product.promotionEndDate) {
    return false;
  }

  const currentDate = getCurrentPeruDate();

  if (currentDate >= product.promotionStartDate && currentDate <= product.promotionEndDate) {
    return false;
  }

  return product.promotionStartDate > currentDate;
};

const shouldShowProduct = (product: Product): boolean => {
  if (!product.isPromoted) {
    return true;
  }

  if (!product.promotionStartDate || !product.promotionEndDate) {
    return true;
  }

  const currentDate = getCurrentPeruDate();

  if (currentDate >= product.promotionStartDate && currentDate <= product.promotionEndDate) {
    return false;
  }

  return true;
};

const getCurrentPeruDate = (): string => {
  const date = new Date();
  const peruDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }));

  const year = peruDate.getFullYear();
  const month = String(peruDate.getMonth() + 1).padStart(2, '0');
  const day = String(peruDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatPromotionDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long'
  }).format(date);
};

const calculateDiscountedPrice = (product: Product): number => {
  if (!product.price || !product.discountPercentage) {
    return product.price || 0;
  }
  return product.price * (1 - product.discountPercentage / 100);
};

const sortedProducts = computed(() => {
  if (!products.value) return [];

  const productsToShow = products.value.filter(product => shouldShowProduct(product));

  return productsToShow.sort((a, b) => {
    switch (sortBy.value) {
      case 'price-asc':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default:
        if (hasUpcomingPromotion(a) && !hasUpcomingPromotion(b)) return -1;
        if (!hasUpcomingPromotion(a) && hasUpcomingPromotion(b)) return 1;
        return 0;
    }
  });
});

const addToCart = (product: Product) => {
  if (!product.stock) {
    showToast({
      type: 'error',
      message: 'Producto agotado'
    });
    return;
  }

  const cartItem: CartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    imageUrl: product.imageUrl
  };

  cartStore.addItem(cartItem);

  showToast({
    type: 'success',
    message: 'Producto añadido'
  });
};

onMounted(() => {
  loadProducts();
});

watch(() => products.value, () => {
  loadImageUrls();
}, { immediate: true });
</script>

<style scoped>
.promotional-products {
  padding: 0 20px;
}

.hero-banner-section {
  margin-bottom: 30px;
}

.promotion-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #000;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.promotion-date {
  font-size: 0.75rem;
  font-weight: 500;
}

.promotion-discount {
  font-size: 1rem;
  font-weight: bold;
}

.promotion-start {
  font-size: 0.75rem;
  color: #ffd700;
}

.price-info.has-promotion {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.future-price {
  font-size: 0.85rem;
  color: #ff4444;
  font-weight: 500;
}

.promo-header {
  background-color: #ffffff22;
  color: white;
  padding: 40px 0;
  text-align: center;
  margin-bottom: 30px;
  text-decoration: none;
  display: block;
}

.promo-header h1 {
  font-size: 2.5rem;
  margin: 0;
  position: relative;
  z-index: 2;
}

.hero-banner {
  position: relative;
  display: block;
  width: 100%;
  height: 200px;
  overflow: hidden;
  text-decoration: none;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hero-banner:hover .hero-image {
  transform: scale(1.05);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.hero-overlay h1 {
  color: white;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.discover-btn {
  background: white;
  color: black;
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.discover-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  background: #f0f0f0;
}

@media (max-width: 768px) {
  .hero-overlay h1 {
    font-size: 2rem;
  }

  .discover-btn {
    padding: 10px 25px;
    font-size: 1rem;
  }
}

/* Rest of the styles remain the same */
.filter-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
  padding: 0 20px;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 20px;
}

.product-card {
  background: white;
  border: 1px solid #eee;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-content {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.product-image {
  margin-bottom: 15px;
}

.product-image img {
  max-width: 100%;
  height: auto;
}

.brand-name {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.product-name {
  font-size: 1.1rem;
  margin: 5px 0;
}

.product-description {
  font-size: 0.9rem;
  color: #666;
  margin: 5px 0;
}

.product-price {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 10px 0;
}

.stock-status {
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin: 10px 0;
  background-color: #e8f5e9;
  color: #2e7d32;
}

.stock-status.low-stock {
  background-color: #fff3e0;
  color: #ef6c00;
}

.stock-status.out-of-stock {
  background-color: #ffebee;
  color: #c62828;
}

.add-to-cart {
  background-color: #000;
  color: white;
  border: none;
  padding: 10px 20px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.add-to-cart:hover {
  background-color: #333;
}

.add-to-cart.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.add-to-cart.disabled:hover {
  background-color: #ccc;
}

.loading-state {
  text-align: center;
  padding: 50px;
}

.error-state {
  text-align: center;
  color: red;
  padding: 50px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #000;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>