import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Category: a
    .model({
      name: a.string(),
      description: a.string(),
      active: a.boolean(),
      products: a.hasMany("ProductCategory", "categoryID"),
    })
    .authorization((allow) => [
      allow.groups(["admin"]).to(["read", "create", "update", "delete"]),
      allow.authenticated().to(["read"]),
      allow.publicApiKey().to(["read"]),
    ]),

  Brand: a
    .model({
      name: a.string(),
      description: a.string(),
      logo: a.string(),
      active: a.boolean(),
      products: a.hasMany("Product", "brandID"),
    })
    .authorization((allow) => [
      allow.groups(["admin"]).to(["read", "create", "update", "delete"]),
      allow.authenticated().to(["read"]),
      allow.publicApiKey().to(["read"]),
    ]),

  Product: a
    .model({
      name: a.string(),
      description: a.string(),
      price: a.float(),
      originalPrice: a.float(),
      discountPercentage: a.integer(),
      stock: a.integer(),
      active: a.boolean(),
      carousel: a.boolean(),
      isPromoted: a.boolean(),
      categories: a.hasMany("ProductCategory", "productID"),
      brandID: a.string(),
      brand: a.belongsTo("Brand", "brandID"),
      imageUrl: a.string(),
      imageUrls: a.string().array(),
      promotionStartDate: a.string(),
      promotionEndDate: a.string(),
      promotionType: a.string(),
      cartItems: a.hasMany("CartItem", "productID"),
      stories: a.hasMany("Story", "productID"),
    })
    .authorization((allow) => [
      allow.groups(["admin"]).to(["read", "create", "update", "delete"]),
      allow.authenticated().to(["read"]),
      allow.publicApiKey().to(["read"]),
    ]),

  ProductCategory: a
    .model({
      productID: a.string(),
      categoryID: a.string(),
      product: a.belongsTo("Product", "productID"),
      category: a.belongsTo("Category", "categoryID"),
    })
    .authorization((allow) => [
      allow.groups(["admin"]).to(["read", "create", "update", "delete"]),
      allow.authenticated().to(["read"]),
      allow.publicApiKey().to(["read"]),
    ]),

  Cart: a
    .model({
      userID: a.string(),
      items: a.hasMany("CartItem", "cartID"),
      status: a.enum(["active", "checkout", "abandoned", "completed"]),
      subtotal: a.float(),
      total: a.float(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.groups(["admin"]).to(["read", "create", "update", "delete"]),
      allow.authenticated().to(["read"]),
      allow.publicApiKey().to(["read"]),
    ]),

  CartItem: a
    .model({
      cartID: a.string(),
      cart: a.belongsTo("Cart", "cartID"),
      productID: a.string(),
      product: a.belongsTo("Product", "productID"),
      quantity: a.integer(),
      price: a.float(),
      originalPrice: a.float(),
      discountPercentage: a.integer(),
      isPromoted: a.boolean(),
    })
    .authorization((allow) => [
      allow.groups(["admin"]).to(["read", "create", "update", "delete"]),
      allow.authenticated().to(["read"]),
      allow.publicApiKey().to(["read"]),
    ]),

  Story: a
    .model({
      title: a.string(),
      description: a.string(),
      imageUrl: a.string(),
      audioUrl: a.string(),
      externalLink: a.string(), // Para redirigir a TikTok, etc.
      productID: a.string(), // Referencia al producto relacionado
      product: a.belongsTo("Product", "productID"),
      active: a.boolean(),
      views: a.integer(),
      likes: a.integer(),
      wants: a.integer(),
      duration: a.integer(), // Duración en segundos
      order: a.integer(), // Para ordenar las historias
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      interactions: a.hasMany("StoryInteraction", "storyID"),
    })
    .authorization((allow) => [
      allow.groups(["admin"]).to(["read", "create", "update", "delete"]),
      allow.authenticated().to(["read"]),
      allow.publicApiKey().to(["read"]),
    ]),

  StoryInteraction: a
    .model({
      storyID: a.string(),
      story: a.belongsTo("Story", "storyID"),
      userEmail: a.string(), // Email del usuario que interactuó
      type: a.enum(["view", "like", "want"]),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.groups(["admin"]).to(["read", "create", "update", "delete"]),
      allow.authenticated().to(["read", "create"]),
      allow.publicApiKey().to(["create"]), // Para permitir vistas sin autenticación
    ]),

  Order: a
    .model({
      // Customer Info como campos individuales
      firstName: a.string(),
      lastName: a.string(),
      email: a.string(),
      documentType: a.string(),
      documentNumber: a.string(),
      phone: a.string(),
      shippingMethod: a.string(),
      invoiceType: a.string(),

      // Order Items como JSON string
      items: a.string(),

      userEmail: a.string(),

      // Order Totals
      subtotal: a.float(),
      shipping: a.float(),
      total: a.float(),

      // Status
      status: a.enum(["pending", "processing", "completed", "cancelled"]),

      // Payment
      // Metodo de pago
      paymentMethod: a.string(),
      linkPago: a.string(),
      linkShort: a.string(),

      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.groups(["admin"]).to(["read", "create", "update", "delete"]),
      allow.authenticated().to(["read", "create"]),
      allow.publicApiKey().to(["read", "create"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
