import { UserDomainService } from '../../domain/services/UserDomainService';
import { RegisterUserDTO, UserDTO, AuthResponseDTO, LoginUserDTO, UserMetadataDTO } from '../dto/UserDTO';
import { IAuthenticationService } from '../../domain/ports/IUserRepository';
import { UserRegistrationData, UserMetadata } from '../../domain/models/User';
import { NotificationApplicationService } from './NotificationApplicationService';
import { EmailService } from '../../infrastructure/adapters/EmailService';
import { PasswordResetTokenEntity } from '../../infrastructure/persistence/entities/PasswordResetTokenEntity';
import { IPasswordResetTokenRepository } from '../../domain/ports/IPasswordResetTokenRepository';
import { User } from '../../domain/models/User';
import { UserValidators } from '../../domain/validators/UserValidators';

export class UserApplicationService {
    constructor(
        private readonly userDomainService: UserDomainService,
        private readonly authService: IAuthenticationService,
        private readonly passwordResetTokenRepo: IPasswordResetTokenRepository,
        private readonly emailService: EmailService,
        private readonly notificationService?: NotificationApplicationService
    ) {}

    async register(registerData: RegisterUserDTO): Promise<AuthResponseDTO> {
        try {
            // Validar email antes de procesar
            if (!UserValidators.isValidEmail(registerData.email)) {
                throw new Error('El formato del email es inválido. Debe tener un formato válido como usuario@dominio.com');
            }

            // Normalizar email a minúsculas
            const normalizedEmail = UserValidators.normalizeEmail(registerData.email);

            // Hashear la contraseña
            const hashedPassword = await this.authService.hashPassword(registerData.password);

            // Convertir DTO a modelo de dominio con email normalizado
            const domainData: UserRegistrationData = {
                ...registerData,
                email: normalizedEmail,
                password: hashedPassword,
                metadata: registerData.metadata ? this.mapToDomainMetadata(registerData.metadata) : undefined
            };

            // Registrar usuario usando el servicio de dominio
            const user = await this.userDomainService.registerUser(domainData);

            // Generar token
            const token = this.authService.generateToken(user);

            // Crear notificación de bienvenida automáticamente
            if (this.notificationService && user.id) {
                try {
                    await this.notificationService.createWelcomeNotification(user.id);
                    console.log('Notificación de bienvenida creada para usuario:', user.id);
                } catch (error) {
                    console.error('Error al crear notificación de bienvenida:', error);
                    // No lanzamos el error para no afectar el registro
                }
            }

            // Mapear respuesta
            return {
                token,
                user: this.mapToUserDTO(user)
            };
        } catch (error) {
            throw error;
        }
    }

    async login(loginData: LoginUserDTO): Promise<AuthResponseDTO> {
        try {
            // Normalizar email a minúsculas
            const normalizedEmail = UserValidators.normalizeEmail(loginData.email);
            
            const user = await this.userDomainService.validateCredentials(
                normalizedEmail,
                loginData.password
            );

            if (!user) {
                throw new Error('Credenciales inválidas');
            }

            // Actualizar last_login
            await this.userDomainService.updateUser(user.id!, { last_login: new Date() });

            const token = this.authService.generateToken(user);

            return {
                token,
                user: this.mapToUserDTO(user)
            };
        } catch (error) {
            throw error;
        }
    }

    private mapToUserDTO(user: any): UserDTO {
        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            profile_image: user.profile_image,
            metadata: user.metadata ? this.mapToMetadataDTO(user.metadata) : undefined
        };
    }

    private mapToDomainMetadata(dto: UserMetadataDTO): UserMetadata {
        return {
            ...dto,
            birth_date: dto.birth_date ? new Date(dto.birth_date) : undefined
        };
    }

    private mapToMetadataDTO(domain: UserMetadata): UserMetadataDTO {
        return {
            ...domain,
            birth_date: domain.birth_date?.toISOString()
        };
    }

    // Nuevo: obtener usuario por id
    async findById(id: number): Promise<UserDTO | null> {
        const user = await this.userDomainService.findById(id);
        return user ? this.mapToUserDTO(user) : null;
    }

    // Nuevo: actualizar usuario
    async update(userId: number, updateData: Partial<UserDTO>): Promise<UserDTO> {
        console.log('UserService.update - Iniciando actualización de usuario');
        console.log('UserService.update - userId:', userId);
        console.log('UserService.update - updateData:', updateData);
        
        // Mapear los datos para la entidad (no metadata como objeto)
        const entityUpdateData: any = { ...updateData };
        
        // Si hay metadata, mapear sus campos a propiedades individuales
        if (updateData.metadata) {
            console.log('UserService.update - Mapeando campos de metadata a propiedades individuales');
            delete entityUpdateData.metadata; // Eliminar el objeto metadata
            
            // Mapear campos individuales
            if (updateData.metadata.document_type) {
                entityUpdateData.document_type = updateData.metadata.document_type;
            }
            if (updateData.metadata.document_number) {
                entityUpdateData.document_number = updateData.metadata.document_number;
            }
            if (updateData.metadata.phone) {
                entityUpdateData.phone = updateData.metadata.phone;
            }
            if (updateData.metadata.address) {
                entityUpdateData.address = updateData.metadata.address;
            }
            if (updateData.metadata.city) {
                entityUpdateData.city = updateData.metadata.city;
            }
            if (updateData.metadata.department) {
                entityUpdateData.department = updateData.metadata.department;
            }
            if (updateData.metadata.country) {
                entityUpdateData.country = updateData.metadata.country;
            }
            if (updateData.metadata.birth_date) {
                entityUpdateData.birth_date = new Date(updateData.metadata.birth_date);
            }
        }
        
        console.log('UserService.update - Datos mapeados para entidad:', entityUpdateData);
        console.log('UserService.update - Llamando al dominio');
        
        const updatedUser = await this.userDomainService.updateUser(userId, entityUpdateData);
        
        console.log('UserService.update - Usuario actualizado en dominio, mapeando respuesta');
        return this.mapToUserDTO(updatedUser);
    }

    // Métodos públicos para contraseñas
    async comparePasswords(plain: string, hash: string): Promise<boolean> {
        return this.authService.comparePasswords(plain, hash);
    }
    async hashPassword(password: string): Promise<string> {
        return this.authService.hashPassword(password);
    }

    // Obtener perfil público de un usuario con sus emprendimientos
    async findPublicProfileById(userId: number) {
        const user = await this.userDomainService.findUserWithEntrepreneurships(userId);
        if (!user) return null;
        return {
            id: user.id,
            full_name: user.full_name,
            profile_image: user.profile_image,
            entrepreneurships: (user.entrepreneurships || []).map((e: any) => ({
                id: e.id,
                title: e.title,
                location: e.category, // o el campo correcto
                cover_image: e.cover_image
            })),
            investmentIdeas: (user.investmentIdeas || []).map((idea: any) => ({
                id: idea.id,
                title: idea.title,
                description: idea.description,
                category: idea.category,
                target_amount: idea.target_amount,
                investors_needed: idea.investors_needed,
                images: idea.images,
                is_active: idea.is_active,
                created_at: idea.created_at
            }))
        };
    }

    async requestPasswordReset(email: string): Promise<void> {
        // Buscar usuario
        const user = await this.userDomainService.findByEmail(email);
        if (!user) throw new Error('No existe un usuario con ese correo');
        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        // Guardar token
        const tokenEntity = new PasswordResetTokenEntity();
        tokenEntity.user_id = user.id!;
        tokenEntity.token = code;
        tokenEntity.expires_at = expiresAt;
        tokenEntity.used = false;
        await this.passwordResetTokenRepo.create(tokenEntity);
        // Enviar email
        await this.emailService.sendPasswordResetEmail(email, code);
    }

    async verifyPasswordResetCode(email: string, code: string): Promise<boolean> {
        const user = await this.userDomainService.findByEmail(email);
        if (!user) throw new Error('No existe un usuario con ese correo');
        const token = await this.passwordResetTokenRepo.findValidByUserId(user.id!);
        if (!token || token.token !== code || token.used || token.expires_at < new Date()) {
            return false;
        }
        return true;
    }

    async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
        const user = await this.userDomainService.findByEmail(email);
        if (!user) throw new Error('No existe un usuario con ese correo');
        const token = await this.passwordResetTokenRepo.findValidByUserId(user.id!);
        if (!token || token.token !== code || token.used || token.expires_at < new Date()) {
            throw new Error('Código inválido o expirado');
        }
        // Cambiar contraseña
        const password_hash = await this.authService.hashPassword(newPassword);
        await this.userDomainService.updateUser(user.id!, { password_hash });
        await this.passwordResetTokenRepo.markAsUsed(token.token);
    }
} 