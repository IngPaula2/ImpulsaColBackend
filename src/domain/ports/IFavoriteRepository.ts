import { Favorite, FavoriteCreationData } from '../models/Favorite';

export interface IFavoriteRepository {
    save(favoriteData: FavoriteCreationData): Promise<Favorite>;
    remove(userId: number, itemId: number, itemType: string): Promise<void>;
    findByUserAndItem(userId: number, itemId: number, itemType: string): Promise<Favorite | null>;
    findByUser(userId: number): Promise<Favorite[]>;
    findByUserAndType(userId: number, itemType: string): Promise<Favorite[]>;
    isFavorite(userId: number, itemId: number, itemType: string): Promise<boolean>;
} 