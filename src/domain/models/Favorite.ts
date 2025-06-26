export interface Favorite {
    id?: number;
    user_id: number;
    item_id: number;
    item_type: 'product' | 'entrepreneurship' | 'investment_idea';
    item_data: FavoriteItemData;
    created_at?: Date;
}

export interface FavoriteItemData {
    id: number;
    title: string;
    description?: string;
    image?: string;
    price?: number;
    location?: string;
    category?: string;
    rating?: number;
    [key: string]: any; // Para datos adicionales específicos del tipo
}

export interface FavoriteCreationData {
    user_id: number;
    item_id: number;
    item_type: 'product' | 'entrepreneurship' | 'investment_idea';
    item_data: FavoriteItemData;
} 