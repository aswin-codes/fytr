export interface Exercise {
  id: string;
  name: string;
  force?: string;
  level?: string;
  mechanic?: string;
  equipment?: string;
  category?: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  instructions: string[];
  image_urls: string[];
}
