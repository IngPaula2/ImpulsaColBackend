export interface User {
  id?: number;
  created_at?: Date;
  full_name: string;
  email: string;
  password_hash?: string;
  document_type: string;
  document_number: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  country: string;
  birth_date: string;
} 