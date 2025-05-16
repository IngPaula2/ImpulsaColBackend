// src/domain/services/RegisterUserService.ts
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';

export class RegisterUserService {
    constructor(private userRepository: UserRepository) {}

    async execute(user: User): Promise<User> {
        const existing = await this.userRepository.findByEmail(user.email);
        if (existing) {
            throw new Error('El correo ya está registrado');
        }

        // Hashear la contraseña con bcrypt antes de crear el usuario
        const hashedPassword = await bcrypt.hash(user.password, 10);

        user.password = hashedPassword;

        return await this.userRepository.create(user);
    }
}

