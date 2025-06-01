import { UserPort } from '../../domain/UserPort';
import { User } from '../../domain/User';
import { UserEntity } from '../entities/User';
import { Repository } from 'typeorm';

export class UserAdapter implements UserPort {
    constructor(private readonly userRepository: Repository<UserEntity>) {}

    async register(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
        const userEntity = this.userRepository.create(userData);
        const savedUser = await this.userRepository.save(userEntity);
        return this.mapToUser(savedUser);
    }

    async findByEmail(email: string): Promise<User | null> {
        const userEntity = await this.userRepository.findOne({ where: { email } });
        return userEntity ? this.mapToUser(userEntity) : null;
    }

    async findById(id: number): Promise<User | null> {
        const userEntity = await this.userRepository.findOne({ where: { id } });
        return userEntity ? this.mapToUser(userEntity) : null;
    }

    async update(id: number, userData: Partial<User>): Promise<User> {
        await this.userRepository.update(id, userData);
        const updatedUser = await this.userRepository.findOne({ where: { id } });
        if (!updatedUser) {
            throw new Error('User not found after update');
        }
        return this.mapToUser(updatedUser);
    }

    private mapToUser(entity: UserEntity): User {
        const user: User = {};
        
        if (entity.id !== undefined) user.id = entity.id;
        if (entity.full_name !== undefined) user.full_name = entity.full_name;
        if (entity.email !== undefined) user.email = entity.email;
        if (entity.password_hash !== undefined) user.password_hash = entity.password_hash;
        if (entity.document_type !== undefined) user.document_type = entity.document_type;
        if (entity.document_number !== undefined) user.document_number = entity.document_number;
        if (entity.phone !== undefined) user.phone = entity.phone;
        if (entity.address !== undefined) user.address = entity.address;
        if (entity.city !== undefined) user.city = entity.city;
        if (entity.department !== undefined) user.department = entity.department;
        if (entity.country !== undefined) user.country = entity.country;
        if (entity.birth_date !== undefined) user.birth_date = entity.birth_date;
        if (entity.created_at !== undefined) user.created_at = entity.created_at;

        return user;
    }
} 