import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

interface JwtPayload {
    userId: string;
    role: string;
    email: string;
}

// Middleware para proteger rutas y validar token JWT
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Token missing' });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        (req as any).user = payload;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
}
