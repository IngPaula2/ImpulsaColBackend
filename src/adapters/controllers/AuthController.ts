import { Request, Response } from 'express';
import { RegisterUserService } from '../../domain/services/RegisterUserService';
import { UserRepositoryPostgres } from '../../infrastructure/repositories/UserRepositoryPostgres';
import { LoginUserService } from '../../domain/services/LoginUserService';

const userRepository = new UserRepositoryPostgres();
const registerUserService = new RegisterUserService(userRepository);
const loginUserService = new LoginUserService(userRepository);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password, role, status } = req.body;

            if (!name || name.length < 3) {
                res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres.' });
                return;
            }
            if (!email || !emailRegex.test(email)) {
                res.status(400).json({ error: 'Correo electrónico no válido.' });
                return;
            }
            if (!password || password.length < 6) {
                res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
                return;
            }

            const user = await registerUserService.execute({
                name,
                email,
                password,
                role,
                status,
            });

            res.status(201).json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
    
            if (!email || !emailRegex.test(email)) {
                res.status(400).json({ error: 'Correo electrónico no válido.' });
                return;
            }
            if (!password || password.length < 6) {
                res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
                return;
            }
    
            const token = await loginUserService.execute(email, password);
            res.json({ token });
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }
    
}
