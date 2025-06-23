import { User, UserRegistrationData } from '../models/User';

// Tipo para actualización con propiedades individuales
export interface UserUpdateData {
    email?: string;
    password_hash?: string;
    full_name?: string;
    document_type?: string;
    document_number?: string;
    phone?: string;
    address?: string;
    city?: string;
    department?: string;
    country?: string;
    birth_date?: Date;
    last_login?: Date;
    notifications_enabled?: boolean;
}

export interface IUserRepository {
    save(userData: UserRegistrationData): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    update(id: number, userData: UserUpdateData): Promise<User>;
    findUserWithEntrepreneurships(id: number): Promise<User | null>;
}

// Puerto secundario para servicios de autenticación
export interface IAuthenticationService {
    hashPassword(password: string): Promise<string>;
    comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean>;
    generateToken(user: User): string;
    verifyToken(token: string): any;
} 