import { Request, Response } from 'express';
import { UserApplicationService } from '../../../application/services/UserService';
import { RegisterUserDTO, LoginUserDTO } from '../../../application/dto/UserDTO';

export class UserController {
    constructor(private readonly userService: UserApplicationService) {}

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.body.firstName || !req.body.lastName) {
                throw new Error('Se requiere nombre y apellido');
            }

            const registerData: RegisterUserDTO = {
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                metadata: req.body.metadata
            };

            const result = await this.userService.register(registerData);
            
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: result
            });
        } catch (error) {
            console.error('Error en registro:', error instanceof Error ? error.message : 'Error desconocido');
            
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error en el registro'
            });
        }
    };

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const loginData: LoginUserDTO = {
                email: req.body.email,
                password: req.body.password
            };

            const result = await this.userService.login(loginData);
            
            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: result
            });
        } catch (error) {
            console.error('Error en login:', error instanceof Error ? error.message : 'Error desconocido');
            
            res.status(401).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error en la autenticación'
            });
        }
    };
} 