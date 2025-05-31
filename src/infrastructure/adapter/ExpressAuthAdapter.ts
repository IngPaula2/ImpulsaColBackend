import { Request } from 'express';
import { IAuthenticatedRequest, IAuthenticatedUser } from '../../domain/interfaces/IAuthenticatedRequest';

// Tipo personalizado que extiende Request
type RequestWithUser = Request & {
    user?: IAuthenticatedUser;
};

export class ExpressAuthAdapter {
    static toAuthenticatedRequest(req: RequestWithUser): IAuthenticatedRequest {
        return {
            user: req.user
        };
    }

    static setAuthenticatedUser(req: RequestWithUser, user: IAuthenticatedUser): void {
        req.user = {
            userId: user.userId,
            email: user.email
        };
    }

    static getAuthorizationToken(req: Request): string | null {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.split(' ')[1];
    }
} 