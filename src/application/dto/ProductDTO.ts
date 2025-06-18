export interface CreateProductDTO {
  entrepreneurship_id: number;
  name: string;
  description: string;
  price: number;
  images?: string;
  wants_investor?: boolean;
  investment_value?: number;
  investor_message?: string;
}

export interface ProductResponseDTO {
  id: number;
  entrepreneurship_id: number;
  name: string;
  description: string;
  price: number;
  images?: string;
  wants_investor?: boolean;
  investment_value?: number;
  investor_message?: string;
  created_at: Date;
} 