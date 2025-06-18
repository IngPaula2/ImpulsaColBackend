import { Repository } from 'typeorm';
import { IUserRepository, UserUpdateData } from '../../../domain/ports/IUserRepository';
import { User, UserRegistrationData } from '../../../domain/models/User';
import { UserEntity } from '../entities/UserEntity';

export class TypeORMUserRepository implements IUserRepository {
    constructor(private readonly repository: Repository<UserEntity>) {}

    async save(userData: UserRegistrationData): Promise<User> {
        const userEntity = this.repository.create({
            email: userData.email,
            password_hash: userData.password,
            full_name: `${userData.firstName} ${userData.lastName}`,
            document_type: userData.metadata?.document_type,
            document_number: userData.metadata?.document_number,
            phone: userData.metadata?.phone,
            address: userData.metadata?.address,
            city: userData.metadata?.city,
            department: userData.metadata?.department,
            country: userData.metadata?.country,
            birth_date: userData.metadata?.birth_date ? new Date(userData.metadata.birth_date) : undefined,
            notifications_enabled: userData.metadata?.notifications_enabled ?? false,
            last_login: userData.metadata?.last_login ? new Date(userData.metadata.last_login) : undefined
        });

        const savedUser = await this.repository.save(userEntity);
        return this.mapToUser(savedUser);
    }

    async findByEmail(email: string): Promise<User | null> {
        const userEntity = await this.repository.findOne({ where: { email } });
        return userEntity ? this.mapToUser(userEntity) : null;
    }

    async findById(id: number): Promise<User | null> {
        const userEntity = await this.repository.findOne({ where: { id } });
        return userEntity ? this.mapToUser(userEntity) : null;
    }

    async update(id: number, userData: UserUpdateData): Promise<User> {
        await this.repository.update(id, userData);
        const updatedUser = await this.repository.findOne({ where: { id } });
        if (!updatedUser) {
            throw new Error('Usuario no encontrado después de la actualización');
        }
        return this.mapToUser(updatedUser);
    }

    private mapToUser(entity: UserEntity): User {
        const metadata = {
            document_type: entity.document_type,
            document_number: entity.document_number,
            phone: entity.phone,
            address: entity.address,
            city: entity.city,
            department: entity.department,
            country: entity.country,
            birth_date: entity.birth_date
        };

        return {
            id: entity.id,
            email: entity.email,
            password_hash: entity.password_hash,
            full_name: entity.full_name,
            metadata,
            created_at: entity.created_at,
            notifications_enabled: entity.notifications_enabled,
            last_login: entity.last_login
        };
    }
} 