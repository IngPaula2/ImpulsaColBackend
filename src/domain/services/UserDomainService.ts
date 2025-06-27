import { User, UserRegistrationData } from '../models/User';
import { IUserRepository, IAuthenticationService, UserUpdateData } from '../ports/IUserRepository';
import { UserValidators } from '../validators/UserValidators';

export class UserDomainService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly authService: IAuthenticationService
    ) {}

    async registerUser(userData: UserRegistrationData): Promise<User> {
        // Validaciones de dominio
        this.validateUserRegistrationData(userData);

        // Normalizar email a minúsculas
        const normalizedEmail = UserValidators.normalizeEmail(userData.email);

        // Normalizar nombre y apellido si existen
        let normalizedFirstName = userData.firstName;
        let normalizedLastName = userData.lastName;
        if (userData.firstName) {
            normalizedFirstName = UserValidators.normalizeNamePart(userData.firstName);
        }
        if (userData.lastName) {
            normalizedLastName = UserValidators.normalizeNamePart(userData.lastName);
        }

        // Verificar si el usuario ya existe (usando email normalizado)
        const existingUser = await this.userRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }

        // Crear el usuario con email y nombres normalizados
        const userDataWithNormalizedFields = {
            ...userData,
            email: normalizedEmail,
            firstName: normalizedFirstName,
            lastName: normalizedLastName
        };

        const user = await this.userRepository.save(userDataWithNormalizedFields);
        return user;
    }

    async validateCredentials(email: string, password: string): Promise<User | null> {
        // Normalizar email a minúsculas para la búsqueda
        const normalizedEmail = UserValidators.normalizeEmail(email);
        
        const user = await this.userRepository.findByEmail(normalizedEmail);

        if (!user) {
            return null;
        }

        const isValidPassword = await this.authService.comparePasswords(password, user.password_hash!);
        
        if (!isValidPassword) {
            return null;
        }

        return user;
    }

    private validateUserRegistrationData(data: UserRegistrationData): void {
        // Validar email con validaciones robustas
        if (!data.email) {
            throw new Error('El email es requerido');
        }
        if (!UserValidators.isValidEmail(data.email)) {
            throw new Error('El formato del email es inválido. Debe tener un formato válido como usuario@dominio.com');
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
        if (!UserValidators.isValidNamePart(data.firstName)) {
            throw new Error('El nombre solo debe contener letras, guiones o apóstrofes y tener al menos 2 caracteres');
        }
        if (!UserValidators.isValidNamePart(data.lastName)) {
            throw new Error('El apellido solo debe contener letras, guiones o apóstrofes y tener al menos 2 caracteres');
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

    // Nuevo: obtener usuario por id
    async findById(id: number): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    // Nuevo: obtener usuario por email
    async findByEmail(email: string): Promise<User | null> {
        // Normalizar email a minúsculas para la búsqueda
        const normalizedEmail = UserValidators.normalizeEmail(email);
        return this.userRepository.findByEmail(normalizedEmail);
    }

    // Nuevo: actualizar usuario por id
    async updateUser(userId: number, updateData: UserUpdateData): Promise<User> {
        // Si se está actualizando el email, normalizarlo
        if (updateData.email) {
            if (!UserValidators.isValidEmail(updateData.email)) {
                throw new Error('El formato del email es inválido');
            }
            updateData.email = UserValidators.normalizeEmail(updateData.email);
        }

        // Si se está actualizando el nombre o apellido, normalizarlos y validarlos
        if (updateData.firstName) {
            if (!UserValidators.isValidNamePart(updateData.firstName)) {
                throw new Error('El nombre solo debe contener letras, guiones o apóstrofes y tener al menos 2 caracteres');
            }
            updateData.firstName = UserValidators.normalizeNamePart(updateData.firstName);
        }
        if (updateData.lastName) {
            if (!UserValidators.isValidNamePart(updateData.lastName)) {
                throw new Error('El apellido solo debe contener letras, guiones o apóstrofes y tener al menos 2 caracteres');
            }
            updateData.lastName = UserValidators.normalizeNamePart(updateData.lastName);
        }

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

    // Buscar usuarios por nombre, apellido o email (búsqueda parcial)
    async searchUsers(query: string): Promise<User[]> {
        return this.userRepository.searchUsers(query);
    }
} 