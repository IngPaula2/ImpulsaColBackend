import { Notification, CreateNotificationData, NotificationFilters } from '../models/Notification';

export interface INotificationRepository {
    create(data: CreateNotificationData): Promise<Notification>;
    findById(id: number): Promise<Notification | null>;
    findByUserId(filters: NotificationFilters): Promise<Notification[]>;
    markAsRead(id: number): Promise<Notification>;
    markAllAsRead(userId: number): Promise<void>;
    delete(id: number): Promise<void>;
    getUnreadCount(userId: number): Promise<number>;
    findRecentByUserId(userId: number, limit?: number): Promise<Notification[]>;
} 