import { User, UserRegistrationData } from '../models/User';
import { IUserRepository, IAuthenticationService, UserUpdateData } from '../ports/IUserRepository';

export class UserDomainService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly authService: IAuthenticationService
    ) {}

    async registerUser(userData: UserRegistrationData): Promise<User> {
        // Validaciones de dominio
        this.validateUserRegistrationData(userData);

        // Verificar si el usuario ya existe
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }

        // Crear el usuario
        const user = await this.userRepository.save(userData);
        return user;
    }

    async validateCredentials(email: string, password_hash: string): Promise<User | null> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            return null;
        }

        const isValidPassword = await this.authService.comparePasswords(password_hash, user.password_hash!);
        
        if (!isValidPassword) {
            return null;
        }

        return user;
    }

    private validateUserRegistrationData(data: UserRegistrationData): void {
        // Validar email
        if (!data.email) {
            throw new Error('El email es requerido');
        }
        if (!this.isValidEmail(data.email)) {
            throw new Error('El formato del email es inválido');
        }

        // Validar contraseña
        if (!data.password) {
            throw new Error('La contraseña es requerida');
        }
        if (data.password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Validar nombre y apellido
        if (!data.firstName || !data.lastName) {
            throw new Error('Nombre y apellido son requeridos');
        }

        // Validar metadatos si existen
        if (data.metadata) {
            if (data.metadata.document_type && !['CC', 'CE', 'TI', 'PP'].includes(data.metadata.document_type)) {
                throw new Error('Tipo de documento inválido');
            }

            if (data.metadata.document_number && !/^\d{6,12}$/.test(data.metadata.document_number)) {
                throw new Error('Número de documento inválido');
            }

            if (data.metadata.phone) {
                // Eliminar espacios y guiones del número de teléfono
                const cleanPhone = data.metadata.phone.replace(/[\s-]/g, '');
                // Validar que sea un número de teléfono colombiano válido
                if (!/^3\d{8,9}$/.test(cleanPhone)) {
                    throw new Error('El número de teléfono debe comenzar con 3 y tener 10 dígitos');
                }
                // Actualizar el número de teléfono al formato limpio
                data.metadata.phone = cleanPhone;
            }
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Nuevo: obtener usuario por id
    async findById(id: number): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    // Nuevo: obtener usuario por email
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    // Nuevo: actualizar usuario por id
    async updateUser(userId: number, updateData: UserUpdateData): Promise<User> {
        if (updateData.phone) {
            const cleanPhone = this.validateAndCleanPhoneNumber(updateData.phone);
            updateData.phone = cleanPhone;
        }

        return this.userRepository.update(userId, updateData);
    }

    private validateAndCleanPhoneNumber(phone: string): string {
        // Eliminar espacios y guiones del número de teléfono
        const cleanPhone = phone.replace(/[\s-]/g, '');
        // Validar que sea un número de teléfono colombiano válido
        if (!/^3\d{9}$/.test(cleanPhone)) {
            throw new Error('El número de teléfono debe comenzar con 3 y tener 10 dígitos');
        }
        return cleanPhone;
    }

    // Obtener usuario con sus emprendimientos
    async findUserWithEntrepreneurships(id: number): Promise<User | null> {
        return this.userRepository.findUserWithEntrepreneurships(id);
    }
} 