// src/domain/services/RegisterUserService.ts
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';

export class RegisterUserService {
    constructor(private userRepository: UserRepository) {}

    async execute(user: User): Promise<User> {
    const existing = await this.userRepository.findByEmail(user.email);
    if (existing) {
        throw new Error('El correo ya está registrado');
    }

    // Aquí se podría hashear la contraseña, por ejemplo
    return await this.userRepository.create(user);
    }
}
