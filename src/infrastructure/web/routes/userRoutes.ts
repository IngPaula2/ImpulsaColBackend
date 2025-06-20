import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { JWTAuthService } from '../../adapters/security/JWTAuthService';
import express from 'express';

export const createUserRoutes = (userController: UserController): Router => {
    const router = Router();
    const authService = new JWTAuthService();

    // Rutas públicas
    router.post('/register', express.json(), userController.register);
    router.post('/login', express.json(), userController.login);
    router.post('/:id/roles', userController.assignRole);

    // Ruta protegida para obtener el perfil del usuario autenticado
    router.get('/me', authMiddleware(authService), userController.getProfile);
    // Ruta protegida para actualizar el perfil del usuario autenticado
    router.put('/me', authMiddleware(authService), userController.updateProfile);
    // Rutas para notificaciones
    router.get('/me/notifications', authMiddleware(authService), userController.getNotifications);
    router.put('/me/notifications', authMiddleware(authService), userController.updateNotifications);
    // Ruta para cambio de contraseña
    router.put('/me/password', authMiddleware(authService), userController.changePassword);

    return router;
}; 