import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/AuthService';
import { ExpressAuthAdapter } from '../adapter/ExpressAuthAdapter';
import { IAuthenticatedUser } from '../../domain/interfaces/IAuthenticatedRequest';

// Tipo personalizado que extiende Request
type RequestWithUser = Request & {
    user?: IAuthenticatedUser;
};

export const authMiddleware = (authService: AuthService) => {
    return async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const token = ExpressAuthAdapter.getAuthorizationToken(req);
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            const decoded = authService.verifyToken(token);
            ExpressAuthAdapter.setAuthenticatedUser(req, {
                userId: decoded.userId,
                email: decoded.email
            });
            
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    };
}; 