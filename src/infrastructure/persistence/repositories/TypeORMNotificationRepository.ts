import { DataSource, Repository } from 'typeorm';
import { INotificationRepository } from '../../../domain/ports/INotificationRepository';
import { Notification, CreateNotificationData, NotificationFilters } from '../../../domain/models/Notification';
import { NotificationEntity } from '../entities/NotificationEntity';

export class TypeORMNotificationRepository implements INotificationRepository {
    private repository: Repository<NotificationEntity>;

    constructor(private readonly dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(NotificationEntity);
    }

    async create(data: CreateNotificationData): Promise<Notification> {
        const notification = this.repository.create({
            user_id: data.user_id,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data,
            is_read: false
        });

        const savedNotification = await this.repository.save(notification);
        return this.mapToNotification(savedNotification);
    }

    async findById(id: number): Promise<Notification | null> {
        const notification = await this.repository.findOne({
            where: { id },
            relations: ['user']
        });

        return notification ? this.mapToNotification(notification) : null;
    }

    async findByUserId(filters: NotificationFilters): Promise<Notification[]> {
        try {
            console.log('NotificationRepo - Buscando notificaciones con filtros:', filters);
            
            const queryBuilder = this.repository.createQueryBuilder('notification');
            
            queryBuilder.where('notification.user_id = :userId', { userId: filters.user_id });
            
            if (filters.type) {
                queryBuilder.andWhere('notification.type = :type', { type: filters.type });
            }
            
            if (filters.is_read !== undefined) {
                queryBuilder.andWhere('notification.is_read = :isRead', { isRead: filters.is_read });
            }
            
            queryBuilder
                .orderBy('notification.created_at', 'DESC')
                .limit(filters.limit || 20)
                .offset(filters.offset || 0);
            
            const notifications = await queryBuilder.getMany();
            console.log('NotificationRepo - Notificaciones encontradas:', notifications.length);
            
            return notifications.map(notification => this.mapToNotification(notification));
        } catch (error) {
            console.error('NotificationRepo - Error al buscar notificaciones:', error);
            return [];
        }
    }

    async markAsRead(id: number): Promise<Notification> {
        try {
            console.log('NotificationRepo - Marcando como leída la notificación:', id);
            
            const result = await this.repository.update(id, {
                is_read: true,
                read_at: new Date()
            });

            if (result.affected === 0) {
                throw new Error('Notificación no encontrada');
            }

            const updatedNotification = await this.repository.findOne({ where: { id } });
            if (!updatedNotification) {
                throw new Error('Notificación no encontrada después de la actualización');
            }

            console.log('NotificationRepo - Notificación marcada como leída exitosamente');
            return this.mapToNotification(updatedNotification);
        } catch (error) {
            console.error('NotificationRepo - Error al marcar como leída:', error);
            throw error;
        }
    }

    async markAllAsRead(userId: number): Promise<void> {
        try {
            console.log('NotificationRepo - Marcando todas como leídas para usuario:', userId);
            
            const result = await this.repository.update(
                { user_id: userId, is_read: false },
                { is_read: true, read_at: new Date() }
            );
            
            console.log('NotificationRepo - Notificaciones marcadas como leídas:', result.affected);
        } catch (error) {
            console.error('NotificationRepo - Error al marcar todas como leídas:', error);
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async getUnreadCount(userId: number): Promise<number> {
        try {
            console.log('NotificationRepo - Obteniendo conteo de no leídas para usuario:', userId);
            
            const count = await this.repository.count({
                where: {
                    user_id: userId,
                    is_read: false
                }
            });
            
            console.log('NotificationRepo - Conteo de no leídas:', count);
            return count;
        } catch (error) {
            console.error('NotificationRepo - Error al obtener conteo de no leídas:', error);
            return 0;
        }
    }

    async findRecentByUserId(userId: number, limit: number = 10): Promise<Notification[]> {
        const notifications = await this.repository.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
            take: limit
        });

        return notifications.map(notification => this.mapToNotification(notification));
    }

    private mapToNotification(entity: NotificationEntity): Notification {
        return {
            id: entity.id,
            user_id: entity.user_id,
            type: entity.type,
            title: entity.title,
            message: entity.message,
            data: entity.data,
            is_read: entity.is_read,
            created_at: entity.created_at,
            read_at: entity.read_at
        };
    }
} 