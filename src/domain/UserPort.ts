import { User } from './User';

export interface UserPort {
    register(user: Omit<User, 'id' | 'created_at'>): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
} 