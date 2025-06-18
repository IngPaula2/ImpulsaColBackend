import { Request, Response, NextFunction } from 'express';
import { IAuthenticationService } from '../../domain/ports/IUserRepository';

// Tipo personalizado que extiende Request
interface RequestWithUser extends Request {
    user?: {
        userId: number;
        email: string;
    };
}

export const authMiddleware = (authService: IAuthenticationService) => {
    return async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            console.log('AuthMiddleware - Iniciando verificación de token');
            const authHeader = req.headers.authorization;
            console.log('AuthMiddleware - Auth header:', authHeader);

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                console.log('AuthMiddleware - No se proporcionó token o formato inválido');
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            const token = authHeader.split(' ')[1];
            console.log('AuthMiddleware - Token extraído:', token ? 'Token presente' : 'No hay token');

            const decoded = authService.verifyToken(token);
            console.log('AuthMiddleware - Token decodificado:', decoded);
            
            req.user = {
                userId: decoded.userId,
                email: decoded.email
            };
            
            console.log('AuthMiddleware - Usuario autenticado:', req.user);
            next();
        } catch (error) {
            console.error('AuthMiddleware - Error:', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    };
}; 