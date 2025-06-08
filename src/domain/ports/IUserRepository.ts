import { User, UserRegistrationData } from '../models/User';

export interface IUserRepository {
    save(userData: UserRegistrationData): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    update(id: number, userData: Partial<User>): Promise<User>;
}

// Puerto secundario para servicios de autenticación
export interface IAuthenticationService {
    hashPassword(password: string): Promise<string>;
    comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean>;
    generateToken(user: User): string;
    verifyToken(token: string): any;
} 