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
  title: string;
  description: string;
  category?: string | null;
  cover_image?: string | null;
  created_at: Date;
  location: string;
} 