import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { AppDataSource } from './infrastructure/config/database';
import { UserEntity } from './infrastructure/entities/User';
import { UserAdapter } from './infrastructure/adapter/UserAdapter';
import { UserApplicationService } from './application/UserApplicationService';
import { UserController } from './infrastructure/controllers/UserController';
import { createUserRouter } from './infrastructure/routes/userRoutes';
import { AuthService } from './application/AuthService';
import { AuthController } from './infrastructure/controllers/AuthController';
import { createAuthRouter } from './infrastructure/routes/authRoutes';
import { authMiddleware } from './infrastructure/middlewares/authMiddleware';

const app = express();
app.use(express.json());

// Inicializar la base de datos
AppDataSource.initialize()
    .then(() => {
        console.log('Database connection established');

        // Inicializar dependencias
        const userRepository = AppDataSource.getRepository(UserEntity);
        const userAdapter = new UserAdapter(userRepository);
        const userApplicationService = new UserApplicationService(userAdapter);
        const userController = new UserController(userApplicationService);
        
        // Servicios de autenticación
        const authService = new AuthService(userAdapter);
        const authController = new AuthController(authService);

        // Rutas públicas
        app.use('/api/auth', createAuthRouter(authController));
        app.use('/api/users', createUserRouter(userController));

        // Ejemplo de ruta protegida
        app.get('/api/protected', authMiddleware(authService), (req, res) => {
            res.json({ message: 'Esta es una ruta protegida' });
        });

        // Iniciar servidor
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
    });
