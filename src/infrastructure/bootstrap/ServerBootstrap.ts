import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { AppDataSource } from '../config/database';
import { UserEntity } from '../persistence/entities/UserEntity';
import { TypeORMUserRepository } from '../persistence/repositories/TypeORMUserRepository';
import { UserApplicationService } from '../../application/services/UserService';
import { UserController } from '../web/controllers/UserController';
import { JWTAuthService } from '../adapters/security/JWTAuthService';
import { createUserRoutes } from '../web/routes/userRoutes';
import { authMiddleware } from '../middlewares/authMiddleware';
import { UserDomainService } from '../../domain/services/UserDomainService';
import { TypeORMUserRoleRepository } from '../persistence/repositories/TypeORMUserRoleRepository';
import { UserRoleService } from '../../application/services/UserRoleService';
import investmentIdeaRoutes from '../web/routes/investmentIdeaRoutes';
import { IUserRepository, IAuthenticationService } from '../../domain/ports/IUserRepository';
import { TypeORMProductRepository } from '../persistence/repositories/TypeORMProductRepository';
import { ProductService } from '../../application/services/ProductService';
import { ProductController } from '../web/controllers/ProductController';
import { EntrepreneurshipService } from '../../application/services/EntrepreneurshipService';
import { EntrepreneurshipController } from '../web/controllers/EntrepreneurshipController';
import { TypeORMEntrepreneurshipRepository } from '../persistence/repositories/TypeORMEntrepreneurshipRepository';
import { IProductRepository } from '../../domain/ports/IProductRepository';
import { IEntrepreneurshipRepository } from '../../domain/ports/IEntrepreneurshipRepository';
import { productRoutes } from '../web/routes/productRoutes';
import { entrepreneurshipRoutes } from '../web/routes/entrepreneurshipRoutes';

export class ServerBootstrap {
    constructor(private readonly app: express.Application) {
        // Middleware para logging de peticiones (debe ir primero)
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')} - Body:`, req.body);
            next();
        });

        // Servir archivos estáticos desde la carpeta 'uploads'
        this.app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));

        this.app.use(cors({
            origin: [
                'http://localhost:19000',  // Expo en desarrollo
                'http://localhost:19006',  // Expo en web
                'http://localhost:8081',   // Metro bundler
                'http://192.168.20.48:8081', // IP local
                'exp://192.168.20.48:8081'  // Expo en dispositivo
            ],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
            optionsSuccessStatus: 200
        }));
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
        const userRepositoryAdapter: IUserRepository = new TypeORMUserRepository(userRepository);
        const authService: IAuthenticationService = new JWTAuthService();
        
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

        // Inicializar adaptador y servicio de roles
        const userRoleRepository = new TypeORMUserRoleRepository(AppDataSource);
        const userRoleService = new UserRoleService(userRoleRepository);

        // Inicializar controladores
        const userController = new UserController(userApplicationService, userRoleService);

        const productRepository: IProductRepository = new TypeORMProductRepository(AppDataSource);
        const productService = new ProductService(productRepository);
        const productController = new ProductController(productService);

        const entrepreneurshipRepository: IEntrepreneurshipRepository = new TypeORMEntrepreneurshipRepository(AppDataSource);
        const entrepreneurshipService = new EntrepreneurshipService(entrepreneurshipRepository, productRepository);
        const entrepreneurshipController = new EntrepreneurshipController(entrepreneurshipService);

        // Configurar rutas
        this.app.use('/api/users', createUserRoutes(userController));
        
        // Rutas de emprendimientos - GET / no requiere autenticación
        this.app.get('/api/entrepreneurships', (req, res) => {
            entrepreneurshipController.findAll(req, res);
        });
        this.app.use('/api/entrepreneurships', authMiddleware(authService), entrepreneurshipRoutes(entrepreneurshipController));
        
        // Rutas de productos - GET / no requiere autenticación
        this.app.get('/api/products', (req, res) => {
            productController.findAll(req, res);
        });
        this.app.use('/api/products', authMiddleware(authService), productRoutes(productController));
        this.app.use('/api/investment-ideas', authMiddleware(authService), investmentIdeaRoutes);

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