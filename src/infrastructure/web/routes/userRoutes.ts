import { Router } from 'express';
import { UserController } from '../controllers/UserController';

export const createUserRoutes = (userController: UserController): Router => {
    const router = Router();

    // Rutas públicas
    router.post('/register', userController.register);
    router.post('/login', userController.login);

    return router;
}; 