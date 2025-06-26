export interface NotificationDTO {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    data?: NotificationDataDTO;
    is_read: boolean;
    created_at: Date;
    read_at?: Date;
}

export interface NotificationDataDTO {
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

export interface CreateNotificationDTO {
    user_id: number;
    type: 'welcome' | 'favorite' | 'message' | 'rating' | 'new_product' | 'new_entrepreneurship' | 'new_investment_idea' | 'system';
    title: string;
    message: string;
    data?: NotificationDataDTO;
}

export interface NotificationFiltersDTO {
    user_id: number;
    type?: string;
    is_read?: boolean;
    limit?: number;
    offset?: number;
}

export interface NotificationResponseDTO {
    success: boolean;
    data?: NotificationDTO | NotificationDTO[];
    message?: string;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    };
}

export interface UnreadCountDTO {
    count: number;
}

export interface MarkAsReadDTO {
    notification_id?: number; // Para marcar una específica
    mark_all?: boolean; // Para marcar todas
} 