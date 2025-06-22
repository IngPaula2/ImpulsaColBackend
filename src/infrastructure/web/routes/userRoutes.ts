import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { JWTAuthService } from '../../adapters/security/JWTAuthService';
import express from 'express';

export const createUserRoutes = (userController: UserController): Router => {
    const router = Router();
    const authService = new JWTAuthService();
    const jsonParser = express.json();

    // Rutas públicas
    router.post('/register', jsonParser, userController.register);
    router.post('/login', jsonParser, userController.login);
    router.post('/:id/roles', jsonParser, userController.assignRole);

    // Ruta protegida para obtener el perfil del usuario autenticado
    router.get('/me', authMiddleware(authService), userController.getProfile);
    // Ruta protegida para actualizar el perfil del usuario autenticado
    router.put('/me', authMiddleware(authService), jsonParser, userController.updateProfile);
    // Rutas para notificaciones
    router.get('/me/notifications', authMiddleware(authService), userController.getNotifications);
    router.put('/me/notifications', authMiddleware(authService), jsonParser, userController.updateNotifications);
    // Ruta para cambio de contraseña
    router.put('/me/password', authMiddleware(authService), jsonParser, userController.changePassword);

    return router;
}; 