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

  // Agregar esta función al inicio del store, después de los clients
  const normalizeStoryOrders = (stories: any[]) => {
    // Primero ordenar por orden actual y fecha de creación
    const sortedStories = stories.sort((a, b) => {
      if (a.order !== b.order) {
        return (a.order || 0) - (b.order || 0);
      }
      return (
        new Date(a.createdAt || "").getTime() -
        new Date(b.createdAt || "").getTime()
      );
    });

    // Renumerar desde 0 de forma secuencial
    return sortedStories.map((story, index) => ({
      ...story,
      order: index,
    }));
  };

  // FETCH - Obtener todas las historias (admin)
  const fetchStories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data: items } = await authClient.models.Story.list();

      if (!items) {
        throw new Error("Error al obtener historias: items es null");
      }

      // Obtener información del producto relacionado para cada historia
      const storiesWithProducts = await Promise.all(
        items.map(async (story) => {
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

          return {
            ...story,
            product: productInfo,
          };
        })
      );

      // Normalizar órdenes desde 0
      const normalizedStories = normalizeStoryOrders(storiesWithProducts);

      stories.value = normalizedStories as Story[];
    } catch (err) {
      error.value = "Error al cargar historias";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // FETCH ACTIVE - Obtener historias activas (público)
  const fetchActiveStories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data: items } = await publicClient.models.Story.list({
        filter: {
          active: { eq: true },
        },
      });

      // Obtener información del producto relacionado si existe
      const storiesWithProducts = await Promise.all(
        items.map(async (story) => {
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

      // Normalizar órdenes desde 0 para stories activas
      const normalizedStories = normalizeStoryOrders(storiesWithProducts);

      stories.value = normalizedStories as Story[];
    } catch (err) {
      error.value = "Error al cargar historias";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // CREATE - Crear nueva historia
  const createStory = async (
    storyData: Omit<Story, "id" | "createdAt" | "updatedAt">
  ) => {
    loading.value = true;
    try {
      const { data: newStory } = await authClient.models.Story.create({
        title: storyData.title,
        description: storyData.description,
        imageUrl: storyData.imageUrl,
        audioUrl: storyData.audioUrl || undefined,
        externalLink: storyData.externalLink || undefined,
        productID: storyData.productID || undefined,
        active: storyData.active,
        views: storyData.views || 0,
        likes: storyData.likes || 0,
        wants: storyData.wants || 0,
        duration: storyData.duration,
        order: storyData.order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (!newStory || !newStory.id) {
        throw new Error(
          "Error al crear la historia: respuesta inválida del servidor"
        );
      }

      // Recargar las historias
      await fetchStories();
      return newStory;
    } catch (err) {
      error.value = "Error al crear historia";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // UPDATE - Actualizar historia
  const updateStory = async (
    id: string,
    storyData: Partial<Omit<Story, "id" | "createdAt">>
  ) => {
    loading.value = true;
    try {
      const { data: updatedStory } = await authClient.models.Story.update({
        id,
        ...storyData,
        updatedAt: new Date().toISOString(),
      });

      await fetchStories();
      return updatedStory;
    } catch (err) {
      error.value = "Error al actualizar historia";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // DELETE - Eliminar historia
  const deleteStory = async (id: string) => {
    loading.value = true;
    try {
      // Eliminar interacciones relacionadas primero
      const { data: interactions } =
        await authClient.models.StoryInteraction.list({
          filter: { storyID: { eq: id } },
        });

      if (interactions) {
        await Promise.all(
          interactions.map((interaction) =>
            interaction.id
              ? authClient.models.StoryInteraction.delete({
                  id: interaction.id,
                })
              : Promise.resolve()
          )
        );
      }

      // Eliminar la historia
      await authClient.models.Story.delete({ id });

      await fetchStories();
    } catch (err) {
      error.value = "Error al eliminar historia";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // GET BY ID - Obtener historia por ID
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

  const refreshStoryStats = async (storyId: string) => {
    try {
      const { data: story } = await authClient.models.Story.get({
        id: storyId,
      });

      if (story) {
        // Actualizar la historia en el array local
        const index = stories.value.findIndex((s) => s.id === storyId);
        if (index !== -1) {
          stories.value[index] = {
            ...stories.value[index],
            views: story.views || 0, // Usar 0 si es null
            likes: story.likes || 0, // Usar 0 si es null
            wants: story.wants || 0, // Usar 0 si es null
          };
        }
      }
    } catch (error) {
      console.error("Error refreshing story stats:", error);
    }
  };

  // INTERACTIONS - Métodos para interacciones
  const addStoryView = async (storyId: string, userEmail?: string) => {
    try {
      // Incrementar contador de vistas
      const story = stories.value.find((s) => s.id === storyId);
      if (story) {
        await publicClient.models.Story.update({
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

  const checkIfUserLiked = async (
    storyId: string,
    userEmail: string
  ): Promise<boolean> => {
    try {
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
      return existingLike && existingLike.length > 0;
    } catch (error) {
      console.error("Error checking if user liked:", error);
      return false;
    }
  };

  const getUsersWhoLiked = async (storyId: string): Promise<string[]> => {
    try {
      const { data: likes } = await authClient.models.StoryInteraction.list({
        filter: {
          and: [{ storyID: { eq: storyId } }, { type: { eq: "like" } }],
        },
      });
      console.log(likes);
      return likes
        ? likes
            .map((like) => like.userEmail)
            .filter((email): email is string => email !== null)
        : [];
    } catch (error) {
      console.error("Error getting users who liked:", error);
      return [];
    }
  };

  const toggleStoryWant = async (storyId: string, userEmail: string) => {
    try {
      const story = stories.value.find((s) => s.id === storyId);
      if (!story) return;

      // Verificar si ya tiene want
      const { data: existingWant } =
        await authClient.models.StoryInteraction.list({
          filter: {
            and: [
              { storyID: { eq: storyId } },
              { userEmail: { eq: userEmail } },
              { type: { eq: "want" } },
            ],
          },
        });

      if (existingWant && existingWant.length > 0) {
        // Quitar want
        await authClient.models.StoryInteraction.delete({
          id: existingWant[0].id,
        });
        await authClient.models.Story.update({
          id: storyId,
          wants: Math.max(0, (story.wants || 0) - 1),
        });
        story.wants = Math.max(0, (story.wants || 0) - 1);
      } else {
        // Agregar want
        await authClient.models.StoryInteraction.create({
          storyID: storyId,
          userEmail,
          type: "want",
          createdAt: new Date().toISOString(),
        });
        await authClient.models.Story.update({
          id: storyId,
          wants: (story.wants || 0) + 1,
        });
        story.wants = (story.wants || 0) + 1;
      }
    } catch (error) {
      console.error("Error toggling story want:", error);
    }
  };

  const checkIfUserWanted = async (
    storyId: string,
    userEmail: string
  ): Promise<boolean> => {
    try {
      const { data: existingWant } =
        await authClient.models.StoryInteraction.list({
          filter: {
            and: [
              { storyID: { eq: storyId } },
              { userEmail: { eq: userEmail } },
              { type: { eq: "want" } },
            ],
          },
        });
      return existingWant && existingWant.length > 0;
    } catch (error) {
      console.error("Error checking if user wanted:", error);
      return false;
    }
  };

  const getUsersWhoWanted = async (storyId: string): Promise<string[]> => {
    try {
      const { data: wants } = await authClient.models.StoryInteraction.list({
        filter: {
          and: [{ storyID: { eq: storyId } }, { type: { eq: "want" } }],
        },
      });
      return wants
        ? wants
            .map((want) => want.userEmail)
            .filter((email): email is string => email !== null)
        : [];
    } catch (error) {
      console.error("Error getting users who wanted:", error);
      return [];
    }
  };

  // Método para sincronizar los órdenes normalizados en la BD
  const syncStoryOrders = async () => {
    try {
      const updatePromises = stories.value.map((story, index) => {
        if (story.order !== index) {
          return authClient.models.Story.update({
            id: story.id,
            order: index,
            updatedAt: new Date().toISOString(),
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error syncing story orders:", error);
    }
  };

  return {
    stories,
    currentStory,
    loading,
    error,
    fetchStories, // Para admin
    fetchActiveStories, // Para público
    createStory, // CRUD
    updateStory, // CRUD
    deleteStory, // CRUD
    getStoryById,
    addStoryView,
    toggleStoryLike,
    addStoryWant,
    checkIfUserLiked,
    getUsersWhoLiked,
    toggleStoryWant,
    checkIfUserWanted,
    getUsersWhoWanted,
    syncStoryOrders,
    refreshStoryStats,
  };
});
