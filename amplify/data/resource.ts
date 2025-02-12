import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Category: a
    .model({
      name: a.string(),
      description: a.string(),
      active: a.boolean(),
      products: a.hasMany("Product", "categoryID"),
    })
    .authorization((allow) => [
      allow.groups(["admin"]).to(["read", "create", "update", "delete"]),
      allow.authenticated().to(["read"]),
      allow.publicApiKey().to(["read"]),
    ]),

  Product: a
    .model({
      name: a.string(),
      brand: a.string(),
      description: a.string(),
      price: a.float(),
      originalPrice: a.float(),
      discountPercentage: a.integer(),
      stock: a.integer(),
      active: a.boolean(),
      isPromoted: a.boolean(),
      categoryID: a.string(),
      category: a.belongsTo("Category", "categoryID"),
      imageUrl: a.string(),
      promotionStartDate: a.string(),
      promotionEndDate: a.string(),
      promotionType: a.string(),
      cartItems: a.hasMany("CartItem", "productID"),
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
