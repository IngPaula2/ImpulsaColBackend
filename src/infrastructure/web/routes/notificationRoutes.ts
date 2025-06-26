import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

export function createNotificationRoutes(notificationController: NotificationController): Router {
    const router = Router();

    // GET /notifications - Obtener notificaciones del usuario autenticado
    router.get('/', notificationController.getUserNotifications);

    // GET /notifications/recent - Obtener notificaciones recientes
    router.get('/recent', notificationController.getRecentNotifications);

    // GET /notifications/unread-count - Obtener conteo de notificaciones no leídas
    router.get('/unread-count', notificationController.getUnreadCount);

    // GET /notifications/:id - Obtener una notificación específica
    router.get('/:id', notificationController.getNotificationById);

    // PUT /notifications/mark-read - Marcar notificaciones como leídas
    router.put('/mark-read', notificationController.markAsRead);

    // DELETE /notifications/:id - Eliminar una notificación
    router.delete('/:id', notificationController.deleteNotification);

    // POST /notifications/create - Crear una notificación (para testing)
    router.post('/create', notificationController.createNotification);

    // POST /notifications/welcome - Crear notificación de bienvenida
    router.post('/welcome', notificationController.createWelcomeNotification);

    return router;
} 