import { computed } from "vue";
import { useStoryStore } from "@/stores/story";
import { storeToRefs } from "pinia";
import type { Story } from "@/types/story.types";

export function useStories() {
  const storyStore = useStoryStore();
  const { stories, currentStory, loading, error } = storeToRefs(storyStore);

  const totalStories = computed(() => stories.value.length);

  const activeStories = computed(() =>
    stories.value.filter((story) => story.active)
  );

  // NUEVO: Historias activas y no vencidas
  const activeNonExpiredStories = computed(() =>
    stories.value.filter((story) => {
      if (!story.active) return false;
      const { expired } = storyStore.getTimeRemaining(story.expiresAt);
      return !expired;
    })
  );

  // NUEVO: Historias vencidas
  const expiredStories = computed(() =>
    stories.value.filter((story) => {
      const { expired } = storyStore.getTimeRemaining(story.expiresAt);
      return expired;
    })
  );

  const loadStories = async () => {
    await storyStore.fetchStories();
  };

  // Modificar createStory para no incluir order
  const createStory = async (
    storyData: Omit<
      Story,
      "id" | "createdAt" | "updatedAt" | "expiresAt" | "order"
    >
  ) => {
    return await storyStore.createStory(storyData);
  };

  const updateStory = async (id: string, storyData: Partial<Story>) => {
    return await storyStore.updateStory(id, storyData);
  };

  const deleteStory = async (id: string) => {
    await storyStore.deleteStory(id);
  };

  const loadActiveStories = async () => {
    await storyStore.fetchActiveStories();
  };

  const getStoryById = async (storyId: string) => {
    return await storyStore.getStoryById(storyId);
  };

  const viewStory = async (storyId: string, userEmail?: string) => {
    await storyStore.addStoryView(storyId, userEmail);
  };

  const likeStory = async (storyId: string, userEmail: string) => {
    await storyStore.toggleStoryLike(storyId, userEmail);
  };

  const generateStoryLink = (storyId: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?story=${storyId}`;
  };

  const shareStory = async (story: Story) => {
    const shareData = {
      title: story.title,
      text: `SOLO EN ATREVIDO!`,
      url: generateStoryLink(story.id),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        const shareText = `${shareData.title}\n\nSOLO EN ATREVIDO!\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
      }
    } else {
      const shareText = `${shareData.title}\n\nSOLO EN ATREVIDO!\n\n${shareData.url}`;
      await navigator.clipboard.writeText(shareText);
    }
  };

  const checkIfUserLiked = async (storyId: string, userEmail: string) => {
    return await storyStore.checkIfUserLiked(storyId, userEmail);
  };

  const getUsersWhoLiked = async (storyId: string) => {
    return await storyStore.getUsersWhoLiked(storyId);
  };

  const wantStory = async (storyId: string, userEmail: string) => {
    await storyStore.toggleStoryWant(storyId, userEmail);
  };

  const checkIfUserWanted = async (storyId: string, userEmail: string) => {
    return await storyStore.checkIfUserWanted(storyId, userEmail);
  };

  const getUsersWhoWanted = async (storyId: string) => {
    return await storyStore.getUsersWhoWanted(storyId);
  };

  const refreshStoryStats = async (storyId: string) => {
    await storyStore.refreshStoryStats(storyId);
  };

  // NUEVOS: Métodos para manejo de tiempo
  const getTimeRemaining = (expiresAt: string) => {
    return storyStore.getTimeRemaining(expiresAt);
  };

  const checkExpiredStories = async () => {
    await storyStore.checkExpiredStories();
  };

  const forceExpireStory = async (storyId: string) => {
    //console.log("🧪 Composable: Intentando forzar vencimiento");
    return await storyStore.forceExpireStory(storyId);
  };

  const resetStoryExpiration = async (storyId: string) => {
    //console.log("🧪 Composable: Intentando restaurar historia");
    return await storyStore.resetStoryExpiration(storyId);
  };

  return {
    stories,
    currentStory,
    loading,
    error,
    totalStories,
    activeStories,
    activeNonExpiredStories, // NUEVO
    expiredStories, // NUEVO
    // Admin methods
    loadStories,
    createStory,
    updateStory,
    deleteStory,
    // Public methods
    loadActiveStories,
    getStoryById,
    viewStory,
    likeStory,
    wantStory,
    generateStoryLink,
    shareStory,
    checkIfUserLiked,
    getUsersWhoLiked,
    checkIfUserWanted,
    getUsersWhoWanted,
    refreshStoryStats,
    // Time management
    getTimeRemaining, // NUEVO
    checkExpiredStories, // NUEVO
    forceExpireStory, // TEMPORAL - VERIFICAR QUE ESTÉ AQUÍ
    resetStoryExpiration, // TEMPORAL - VERIFICAR QUE ESTÉ AQUÍ
  };
}
