import { Request, Response } from 'express';
import { NotificationApplicationService } from '../../../application/services/NotificationApplicationService';
import { 
    CreateNotificationDTO, 
    NotificationFiltersDTO, 
    MarkAsReadDTO 
} from '../../../application/dto/NotificationDTO';

// Interfaz local para request autenticado
interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
}

export class NotificationController {
    constructor(
        private readonly notificationApplicationService: NotificationApplicationService
    ) {}

    // GET /notifications - Obtener notificaciones del usuario autenticado
    getUserNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            // Parámetros de consulta
            const { 
                type, 
                is_read, 
                limit = '20', 
                offset = '0' 
            } = req.query;

            const filters: NotificationFiltersDTO = {
                user_id: userId,
                type: type as string,
                is_read: is_read === 'true' ? true : is_read === 'false' ? false : undefined,
                limit: parseInt(limit as string, 10),
                offset: parseInt(offset as string, 10)
            };

            console.log('NotificationController.getUserNotifications - Filtros:', filters);

            const result = await this.notificationApplicationService.getUserNotifications(filters);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error en getUserNotifications:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    // GET /notifications/recent - Obtener notificaciones recientes
    getRecentNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const { limit = '10' } = req.query;
            const limitNumber = parseInt(limit as string, 10);

            console.log('NotificationController.getRecentNotifications - UserId:', userId, 'Limit:', limitNumber);

            const result = await this.notificationApplicationService.getRecentNotifications(userId, limitNumber);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error en getRecentNotifications:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    // GET /notifications/unread-count - Obtener conteo de notificaciones no leídas
    getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            console.log('NotificationController.getUnreadCount - UserId:', userId);

            const result = await this.notificationApplicationService.getUnreadCount(userId);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error en getUnreadCount:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    // GET /notifications/:id - Obtener una notificación específica
    getNotificationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const notificationId = parseInt(id, 10);

            if (isNaN(notificationId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de notificación inválido'
                });
                return;
            }

            console.log('NotificationController.getNotificationById - NotificationId:', notificationId);

            const result = await this.notificationApplicationService.getNotificationById(notificationId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Error en getNotificationById:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    // PUT /notifications/mark-read - Marcar notificaciones como leídas
    markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const markData: MarkAsReadDTO = req.body;

            console.log('NotificationController.markAsRead - UserId:', userId, 'Data:', markData);

            const result = await this.notificationApplicationService.markAsRead(markData, userId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error en markAsRead:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    // DELETE /notifications/:id - Eliminar una notificación
    deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const notificationId = parseInt(id, 10);

            if (isNaN(notificationId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de notificación inválido'
                });
                return;
            }

            console.log('NotificationController.deleteNotification - NotificationId:', notificationId);

            const result = await this.notificationApplicationService.deleteNotification(notificationId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error en deleteNotification:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    // POST /notifications/create - Crear una notificación (para testing o uso interno)
    createNotification = async (req: Request, res: Response): Promise<void> => {
        try {
            const createData: CreateNotificationDTO = req.body;

            console.log('NotificationController.createNotification - Data:', createData);

            // Validación básica
            if (!createData.user_id || !createData.type || !createData.title || !createData.message) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: user_id, type, title, message'
                });
                return;
            }

            const result = await this.notificationApplicationService.createNotification(createData);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error en createNotification:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };

    // POST /notifications/welcome - Crear notificación de bienvenida para usuario autenticado
    createWelcomeNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            console.log('NotificationController.createWelcomeNotification - UserId:', userId);

            const result = await this.notificationApplicationService.createWelcomeNotification(userId);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error en createWelcomeNotification:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
} 