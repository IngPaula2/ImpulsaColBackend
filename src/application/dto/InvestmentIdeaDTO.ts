export interface CreateInvestmentIdeaDTO {
  user_id: number;
  title: string;
  description: string;
  category?: string;
  target_amount?: number;
  investors_needed?: number;
  investor_message?: string;
}

export interface InvestmentIdeaResponseDTO {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category?: string;
  target_amount?: number;
  investors_needed?: number;
  investor_message?: string;
  created_at: Date;
} 