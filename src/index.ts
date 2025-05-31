import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { AppDataSource } from './infrastructure/config/database';
import { UserEntity } from './infrastructure/entities/User';
import { UserAdapter } from './infrastructure/adapter/UserAdapter';
import { UserApplicationService } from './application/UserApplicationService';
import { UserController } from './infrastructure/controllers/UserController';
import { createUserRouter } from './infrastructure/routes/userRoutes';

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

        // Configurar rutas
        app.use('/api/users', createUserRouter(userController));

        // Iniciar servidor
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
    });
