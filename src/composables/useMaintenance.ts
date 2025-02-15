import { computed } from "vue";
import { maintenanceConfig } from "@/config/maintenance";

export function useMaintenance() {
  const isMaintenanceMode = computed(() => maintenanceConfig.isEnabled.value)

  const isFeatureAvailable = (
    feature: keyof typeof maintenanceConfig.features
  ) => {
    return (
      !isMaintenanceMode.value || maintenanceConfig.features[feature].value
    );
  };

  const getMaintenanceInfo = () => {
    return {
      startDate: new Date(maintenanceConfig.startDate),
      endDate: new Date(maintenanceConfig.endDate),
      message: maintenanceConfig.message,
    };
  };

  return {
    isMaintenanceMode,
    isFeatureAvailable,
    getMaintenanceInfo,
  };
}
