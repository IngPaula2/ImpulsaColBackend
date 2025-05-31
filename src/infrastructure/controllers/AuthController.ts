import { Request, Response } from 'express';
import { AuthService } from '../../application/AuthService';
import { UserValidators } from '../../domain/validators/UserValidators';

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            // Validar email
            if (!email || !UserValidators.isValidEmail(email)) {
                res.status(400).json({
                    success: false,
                    message: 'Email inválido'
                });
                return;
            }

            // Validar que se proporcionó una contraseña
            if (!password) {
                res.status(400).json({
                    success: false,
                    message: 'La contraseña es requerida'
                });
                return;
            }

            // Intentar hacer login
            const result = await this.authService.login(email, password);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error en la autenticación'
            });
        }
    };
}
