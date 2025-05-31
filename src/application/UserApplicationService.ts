import { User } from '../domain/User';
import { UserPort } from '../domain/UserPort';
import { UserValidators } from '../domain/validators/UserValidators';
import * as bcrypt from 'bcrypt';

export class UserApplicationService {
    constructor(private readonly userPort: UserPort) {}

    async register(userData: { 
        email: string;  
        password: string; 
        full_name?: string;
        document_type?: string;
        document_number?: string;
        phone?: string;
        address?: string;
        city?: string;
        department?: string;
        country?: string;
        birth_date?: Date;
    }): Promise<User> {
        // Validar todos los campos
        const validation = UserValidators.validateUserData(userData);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        // Verificar si el usuario ya existe
        const existingUser = await this.userPort.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User already exists with this email');
        }

        // Hash de la contraseña
        const password_hash = await bcrypt.hash(userData.password, 10);

        // Crear el usuario
        const { password, ...userDataWithoutPassword } = userData;
        const user = await this.userPort.register({
            ...userDataWithoutPassword,
            password_hash
        });

        return user;
    }
} 