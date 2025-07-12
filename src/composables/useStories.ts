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

  // MÉTODOS PARA ADMIN
  const loadStories = async () => {
    await storyStore.fetchStories(); // Para admin - todas las historias
  };

  const createStory = async (
    storyData: Omit<Story, "id" | "createdAt" | "updatedAt">
  ) => {
    return await storyStore.createStory(storyData);
  };

  const updateStory = async (id: string, storyData: Partial<Story>) => {
    return await storyStore.updateStory(id, storyData);
  };

  const deleteStory = async (id: string) => {
    await storyStore.deleteStory(id);
  };

  // MÉTODOS PARA PÚBLICO
  const loadActiveStories = async () => {
    await storyStore.fetchActiveStories(); // Para público - solo activas
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
      text: story.description,
      url: generateStoryLink(story.id),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback a copiar al clipboard
        await navigator.clipboard.writeText(shareData.url);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      await navigator.clipboard.writeText(shareData.url);
    }
  };

  const checkIfUserLiked = async (storyId: string, userEmail: string) => {
    return await storyStore.checkIfUserLiked(storyId, userEmail);
  };

  const getUsersWhoLiked = async (storyId: string) => {
    return await storyStore.getUsersWhoLiked(storyId);
  };

  const wantStory = async (storyId: string, userEmail: string) => {
    await storyStore.toggleStoryWant(storyId, userEmail); // Cambiar aquí
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

  return {
    stories,
    currentStory,
    loading,
    error,
    totalStories,
    activeStories,
    // Admin methods
    loadStories,
    createStory, // NUEVO
    updateStory, // NUEVO
    deleteStory, // NUEVO
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
  };
}
