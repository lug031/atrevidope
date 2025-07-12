export interface Story {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  audioUrl?: string;
  externalLink?: string;
  productID?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  active: boolean;
  views: number;
  likes: number;
  wants: number;
  duration: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoryInteraction {
  id: string;
  storyID: string;
  userEmail: string;
  type: "view" | "like" | "want";
  createdAt: string;
}
