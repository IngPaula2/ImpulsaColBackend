import { INotificationRepository } from '../ports/INotificationRepository';
import { 
    Notification, 
    CreateNotificationData, 
    NotificationFilters, 
    NotificationType, 
    NotificationData 
} from '../models/Notification';

export class NotificationDomainService {
    constructor(
        private readonly notificationRepository: INotificationRepository
    ) {}

    async createNotification(data: CreateNotificationData): Promise<Notification> {
        // Validaciones de dominio
        this.validateNotificationData(data);

        return await this.notificationRepository.create(data);
    }

    async getNotificationById(id: number): Promise<Notification | null> {
        if (id <= 0) {
            throw new Error('ID de notificación inválido');
        }

        return await this.notificationRepository.findById(id);
    }

    async getUserNotifications(filters: NotificationFilters): Promise<Notification[]> {
        if (filters.user_id <= 0) {
            throw new Error('ID de usuario inválido');
        }

        return await this.notificationRepository.findByUserId(filters);
    }

    async markNotificationAsRead(id: number): Promise<Notification> {
        if (id <= 0) {
            throw new Error('ID de notificación inválido');
        }

        return await this.notificationRepository.markAsRead(id);
    }

    async markAllNotificationsAsRead(userId: number): Promise<void> {
        if (userId <= 0) {
            throw new Error('ID de usuario inválido');
        }

        return await this.notificationRepository.markAllAsRead(userId);
    }

    async deleteNotification(id: number): Promise<void> {
        if (id <= 0) {
            throw new Error('ID de notificación inválido');
        }

        return await this.notificationRepository.delete(id);
    }

    async getUnreadCount(userId: number): Promise<number> {
        if (userId <= 0) {
            throw new Error('ID de usuario inválido');
        }

        return await this.notificationRepository.getUnreadCount(userId);
    }

    async getRecentNotifications(userId: number, limit?: number): Promise<Notification[]> {
        if (userId <= 0) {
            throw new Error('ID de usuario inválido');
        }

        if (limit && limit <= 0) {
            throw new Error('Límite debe ser mayor a 0');
        }

        return await this.notificationRepository.findRecentByUserId(userId, limit);
    }

    // Métodos de conveniencia para crear tipos específicos de notificaciones
    async createWelcomeNotification(userId: number): Promise<Notification> {
        const data: CreateNotificationData = {
            user_id: userId,
            type: NotificationType.WELCOME,
            title: '¡Bienvenido a ImpulsaCol!',
            message: 'Te damos la bienvenida a nuestra plataforma de emprendimientos. ¡Explora y conecta con otros emprendedores!',
            data: {
                redirect_to: 'home'
            }
        };

        return await this.createNotification(data);
    }

    async createFavoriteNotification(
        userId: number, 
        actorId: number, 
        actorName: string, 
        itemType: 'entrepreneurship' | 'product' | 'investment_idea',
        itemId: number,
        actorImage?: string
    ): Promise<Notification> {
        const typeMessages = {
            entrepreneurship: 'emprendimiento',
            product: 'producto',
            investment_idea: 'idea de inversión'
        };

        const data: CreateNotificationData = {
            user_id: userId,
            type: NotificationType.FAVORITE,
            title: 'Nuevo favorito',
            message: `${actorName} agregó tu ${typeMessages[itemType]} a favoritos`,
            data: {
                item_id: itemId,
                item_type: itemType,
                actor_id: actorId,
                actor_name: actorName,
                actor_image: actorImage,
                redirect_to: `${itemType}_detail`,
                entity_id: itemId
            }
        };

        return await this.createNotification(data);
    }

    async createMessageNotification(
        userId: number,
        senderId: number,
        senderName: string,
        chatId: number,
        senderImage?: string
    ): Promise<Notification> {
        const data: CreateNotificationData = {
            user_id: userId,
            type: NotificationType.MESSAGE,
            title: 'Nuevo mensaje',
            message: `${senderName} te ha enviado un mensaje`,
            data: {
                chat_id: chatId,
                sender_id: senderId,
                sender_name: senderName,
                sender_image: senderImage,
                redirect_to: 'chat_detail',
                entity_id: chatId
            }
        };

        return await this.createNotification(data);
    }

    async createRatingNotification(
        userId: number,
        reviewerId: number,
        reviewerName: string,
        rating: number,
        itemType: 'entrepreneurship' | 'product' | 'investment_idea',
        itemId: number
    ): Promise<Notification> {
        const data: CreateNotificationData = {
            user_id: userId,
            type: NotificationType.RATING,
            title: 'Nueva calificación',
            message: `${reviewerName} calificó tu ${itemType} con ${rating} estrella${rating > 1 ? 's' : ''}`,
            data: {
                rating,
                reviewer_id: reviewerId,
                reviewer_name: reviewerName,
                item_id: itemId,
                item_type: itemType,
                redirect_to: `${itemType}_detail`,
                entity_id: itemId
            }
        };

        return await this.createNotification(data);
    }

    private validateNotificationData(data: CreateNotificationData): void {
        if (!data.user_id || data.user_id <= 0) {
            throw new Error('ID de usuario es requerido y debe ser válido');
        }

        if (!data.type) {
            throw new Error('Tipo de notificación es requerido');
        }

        if (!Object.values(NotificationType).includes(data.type)) {
            throw new Error('Tipo de notificación inválido');
        }

        if (!data.title || data.title.trim().length === 0) {
            throw new Error('Título de notificación es requerido');
        }

        if (data.title.length > 255) {
            throw new Error('Título de notificación no puede exceder 255 caracteres');
        }

        if (!data.message || data.message.trim().length === 0) {
            throw new Error('Mensaje de notificación es requerido');
        }

        if (data.message.length > 1000) {
            throw new Error('Mensaje de notificación no puede exceder 1000 caracteres');
        }
    }
} 