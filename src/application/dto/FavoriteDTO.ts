export interface FavoriteDTO {
    id?: number;
    user_id: number;
    item_id: number;
    item_type: 'product' | 'entrepreneurship' | 'investment_idea';
    item_data: FavoriteItemDataDTO;
    created_at?: Date;
}

export interface FavoriteItemDataDTO {
    id: number;
    title: string;
    description?: string;
    image?: string;
    price?: number;
    location?: string;
    category?: string;
    rating?: number;
    [key: string]: any;
}

export interface CreateFavoriteDTO {
    item_id: number;
    item_type: 'product' | 'entrepreneurship' | 'investment_idea';
    item_data: FavoriteItemDataDTO;
}

export interface RemoveFavoriteDTO {
    item_id: number;
    item_type: 'product' | 'entrepreneurship' | 'investment_idea';
}

export interface FavoriteStatusDTO {
    is_favorite: boolean;
}

export interface FavoritesListResponse {
    success: boolean;
    data: {
        entrepreneurships: FavoriteDTO[];
        products: FavoriteDTO[];
        investment_ideas: FavoriteDTO[];
    };
} 