/**
 * DTO para crear un producto
 */
export interface CreateProductDTO {
  entrepreneurship_id: number;
  name: string;
  description: string;
  price: number;
  images?: string[];
  wants_investor?: boolean;
  investment_value?: number;
  investor_message?: string;
}

/**
 * DTO para actualizar un producto (todos los campos opcionales)
 */
export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  wants_investor?: boolean;
  investment_value?: number;
  investor_message?: string;
}

/**
 * DTO de respuesta para producto
 */
export interface ProductResponseDTO {
  id: number;
  entrepreneurship_id: number;
  name: string;
  description: string;
  price: number;
  images?: string[];
  wants_investor?: boolean;
  investment_value?: number;
  investor_message?: string;
  created_at: Date;
} 