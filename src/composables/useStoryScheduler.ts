import { ref, onMounted, onUnmounted } from "vue";
import { useStoryStore } from "@/stores/story";

export function useStoryScheduler() {
  const storyStore = useStoryStore();
  const isRunning = ref(false);
  let schedulerInterval: NodeJS.Timeout | null = null;

  const startScheduler = () => {
    if (isRunning.value) return;

    // Verificar historias vencidas cada 5 minutos
    schedulerInterval = setInterval(async () => {
      try {
        await storyStore.checkExpiredStories();
      } catch (error) {
        console.error("Error in story scheduler:", error);
      }
    }, 5 * 60 * 1000); // 5 minutos

    isRunning.value = true;
  };

  const stopScheduler = () => {
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
      isRunning.value = false;
    }
  };

  const checkNow = async () => {
    try {
      await storyStore.checkExpiredStories();
    } catch (error) {
      console.error("Error checking expired stories:", error);
    }
  };

  // Auto-start y auto-stop
  onMounted(() => {
    checkNow(); // Verificar inmediatamente
    startScheduler();
  });

  onUnmounted(() => {
    stopScheduler();
  });

  return {
    isRunning,
    startScheduler,
    stopScheduler,
    checkNow,
  };
}
