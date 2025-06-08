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
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            const token = authHeader.split(' ')[1];
            const decoded = authService.verifyToken(token);
            
            req.user = {
                userId: decoded.userId,
                email: decoded.email
            };
            
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    };
}; 