import { UserDomainService } from '../../domain/services/UserDomainService';
import { RegisterUserDTO, UserDTO, AuthResponseDTO, LoginUserDTO, UserMetadataDTO } from '../dto/UserDTO';
import { IAuthenticationService } from '../../domain/ports/IUserRepository';
import { UserRegistrationData, UserMetadata } from '../../domain/models/User';

export class UserApplicationService {
    constructor(
        private readonly userDomainService: UserDomainService,
        private readonly authService: IAuthenticationService
    ) {}

    async register(registerData: RegisterUserDTO): Promise<AuthResponseDTO> {
        try {
            // Hashear la contraseña
            const hashedPassword = await this.authService.hashPassword(registerData.password);

            // Convertir DTO a modelo de dominio
            const domainData: UserRegistrationData = {
                ...registerData,
                password: hashedPassword,
                metadata: registerData.metadata ? this.mapToDomainMetadata(registerData.metadata) : undefined
            };

            // Registrar usuario usando el servicio de dominio
            const user = await this.userDomainService.registerUser(domainData);

            // Generar token
            const token = this.authService.generateToken(user);

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
            const user = await this.userDomainService.validateCredentials(
                loginData.email,
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
            }))
        };
    }
} 