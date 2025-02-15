import { ref } from "vue";

export const maintenanceConfig = {
  isEnabled: ref(false),
  features: {
    orderCreation: ref(true),
  },
  startDate: "2024-02-15T00:00:00",
  endDate: "2024-02-16T00:00:00",
  message: {
    title: "Sitio en Mantenimiento",
    description:
      "Estamos realizando mejoras. Algunas funciones podrían no estar disponibles.",
  },
};
