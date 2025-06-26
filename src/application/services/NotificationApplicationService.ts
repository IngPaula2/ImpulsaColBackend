import { NotificationDomainService } from '../../domain/services/NotificationDomainService';
import { 
    NotificationDTO, 
    CreateNotificationDTO, 
    NotificationFiltersDTO, 
    NotificationResponseDTO,
    UnreadCountDTO,
    MarkAsReadDTO,
    NotificationDataDTO
} from '../dto/NotificationDTO';
import { 
    Notification, 
    CreateNotificationData, 
    NotificationFilters, 
    NotificationType,
    NotificationData
} from '../../domain/models/Notification';

export class NotificationApplicationService {
    constructor(
        private readonly notificationDomainService: NotificationDomainService
    ) {}

    async createNotification(createData: CreateNotificationDTO): Promise<NotificationResponseDTO> {
        try {
            // Mapear DTO a modelo de dominio
            const domainData: CreateNotificationData = {
                user_id: createData.user_id,
                type: createData.type as NotificationType,
                title: createData.title,
                message: createData.message,
                data: createData.data ? this.mapNotificationDataDTOToDomain(createData.data) : undefined
            };

            const notification = await this.notificationDomainService.createNotification(domainData);

            return {
                success: true,
                data: this.mapNotificationToDTO(notification),
                message: 'Notificación creada exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al crear la notificación'
            };
        }
    }

    async getUserNotifications(filters: NotificationFiltersDTO): Promise<NotificationResponseDTO> {
        try {
            const domainFilters: NotificationFilters = {
                user_id: filters.user_id,
                type: filters.type as NotificationType,
                is_read: filters.is_read,
                limit: filters.limit || 20,
                offset: filters.offset || 0
            };

            const notifications = await this.notificationDomainService.getUserNotifications(domainFilters);
            const notificationDTOs = notifications.map(notification => this.mapNotificationToDTO(notification));

            // Información de paginación
            const hasMore = notifications.length === (filters.limit || 20);
            const page = Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1;

            return {
                success: true,
                data: notificationDTOs,
                pagination: {
                    total: notifications.length,
                    page: page,
                    limit: filters.limit || 20,
                    hasMore: hasMore
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener las notificaciones'
            };
        }
    }

    async getNotificationById(id: number): Promise<NotificationResponseDTO> {
        try {
            const notification = await this.notificationDomainService.getNotificationById(id);
            
            if (!notification) {
                return {
                    success: false,
                    message: 'Notificación no encontrada'
                };
            }

            return {
                success: true,
                data: this.mapNotificationToDTO(notification)
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener la notificación'
            };
        }
    }

    async markAsRead(markData: MarkAsReadDTO, userId: number): Promise<NotificationResponseDTO> {
        try {
            if (markData.mark_all) {
                await this.notificationDomainService.markAllNotificationsAsRead(userId);
                return {
                    success: true,
                    message: 'Todas las notificaciones marcadas como leídas'
                };
            } else if (markData.notification_id) {
                const notification = await this.notificationDomainService.markNotificationAsRead(markData.notification_id);
                return {
                    success: true,
                    data: this.mapNotificationToDTO(notification),
                    message: 'Notificación marcada como leída'
                };
            } else {
                return {
                    success: false,
                    message: 'Debe especificar notification_id o mark_all'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al marcar notificación como leída'
            };
        }
    }

    async deleteNotification(id: number): Promise<NotificationResponseDTO> {
        try {
            await this.notificationDomainService.deleteNotification(id);
            return {
                success: true,
                message: 'Notificación eliminada exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al eliminar la notificación'
            };
        }
    }

    async getUnreadCount(userId: number): Promise<UnreadCountDTO> {
        try {
            const count = await this.notificationDomainService.getUnreadCount(userId);
            return { count };
        } catch (error) {
            console.error('Error al obtener el conteo de notificaciones no leídas:', error);
            return { count: 0 };
        }
    }

    async getRecentNotifications(userId: number, limit?: number): Promise<NotificationResponseDTO> {
        try {
            const notifications = await this.notificationDomainService.getRecentNotifications(userId, limit);
            const notificationDTOs = notifications.map(notification => this.mapNotificationToDTO(notification));

            return {
                success: true,
                data: notificationDTOs
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener notificaciones recientes'
            };
        }
    }

    // Métodos de conveniencia para crear tipos específicos de notificaciones
    async createWelcomeNotification(userId: number): Promise<NotificationResponseDTO> {
        try {
            const notification = await this.notificationDomainService.createWelcomeNotification(userId);
            return {
                success: true,
                data: this.mapNotificationToDTO(notification),
                message: 'Notificación de bienvenida creada'
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al crear notificación de bienvenida'
            };
        }
    }

    async createFavoriteNotification(
        userId: number, 
        actorId: number, 
        actorName: string, 
        itemType: 'entrepreneurship' | 'product' | 'investment_idea',
        itemId: number,
        actorImage?: string
    ): Promise<NotificationResponseDTO> {
        try {
            const notification = await this.notificationDomainService.createFavoriteNotification(
                userId, actorId, actorName, itemType, itemId, actorImage
            );
            return {
                success: true,
                data: this.mapNotificationToDTO(notification),
                message: 'Notificación de favorito creada'
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al crear notificación de favorito'
            };
        }
    }

    async createMessageNotification(
        userId: number,
        senderId: number,
        senderName: string,
        chatId: number,
        senderImage?: string
    ): Promise<NotificationResponseDTO> {
        try {
            const notification = await this.notificationDomainService.createMessageNotification(
                userId, senderId, senderName, chatId, senderImage
            );
            return {
                success: true,
                data: this.mapNotificationToDTO(notification),
                message: 'Notificación de mensaje creada'
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al crear notificación de mensaje'
            };
        }
    }

    // Métodos de mapeo
    private mapNotificationToDTO(notification: Notification): NotificationDTO {
        return {
            id: notification.id!,
            user_id: notification.user_id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data ? this.mapNotificationDataDomainToDTO(notification.data) : undefined,
            is_read: notification.is_read || false,
            created_at: notification.created_at || new Date(),
            read_at: notification.read_at
        };
    }

    private mapNotificationDataDTOToDomain(dto: NotificationDataDTO): NotificationData {
        return {
            item_id: dto.item_id,
            item_type: dto.item_type,
            actor_id: dto.actor_id,
            actor_name: dto.actor_name,
            actor_image: dto.actor_image,
            chat_id: dto.chat_id,
            sender_id: dto.sender_id,
            sender_name: dto.sender_name,
            sender_image: dto.sender_image,
            rating: dto.rating,
            reviewer_id: dto.reviewer_id,
            reviewer_name: dto.reviewer_name,
            redirect_to: dto.redirect_to,
            entity_id: dto.entity_id,
            ...dto
        };
    }

    private mapNotificationDataDomainToDTO(domain: NotificationData): NotificationDataDTO {
        return {
            item_id: domain.item_id,
            item_type: domain.item_type,
            actor_id: domain.actor_id,
            actor_name: domain.actor_name,
            actor_image: domain.actor_image,
            chat_id: domain.chat_id,
            sender_id: domain.sender_id,
            sender_name: domain.sender_name,
            sender_image: domain.sender_image,
            rating: domain.rating,
            reviewer_id: domain.reviewer_id,
            reviewer_name: domain.reviewer_name,
            redirect_to: domain.redirect_to,
            entity_id: domain.entity_id,
            ...domain
        };
    }
} 