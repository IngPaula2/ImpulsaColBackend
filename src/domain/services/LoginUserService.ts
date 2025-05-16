import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export class LoginUserService {
    constructor(private userRepository: UserRepository) {}

    async execute(email: string, password: string): Promise<string> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Credenciales inválidas');
        }

        // Crear token JWT
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return token;
    }
}
