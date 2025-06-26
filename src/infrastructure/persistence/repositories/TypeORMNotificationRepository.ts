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
        const queryBuilder = this.repository.createQueryBuilder('notification')
            .where('notification.user_id = :userId', { userId: filters.user_id })
            .orderBy('notification.created_at', 'DESC');

        if (filters.type) {
            queryBuilder.andWhere('notification.type = :type', { type: filters.type });
        }

        if (filters.is_read !== undefined) {
            queryBuilder.andWhere('notification.is_read = :isRead', { isRead: filters.is_read });
        }

        if (filters.limit) {
            queryBuilder.limit(filters.limit);
        }

        if (filters.offset) {
            queryBuilder.offset(filters.offset);
        }

        const notifications = await queryBuilder.getMany();
        return notifications.map(notification => this.mapToNotification(notification));
    }

    async markAsRead(id: number): Promise<Notification> {
        await this.repository.update(id, {
            is_read: true,
            read_at: new Date()
        });

        const updatedNotification = await this.repository.findOne({ where: { id } });
        if (!updatedNotification) {
            throw new Error('Notificación no encontrada después de la actualización');
        }

        return this.mapToNotification(updatedNotification);
    }

    async markAllAsRead(userId: number): Promise<void> {
        await this.repository.update(
            { user_id: userId, is_read: false },
            { is_read: true, read_at: new Date() }
        );
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async getUnreadCount(userId: number): Promise<number> {
        return await this.repository.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });
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