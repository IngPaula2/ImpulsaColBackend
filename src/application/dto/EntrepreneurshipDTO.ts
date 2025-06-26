export interface CreateEntrepreneurshipDTO {
  user_id: number;
  title: string;
  description: string;
  category?: string;
  cover_image?: string;
}

export interface EntrepreneurshipResponseDTO {
  id: number;
  user_id: number;
  user_name: string;
  user_profile_image: string | null;
  title: string;
  description: string;
  category: string;
  cover_image: string;
  created_at: Date;
  location: string;
} 