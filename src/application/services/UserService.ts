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
} 