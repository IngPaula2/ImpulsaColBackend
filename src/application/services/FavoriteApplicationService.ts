import { IFavoriteRepository } from '../../domain/ports/IFavoriteRepository';
import { FavoriteDTO, CreateFavoriteDTO, FavoriteStatusDTO, FavoritesListResponse, FavoriteItemDataDTO } from '../dto/FavoriteDTO';
import { Favorite, FavoriteCreationData } from '../../domain/models/Favorite';
import { NotificationApplicationService } from './NotificationApplicationService';

export class FavoriteApplicationService {
    constructor(
        private readonly favoriteRepository: IFavoriteRepository,
        private readonly notificationService?: NotificationApplicationService
    ) {}

    async addToFavorites(userId: number, createFavoriteData: CreateFavoriteDTO): Promise<FavoriteDTO> {
        try {
            console.log('FavoriteApplicationService.addToFavorites - Datos:', { userId, createFavoriteData });

            // Verificar si ya existe como favorito
            const existingFavorite = await this.favoriteRepository.findByUserAndItem(
                userId,
                createFavoriteData.item_id,
                createFavoriteData.item_type
            );

            if (existingFavorite) {
                throw new Error('Este elemento ya está en tus favoritos');
            }

            // Crear datos de dominio
            const favoriteCreationData: FavoriteCreationData = {
                user_id: userId,
                item_id: createFavoriteData.item_id,
                item_type: createFavoriteData.item_type,
                item_data: createFavoriteData.item_data
            };

            // Guardar en favoritos
            const savedFavorite = await this.favoriteRepository.save(favoriteCreationData);
            
            // Crear notificación si el servicio está disponible y el item no pertenece al usuario
            await this.createFavoriteNotification(userId, createFavoriteData);
            
            return this.mapToDTO(savedFavorite);
        } catch (error) {
            console.error('FavoriteApplicationService.addToFavorites - Error:', error);
            throw error;
        }
    }

    async removeFromFavorites(userId: number, itemId: number, itemType: string): Promise<void> {
        try {
            console.log('FavoriteApplicationService.removeFromFavorites - Datos:', { userId, itemId, itemType });

            // Verificar si existe como favorito
            const existingFavorite = await this.favoriteRepository.findByUserAndItem(
                userId,
                itemId,
                itemType
            );

            if (!existingFavorite) {
                throw new Error('Este elemento no está en tus favoritos');
            }

            // Remover de favoritos
            await this.favoriteRepository.remove(userId, itemId, itemType);
        } catch (error) {
            console.error('FavoriteApplicationService.removeFromFavorites - Error:', error);
            throw error;
        }
    }

    async getUserFavorites(userId: number): Promise<{ success: boolean; data: { entrepreneurships: Favorite[]; products: Favorite[]; investment_ideas: Favorite[] } }> {
        try {
            console.log('FavoriteApplicationService.getUserFavorites - UserId:', userId);

            const favorites = await this.favoriteRepository.findByUser(userId);
            
            // Separar por tipo
            const entrepreneurships = favorites.filter(f => f.item_type === 'entrepreneurship');
            const products = favorites.filter(f => f.item_type === 'product');
            const investment_ideas = favorites.filter(f => f.item_type === 'investment_idea');

            const result = {
                entrepreneurships,
                products,
                investment_ideas
            };

            console.log('FavoriteApplicationService.getUserFavorites - Favoritos encontrados:', result);
            
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('FavoriteApplicationService.getUserFavorites - Error:', error);
            throw error;
        }
    }

    async checkFavoriteStatus(userId: number, itemId: number, itemType: string): Promise<FavoriteStatusDTO> {
        try {
            const isFavorite = await this.favoriteRepository.isFavorite(userId, itemId, itemType);
            
            return {
                is_favorite: isFavorite
            };
        } catch (error) {
            console.error('FavoriteApplicationService.checkFavoriteStatus - Error:', error);
            throw error;
        }
    }

    async toggleFavorite(userId: number, itemId: number, itemType: string, itemData: FavoriteItemDataDTO): Promise<{ is_favorite: boolean; message: string }> {
        try {
            console.log('FavoriteApplicationService.toggleFavorite - Datos:', { userId, itemId, itemType });

            const currentStatus = await this.favoriteRepository.isFavorite(userId, itemId, itemType);
            
            if (currentStatus) {
                // Quitar de favoritos
                await this.favoriteRepository.remove(userId, itemId, itemType);
                return {
                    is_favorite: false,
                    message: 'Eliminado de favoritos'
                };
            } else {
                // Agregar a favoritos
                const favoriteCreationData: FavoriteCreationData = {
                    user_id: userId,
                    item_id: itemId,
                    item_type: itemType as 'product' | 'entrepreneurship' | 'investment_idea',
                    item_data: itemData
                };

                await this.favoriteRepository.save(favoriteCreationData);
                
                // Crear notificación
                await this.createFavoriteNotificationFromData(userId, itemId, itemType, itemData);
                
                return {
                    is_favorite: true,
                    message: 'Agregado a favoritos'
                };
            }
        } catch (error) {
            console.error('FavoriteApplicationService.toggleFavorite - Error:', error);
            throw error;
        }
    }

    private mapToDTO(favorite: Favorite): FavoriteDTO {
        return {
            id: favorite.id,
            user_id: favorite.user_id,
            item_id: favorite.item_id,
            item_type: favorite.item_type,
            item_data: favorite.item_data,
            created_at: favorite.created_at
        };
    }

    private async createFavoriteNotification(userId: number, createFavoriteData: CreateFavoriteDTO): Promise<void> {
        if (!this.notificationService) return;

        try {
            // Obtener información del item para determinar el propietario
            const itemData = createFavoriteData.item_data;
            
            // Verificar si el item tiene información del propietario
            if (itemData && itemData.user_id && itemData.user_id !== userId) {
                // Obtener información del usuario que agregó a favoritos
                const actorName = itemData.actor_name || 'Un usuario';
                const actorImage = itemData.actor_image;
                
                await this.notificationService.createFavoriteNotification(
                    itemData.user_id, // Usuario que recibe la notificación (propietario del item)
                    userId, // Usuario que agregó a favoritos
                    actorName,
                    createFavoriteData.item_type as 'entrepreneurship' | 'product' | 'investment_idea',
                    createFavoriteData.item_id,
                    actorImage
                );
            }
        } catch (error) {
            console.error('Error al crear notificación de favorito:', error);
            // No lanzar error para no afectar el flujo principal
        }
    }

    private async createFavoriteNotificationFromData(userId: number, itemId: number, itemType: string, itemData: FavoriteItemDataDTO): Promise<void> {
        if (!this.notificationService) return;

        try {
            // Verificar si el item tiene información del propietario
            if (itemData && itemData.user_id && itemData.user_id !== userId) {
                // Obtener información del usuario que agregó a favoritos
                const actorName = itemData.actor_name || 'Un usuario';
                const actorImage = itemData.actor_image;
                
                await this.notificationService.createFavoriteNotification(
                    itemData.user_id, // Usuario que recibe la notificación (propietario del item)
                    userId, // Usuario que agregó a favoritos
                    actorName,
                    itemType as 'entrepreneurship' | 'product' | 'investment_idea',
                    itemId,
                    actorImage
                );
            }
        } catch (error) {
            console.error('Error al crear notificación de favorito:', error);
            // No lanzar error para no afectar el flujo principal
        }
    }
} 