export enum NotificationType {
    WELCOME = 'welcome',
    FAVORITE = 'favorite',
    MESSAGE = 'message',
    RATING = 'rating',
    NEW_PRODUCT = 'new_product',
    NEW_ENTREPRENEURSHIP = 'new_entrepreneurship',
    NEW_INVESTMENT_IDEA = 'new_investment_idea',
    SYSTEM = 'system'
}

export interface Notification {
    id?: number;
    user_id: number;
    type: NotificationType;
    title: string;
    message: string;
    data?: NotificationData;
    is_read?: boolean;
    created_at?: Date;
    read_at?: Date;
}

export interface NotificationData {
    // Para notificaciones de favoritos
    item_id?: number;
    item_type?: 'entrepreneurship' | 'product' | 'investment_idea';
    actor_id?: number;
    actor_name?: string;
    actor_image?: string;
    
    // Para notificaciones de mensajes
    chat_id?: number;
    sender_id?: number;
    sender_name?: string;
    sender_image?: string;
    
    // Para notificaciones de calificaciones
    rating?: number;
    reviewer_id?: number;
    reviewer_name?: string;
    
    // Para navegación
    redirect_to?: string;
    entity_id?: number;
    
    // Datos adicionales genéricos
    [key: string]: any;
}

export interface CreateNotificationData {
    user_id: number;
    type: NotificationType;
    title: string;
    message: string;
    data?: NotificationData;
}

export interface NotificationFilters {
    user_id: number;
    type?: NotificationType;
    is_read?: boolean;
    limit?: number;
    offset?: number;
} 