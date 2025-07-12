import { defineStore } from "pinia";
import { ref } from "vue";
import type { Schema } from "../../amplify/data/resource";
import type { Story } from "@/types/story.types";
import { generateClient } from "aws-amplify/data";

const publicClient = generateClient<Schema>({
  authMode: "apiKey",
});

const authClient = generateClient<Schema>({
  authMode: "userPool",
});

export const useStoryStore = defineStore("story", () => {
  const stories = ref<Story[]>([]);
  const currentStory = ref<Story | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchActiveStories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data: items } = await publicClient.models.Story.list({
        filter: {
          active: { eq: true },
        },
      });

      // Ordenar por campo 'order' y luego por fecha de creación
      const sortedStories = items.sort((a, b) => {
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0);
        }
        return (
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
        );
      });

      // Obtener información del producto relacionado si existe
      const storiesWithProducts = await Promise.all(
        sortedStories.map(async (story) => {
          if (story.productID) {
            try {
              const { data: product } = await publicClient.models.Product.get({
                id: story.productID,
              });
              return {
                ...story,
                product: product
                  ? {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                    }
                  : undefined,
              };
            } catch (error) {
              console.error("Error loading product for story:", error);
              return story;
            }
          }
          return story;
        })
      );

      stories.value = storiesWithProducts as Story[];
    } catch (err) {
      error.value = "Error al cargar historias";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const getStoryById = async (storyId: string): Promise<Story | null> => {
    try {
      const { data: story } = await publicClient.models.Story.get({
        id: storyId,
      });

      if (!story) return null;

      // Obtener producto relacionado si existe
      let productInfo = undefined;
      if (story.productID) {
        try {
          const { data: product } = await publicClient.models.Product.get({
            id: story.productID,
          });
          if (product) {
            productInfo = {
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
            };
          }
        } catch (error) {
          console.error("Error loading product for story:", error);
        }
      }

      currentStory.value = {
        ...story,
        product: productInfo,
      } as Story;

      return currentStory.value;
    } catch (err) {
      console.error("Error getting story by ID:", err);
      return null;
    }
  };

  const addStoryView = async (storyId: string, userEmail?: string) => {
    try {
      // Incrementar contador de vistas
      const story = stories.value.find((s) => s.id === storyId);
      if (story) {
        await authClient.models.Story.update({
          id: storyId,
          views: (story.views || 0) + 1,
        });
        story.views = (story.views || 0) + 1;
      }

      // Registrar interacción si hay usuario
      if (userEmail) {
        await publicClient.models.StoryInteraction.create({
          storyID: storyId,
          userEmail,
          type: "view",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error adding story view:", error);
    }
  };

  const toggleStoryLike = async (storyId: string, userEmail: string) => {
    try {
      const story = stories.value.find((s) => s.id === storyId);
      if (!story) return;

      // Verificar si ya tiene like
      const { data: existingLike } =
        await authClient.models.StoryInteraction.list({
          filter: {
            and: [
              { storyID: { eq: storyId } },
              { userEmail: { eq: userEmail } },
              { type: { eq: "like" } },
            ],
          },
        });

      if (existingLike && existingLike.length > 0) {
        // Quitar like
        await authClient.models.StoryInteraction.delete({
          id: existingLike[0].id,
        });
        await authClient.models.Story.update({
          id: storyId,
          likes: Math.max(0, (story.likes || 0) - 1),
        });
        story.likes = Math.max(0, (story.likes || 0) - 1);
      } else {
        // Agregar like
        await authClient.models.StoryInteraction.create({
          storyID: storyId,
          userEmail,
          type: "like",
          createdAt: new Date().toISOString(),
        });
        await authClient.models.Story.update({
          id: storyId,
          likes: (story.likes || 0) + 1,
        });
        story.likes = (story.likes || 0) + 1;
      }
    } catch (error) {
      console.error("Error toggling story like:", error);
    }
  };

  const addStoryWant = async (storyId: string, userEmail?: string) => {
    try {
      const story = stories.value.find((s) => s.id === storyId);
      if (!story) return;

      // Incrementar contador de "lo quiero"
      await authClient.models.Story.update({
        id: storyId,
        wants: (story.wants || 0) + 1,
      });
      story.wants = (story.wants || 0) + 1;

      // Registrar interacción si hay usuario
      if (userEmail) {
        await authClient.models.StoryInteraction.create({
          storyID: storyId,
          userEmail,
          type: "want",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error adding story want:", error);
    }
  };

  return {
    stories,
    currentStory,
    loading,
    error,
    fetchActiveStories,
    getStoryById,
    addStoryView,
    toggleStoryLike,
    addStoryWant,
  };
});
