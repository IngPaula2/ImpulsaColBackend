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
import { InvestmentIdeaController } from '../web/controllers/InvestmentIdeaController';
import { InvestmentIdeaService } from '../../application/services/InvestmentIdeaService';
import { TypeORMInvestmentIdeaRepository } from '../persistence/repositories/TypeORMInvestmentIdeaRepository';
import categoryRoutes from '../web/routes/categoryRoutes';
import departmentRoutes from '../web/routes/departmentRoutes';

// Chat imports
import { TypeORMChatRepository } from '../persistence/repositories/TypeORMChatRepository';
import { ChatDomainService } from '../../domain/services/ChatDomainService';
import { ChatApplicationService } from '../../application/services/ChatApplicationService';
import { ChatController } from '../web/controllers/ChatController';
import { createChatRoutes } from '../web/routes/chatRoutes';
import { IChatRepository } from '../../domain/ports/IChatRepository';

// Favorite imports
import { TypeORMFavoriteRepository } from '../persistence/repositories/TypeORMFavoriteRepository';
import { FavoriteApplicationService } from '../../application/services/FavoriteApplicationService';
import { FavoriteController } from '../web/controllers/FavoriteController';
import { createFavoriteRoutes } from '../web/routes/favoriteRoutes';
import { IFavoriteRepository } from '../../domain/ports/IFavoriteRepository';

// Notification imports
import { TypeORMNotificationRepository } from '../persistence/repositories/TypeORMNotificationRepository';
import { NotificationDomainService } from '../../domain/services/NotificationDomainService';
import { NotificationApplicationService } from '../../application/services/NotificationApplicationService';
import { NotificationController } from '../web/controllers/NotificationController';
import { createNotificationRoutes } from '../web/routes/notificationRoutes';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';

// Password reset imports
import { TypeORMPasswordResetTokenRepository } from '../persistence/repositories/TypeORMPasswordResetTokenRepository';
import { EmailService } from '../adapters/EmailService';

export class ServerBootstrap {
    constructor(private readonly app: express.Application) {
        // Middleware para logging de peticiones (debe ir primero)
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')} - Body:`, req.body);
            next();
        });

        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

        // Servir archivos estáticos desde la carpeta 'uploads'
        this.app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));

        // Configuración simplificada de CORS para producción
        this.app.use(cors({
            origin: [
                'http://localhost:19000',  // Expo en desarrollo
                'http://localhost:19006',  // Expo en web
                'http://localhost:8081',   // Metro bundler
                'http://localhost:3000',   // Frontend web local
                'http://192.168.20.36:8081', // IP local específica
                'exp://192.168.20.36:8081',  // Expo en dispositivo
                'https://impulsacol.twentybyte.com', // Dominio de producción
                'https://*.twentybyte.com', // Subdominio de twentybyte
                // Permitir IPs locales dinámicas para desarrollo
                process.env.LOCAL_IP ? `http://${process.env.LOCAL_IP}:8081` : null,
                process.env.LOCAL_IP ? `exp://${process.env.LOCAL_IP}:8081` : null,
            ].filter(Boolean), // Filtrar valores null/undefined
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
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

        // Inicializar servicios de notificaciones primero
        const notificationRepository: INotificationRepository = new TypeORMNotificationRepository(AppDataSource);
        const notificationDomainService = new NotificationDomainService(notificationRepository);
        const notificationApplicationService = new NotificationApplicationService(notificationDomainService);
        const notificationController = new NotificationController(notificationApplicationService);

        // Inicializar servicios para recuperación de contraseña
        const passwordResetTokenRepo = new TypeORMPasswordResetTokenRepository(AppDataSource);
        const emailService = new EmailService();

        // Inicializar servicio de aplicación (con notificaciones y recuperación de contraseña)
        const userApplicationService = new UserApplicationService(
            userDomainService,
            authService,
            passwordResetTokenRepo,
            emailService,
            notificationApplicationService
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

        // Inicializar servicios de chat (con notificaciones)
        const chatRepository: IChatRepository = new TypeORMChatRepository(AppDataSource);
        const chatDomainService = new ChatDomainService(chatRepository);
        const chatApplicationService = new ChatApplicationService(chatDomainService, notificationApplicationService);
        const chatController = new ChatController(chatApplicationService);

        // Inicializar servicios de favoritos (con notificaciones)
        const favoriteRepository: IFavoriteRepository = new TypeORMFavoriteRepository(AppDataSource);
        const favoriteApplicationService = new FavoriteApplicationService(favoriteRepository, notificationApplicationService);
        const favoriteController = new FavoriteController(favoriteApplicationService);

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

        // Rutas de ideas de inversión - GET / no requiere autenticación
        const investmentIdeaController = new InvestmentIdeaController(new InvestmentIdeaService(new TypeORMInvestmentIdeaRepository(AppDataSource)));
        this.app.get('/api/investment-ideas', (req, res) => {
            investmentIdeaController.findAll(req, res);
        });
        this.app.use('/api/investment-ideas', authMiddleware(authService), investmentIdeaRoutes);

        // Rutas de categorías (sin autenticación)
        this.app.use('/api/categories', categoryRoutes);

        // Rutas de departamentos (sin autenticación)
        this.app.use('/api/departments', departmentRoutes);

        // Rutas de chat (requieren autenticación)
        this.app.use('/api/chats', authMiddleware(authService), createChatRoutes(chatController));

        // Rutas de favoritos (requieren autenticación)
        this.app.use('/api/favorites', authMiddleware(authService), createFavoriteRoutes(favoriteController));

        // Rutas de notificaciones (requieren autenticación)
        this.app.use('/api/notifications', authMiddleware(authService), createNotificationRoutes(notificationController));

        // Ejemplo de ruta protegida
        this.app.get('/api/protected', authMiddleware(authService), (req, res) => {
            res.json({ message: 'Esta es una ruta protegida' });
        });

        // Manejador de errores global
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error('Error global:', err);
            res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Error interno del servidor'
            });
        });

        // Manejador de rutas no encontradas
        this.app.use((req: express.Request, res: express.Response) => {
            res.status(404).json({
                success: false,
                message: 'Ruta no encontrada'
            });
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
                        const PORT = Number(process.env.PORT) || 3000;

                        server
                            .listen(PORT, '0.0.0.0')
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