import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthService } from '../../application/AuthService';
import { authMiddleware } from '../middlewares/authMiddleware';

export const createUserRouter = (userController: UserController, authService: AuthService): Router => {
    const router = Router();

    router.post('/register', userController.register);
    
    // Rutas protegidas que requieren autenticación
    router.get('/profile', authMiddleware(authService), userController.getProfile);
    router.put('/profile', authMiddleware(authService), userController.updateProfile);

    return router;
}; 