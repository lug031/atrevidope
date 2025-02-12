<template>
    <MainLayout>
        <div class="category-products">
            <!-- Header Section -->
            <div class="category-header">
                <h1 class="category-title">{{ $route.query.name || 'Productos' }}</h1>
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

            <div v-else-if="sortedProducts.length === 0" class="empty-state">
                No hay productos disponibles en esta categoría.
            </div>

            <div v-else class="products-grid">
                <div v-for="product in sortedProducts" :key="product.id" class="product-card">
                    <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" class="product-content">
                        <!-- Badge de promoción futura -->
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
                            <div class="formatted-description"
                                v-html="parseMarkdown(truncateText(product.description, 100))" />

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

                    <button @click.stop="addToCart(product)" class="add-to-cart"
                        :class="{ 'disabled': product.stock === 0 }" :disabled="product.stock === 0">
                        {{ product.stock === 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO' }}
                    </button>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { useProducts } from '@/composables/useProducts';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/composables/useToast';
import type { Product } from '@/types/product.types';
import type { CartItem } from '@/types/cart.types';
import { getUrl } from 'aws-amplify/storage';

const router = useRouter();
const route = useRoute();
const imageUrls = ref<Record<string, string>>({});
const { products, loading, error, loadProductsByCategory } = useProducts();
const cartStore = useCartStore();
const { showToast } = useToast();
const sortBy = ref('position');

const truncateText = (text: string, maxLength: number = 100): string => {
    if (!text) return '';

    // Si el texto es más corto que el máximo, retornarlo completo
    if (text.length <= maxLength) return text;

    // Cortar el texto hasta el máximo
    let truncated = text.slice(0, maxLength);

    // Asegurarse de no cortar a mitad de una palabra
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
        truncated = truncated.slice(0, lastSpace);
    }

    // Asegurarse de no cortar a mitad de un formato markdown
    const boldCount = (truncated.match(/\*\*/g) || []).length;
    const italicCount = (truncated.match(/\*/g) || []).length;

    // Si hay formatos markdown incompletos, ajustarlos
    if (boldCount % 2 !== 0) {
        truncated = truncated.replace(/\*\*[^*]*$/, '');
    }
    if ((italicCount - boldCount * 2) % 2 !== 0) {
        truncated = truncated.replace(/\*[^*]*$/, '');
    }

    return truncated + '...';
};

const parseMarkdown = (text: string): string => {
    if (!text) return '';

    return text
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\s*[-+*]\s+(.*)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // Wrap in paragraphs if not already wrapped
        .replace(/^(.+?)(?:<br>|$)/gm, (_, text) => {
            if (!/^<[h|p|ul|ol|li]/.test(text)) {
                return `<p>${text}</p>`;
            }
            return text;
        });
};

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

const sortedProducts = computed(() => {
    if (!products.value) return [];

    return [...products.value].sort((a, b) => {
        switch (sortBy.value) {
            case 'price-asc':
                return (a.price || 0) - (b.price || 0);
            case 'price-desc':
                return (b.price || 0) - (a.price || 0);
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            default:
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

const loadCategoryProducts = async () => {
    const categoryId = route.params.categoryId as string;
    if (!categoryId) {
        router.push('/'); // Redirigir al inicio si no hay ID de categoría
        return;
    }

    try {
        await loadProductsByCategory(categoryId);
    } catch (err) {
        console.error('Error al cargar productos de categoría:', err);
    }
};

onMounted(() => {
    loadCategoryProducts();
});

watch(
    () => route.params.categoryId,
    (newCategoryId) => {
        if (newCategoryId) {
            loadCategoryProducts();
        }
    }
);

watch(() => products.value, () => {
    loadImageUrls();
}, { immediate: true });
</script>

<style scoped>
.category-products {
    padding: 0 20px;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    background-color: #f9fafb;
    border-radius: 8px;
    color: #6b7280;
    font-size: 1.1rem;
}

.category-header {
    background: linear-gradient(to right, #1a1a1a, #2d2d2d);
    padding: 2.5rem 0;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
}

.category-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, #b6b6b6, #505050);
}

.category-title {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    color: white;
    font-size: 2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 1rem;
}

/* Estilos heredados del WebProductsView */
.formatted-description {
    line-height: 1.6;
    color: #374151;
    font-size: 0.9rem;
    margin: 5px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.formatted-description :deep(h1),
.formatted-description :deep(h2),
.formatted-description :deep(h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
}

.formatted-description :deep(p) {
    margin: 0;
    display: inline;
}

.formatted-description :deep(strong) {
    font-weight: 600;
    color: #444;
}

.formatted-description :deep(em) {
    font-style: italic;
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
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background-color: white;
    color: #1a1a1a;
    font-size: 0.9rem;
    transition: all 0.2s;
    cursor: pointer;
}

.sort-select:hover {
    border-color: #cbd5e1;
}

.sort-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
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
    transition: all 0.3s ease;
    position: relative;
    border-radius: 8px;
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
    position: relative;
    overflow: hidden;
    border-radius: 4px;
}

.product-image img {
    max-width: 100%;
    height: auto;
    transition: transform 0.3s ease;
}

.product-content:hover .product-image img {
    transform: scale(1.05);
}

.brand-name {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
}

.product-name {
    font-size: 1.1rem;
    margin: 5px 0;
    color: #1a1a1a;
    font-weight: 500;
}

.product-price {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 10px 0;
    color: #1a1a1a;
}

.stock-status {
    text-align: center;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    margin: 10px 0;
    background-color: #e8f5e9;
    color: #2e7d32;
    font-weight: 500;
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
    padding: 12px 20px;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
    border-radius: 6px;
    font-weight: 500;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
}

.add-to-cart:hover {
    background-color: #333;
    transform: translateY(-2px);
}

.add-to-cart.disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
}

.loading-state {
    text-align: center;
    padding: 50px;
}

.error-state {
    text-align: center;
    color: #ef4444;
    padding: 50px;
    background-color: #fee2e2;
    border-radius: 8px;
    margin: 20px;
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

/* Responsive */
@media (max-width: 768px) {
    .category-title {
        font-size: 1.5rem;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
        padding: 15px;
    }

    .product-card {
        padding: 15px;
    }

    .add-to-cart {
        padding: 10px 16px;
        font-size: 0.8rem;
    }

    .filter-section {
        padding: 0 15px;
    }

    .sort-select {
        padding: 6px 10px;
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .category-products {
        padding: 0 10px;
    }

    .category-header {
        padding: 2rem 0;
    }

    .products-grid {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 10px;
    }
}
</style>