import { IAuthenticationService } from '../../../domain/ports/IUserRepository';
import { User } from '../../../domain/models/User';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class JWTAuthService implements IAuthenticationService {
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';
    private readonly JWT_EXPIRES_IN = '24h';
    private readonly SALT_ROUNDS = 10;

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    generateToken(user: User): string {
        const payload = {
            userId: user.id,
            email: user.email
        };

        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN
        });
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.JWT_SECRET);
        } catch (error) {
            throw new Error('Token inválido');
        }
    }
} 