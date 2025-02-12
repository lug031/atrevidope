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
