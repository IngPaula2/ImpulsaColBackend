import { Router } from 'express';
import { UserController } from '../controllers/UserController';

export const createUserRouter = (userController: UserController): Router => {
    const router = Router();

    router.post('/register', userController.register);

    return router;
}; 