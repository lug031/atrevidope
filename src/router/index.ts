import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import HomeView from "@/views/HomeView.vue";
import ProfileView from "@/views/ProfileView.vue";
import AdminView from "@/views/AdminView.vue";
import NotFoundView from "@/views/NotFoundView.vue";
import WebProductsView from "@/views/WebProductsView.vue";

import AdminDashboard from "@/views/admin/DashboardView.vue";
import AdminProducts from "@/views/admin/ProductsView.vue";
import AdminBrands from "@/views/admin/BrandsView.vue";
import AdminCategories from "@/views/admin/CategoriesView.vue";
import AdminCustomers from "@/views/admin/CustomersView.vue";
import AdminOrders from "@/views/admin/OrdersView.vue";
import AdminReports from "@/views/admin/ReportsView.vue";
import AdminUsers from "@/views/admin/UsersView.vue";
import PromotionsView from "@/views/PromotionsView.vue";
import ProductDetailView from "../views/ProductDetailView.vue";
import CategoryProductsView from "@/views/CategoryProductsView.vue";
import CheckoutView from "@/views/CheckoutView.vue";
import MyOrdersView from "@/views/MyOrdersView.vue";
import BrandProductsView from "@/views/BrandProductsView.vue";
import FaqView from "@/views/FaqView.vue";
import ContactView from "@/views/ContactView.vue";
import AboutUsView from "@/views/AboutUsView.vue";
import PaymentInfoView from "@/views/PaymentInfoView.vue";
import ShippingInfoView from "@/views/ShippingInfoView.vue";
import OrderDetailView from "@/views/OrderDetailView.vue";

let authInitialized = false;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: "/promotions",
      name: "promotions",
      component: PromotionsView,
      meta: { requiresAuth: false },
    },
    {
      path: "/product/:id",
      name: "ProductDetail",
      component: ProductDetailView,
      meta: { requiresAuth: false },
    },
    {
      path: "/web-products",
      name: "web-products",
      component: WebProductsView,
      meta: { requiresAuth: false },
    },
    {
      path: "/category/:categoryId",
      name: "CategoryProducts",
      component: CategoryProductsView,
      meta: { requiresAuth: false },
    },
    {
      path: "/brand/:brandId",
      name: "BrandProducts",
      component: BrandProductsView,
      meta: { requiresAuth: false },
    },
    {
      path: "/checkout",
      name: "checkout",
      component: CheckoutView,
      meta: { requiresAuth: false },
    },
    {
      path: "/my-orders",
      name: "my-orders",
      component: MyOrdersView,
      meta: { requiresAuth: false },
    },
    {
      path: "/order/:id",
      name: "order-detail",
      component: OrderDetailView,
      meta: { requiresAuth: false },
    },
    {
      path: "/faq",
      name: "faq",
      component: FaqView,
      meta: { requiresAuth: false },
    },
    {
      path: "/contacto",
      name: "contacto",
      component: ContactView,
      meta: { requiresAuth: false },
    },
    {
      path: "/nosotros",
      name: "nosotros",
      component: AboutUsView,
      meta: { requiresAuth: false },
    },
    {
      path: "/pago-info",
      name: "pago-info",
      component: PaymentInfoView,
      meta: { requiresAuth: false },
    },
    {
      path: "/envio-info",
      name: "envio-info",
      component: ShippingInfoView,
      meta: { requiresAuth: false },
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: "/admin",
      component: AdminView,
      meta: { requiresAdmin: true },
      children: [
        {
          path: "dashboard",
          name: "admin-dashboard",
          component: AdminDashboard,
          meta: { requiresAdmin: true },
        },
        {
          path: "products",
          name: "admin-products",
          component: AdminProducts,
          meta: { requiresAdmin: true },
        },
        {
          path: "brands",
          name: "admin-brands",
          component: AdminBrands,
          meta: { requiresAdmin: true },
        },
        {
          path: "categories",
          name: "admin-categories",
          component: AdminCategories,
          meta: { requiresAdmin: true },
        },
        {
          path: "customers",
          name: "admin-customers",
          component: AdminCustomers,
          meta: { requiresAdmin: true },
        },
        {
          path: "orders",
          name: "admin-orders",
          component: AdminOrders,
          meta: { requiresAdmin: true },
        },
        {
          path: "reports",
          name: "admin-reports",
          component: AdminReports,
          meta: { requiresAdmin: true },
        },
        {
          path: "users",
          name: "admin-users",
          component: AdminUsers,
          meta: { requiresAdmin: true },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView,
      meta: { requiresAuth: false },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }

    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authInitialized) {
    try {
      await authStore.checkAuth();
      authInitialized = true;
    } catch (error) {
      console.error("Error initializing auth:", error);
    }
  }

  if (to.meta.requiresAdmin) {
    try {
      const isAdmin = await authStore.checkAdmin();
      isAdmin ? next() : next({ name: "not-found" });
    } catch {
      next({ name: "not-found" });
    }
  } else if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      next();
    } else {
      next({ name: "not-found" });
    }
  } else {
    next();
  }
});

export default router;
