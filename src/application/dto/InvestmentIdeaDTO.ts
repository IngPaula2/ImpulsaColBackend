export interface CreateInvestmentIdeaDTO {
  user_id: number;
  title: string;
  description: string;
  category?: string;
  target_amount?: number;
  investors_needed?: number;
  investor_message?: string;
  images?: string[];
  video_url?: string | null;
  entrepreneurship_id?: number;
  is_active?: boolean;
}

export interface UpdateInvestmentIdeaDTO {
  title?: string;
  description?: string;
  category?: string;
  target_amount?: number;
  investors_needed?: number;
  investor_message?: string;
  images?: string[];
  video_url?: string | null;
  entrepreneurship_id?: number;
  is_active?: boolean;
}

export interface InvestmentIdeaResponseDTO {
  id: number;
  user_id: number;
  user_name?: string;
  user_profile_image?: string;
  title: string;
  description: string;
  category?: string;
  target_amount?: number;
  investors_needed?: number;
  investor_message?: string;
  images?: string[];
  video_url?: string | null;
  entrepreneurship_id?: number;
  entrepreneurship?: {
    id: number;
    title: string;
  };
  is_active: boolean;
  created_at: Date;
} 