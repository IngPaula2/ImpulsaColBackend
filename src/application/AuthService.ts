import { UserPort } from '../domain/UserPort';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class AuthService {
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';
    private readonly JWT_EXPIRES_IN = '24h';

    constructor(private readonly userPort: UserPort) {}

    async login(email: string, password: string): Promise<{ token: string; user: any }> {
        // Buscar usuario por email
        const user = await this.userPort.findByEmail(email);
        if (!user) {
            throw new Error('Email o contraseña incorrectos');
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');
        if (!isPasswordValid) {
            throw new Error('Email o contraseña incorrectos');
        }

        // Generar token JWT
        const token = this.generateToken(user);

        // Retornar token y datos del usuario (sin información sensible)
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name
            }
        };
    }

    private generateToken(user: any): string {
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