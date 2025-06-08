import express from 'express';
import http from 'http';
import cors from 'cors';
import { AppDataSource } from '../config/database';
import { UserEntity } from '../persistence/entities/UserEntity';
import { TypeORMUserRepository } from '../persistence/repositories/TypeORMUserRepository';
import { UserApplicationService } from '../../application/services/UserService';
import { UserController } from '../web/controllers/UserController';
import { JWTAuthService } from '../adapters/security/JWTAuthService';
import { createUserRoutes } from '../web/routes/userRoutes';
import { authMiddleware } from '../middlewares/authMiddleware';
import { UserDomainService } from '../../domain/services/UserDomainService';

export class ServerBootstrap {
    constructor(private readonly app: express.Application) {
        this.app.use(express.json());
        this.app.use(cors({
            origin: [
                'http://localhost:19000',  // Expo en desarrollo
                'http://localhost:19006',  // Expo en web
                'http://localhost:8081',   // Metro bundler
                'http://192.168.20.48:8081', // IP local
                'exp://192.168.20.48:8081'  // Expo en dispositivo
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
            optionsSuccessStatus: 200
        }));

        // Middleware para logging de peticiones
        this.app.use((req, res, next) => {
            console.log(`${req.method} ${req.path} - Origin: ${req.get('origin')}`);
            next();
        });
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
        // Inicializar adaptadores
        const userRepository = AppDataSource.getRepository(UserEntity);
        const userRepositoryAdapter = new TypeORMUserRepository(userRepository);
        const authService = new JWTAuthService();
        
        // Inicializar servicio de dominio
        const userDomainService = new UserDomainService(
            userRepositoryAdapter,
            authService
        );

        // Inicializar servicio de aplicación
        const userApplicationService = new UserApplicationService(
            userDomainService,
            authService
        );

        // Inicializar controladores
        const userController = new UserController(userApplicationService);

        // Configurar rutas
        this.app.use('/api/auth', createUserRoutes(userController));

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