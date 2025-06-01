import express from 'express';
import http from 'http';
import { AppDataSource } from '../config/database';
import { UserEntity } from '../entities/User';
import { UserAdapter } from '../adapter/UserAdapter';
import { UserApplicationService } from '../../application/UserApplicationService';
import { UserController } from '../controllers/UserController';
import { AuthService } from '../../application/AuthService';
import { AuthController } from '../controllers/AuthController';
import { createAuthRouter } from '../routes/authRoutes';
import { createUserRouter } from '../routes/userRoutes';
import { authMiddleware } from '../middlewares/authMiddleware';

export class ServerBootstrap {
    constructor(private readonly app: express.Application) {
        this.app.use(express.json());
    }

    async initializeDatabase(): Promise<void> {
        try {
            await AppDataSource.initialize();
            console.log('Database connection established');
        } catch (error) {
            console.error('Error connecting to database:', error);
            throw error;
        }
    }

    setupRoutes(): void {
        // Inicializar dependencias
        const userRepository = AppDataSource.getRepository(UserEntity);
        const userAdapter = new UserAdapter(userRepository);
        const userApplicationService = new UserApplicationService(userAdapter);
        const userController = new UserController(userApplicationService);
        
        // Servicios de autenticación
        const authService = new AuthService(userAdapter);
        const authController = new AuthController(authService);

        // Rutas públicas
        this.app.use('/api/auth', createAuthRouter(authController));
        this.app.use('/api/users', createUserRouter(userController, authService));

        // Ejemplo de ruta protegida
        this.app.get('/api/protected', authMiddleware(authService), (req, res) => {
            res.json({ message: 'Esta es una ruta protegida' });
        });
    }

    async init(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                // Primero inicializamos la base de datos
                this.initializeDatabase()
                    .then(() => {
                        // Configuramos las rutas
                        this.setupRoutes();

                        // Creamos y configuramos el servidor HTTP
                        const server = http.createServer(this.app);
                        const PORT = process.env.PORT || 3000;

                        server
                            .listen(PORT)
                            .on('listening', () => {
                                console.log(`Server is running on http://localhost:${PORT}`);
                                resolve(true);
                            })
                            .on('error', (err) => {
                                console.error('Error starting server:', err);
                                reject(false);
                            });
                    })
                    .catch((error) => {
                        console.error('Error during initialization:', error);
                        reject(false);
                    });
            } catch (error) {
                console.error('Error in init:', error);
                reject(false);
            }
        });
    }
} 