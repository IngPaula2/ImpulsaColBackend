import { DataSource, Repository } from 'typeorm';
import { IFavoriteRepository } from '../../../domain/ports/IFavoriteRepository';
import { Favorite, FavoriteCreationData } from '../../../domain/models/Favorite';
import { FavoriteEntity } from '../entities/FavoriteEntity';

export class TypeORMFavoriteRepository implements IFavoriteRepository {
    private favoriteRepository: Repository<FavoriteEntity>;

    constructor(dataSource: DataSource) {
        this.favoriteRepository = dataSource.getRepository(FavoriteEntity);
    }

    async save(favoriteData: FavoriteCreationData): Promise<Favorite> {
        try {
            console.log('TypeORMFavoriteRepository.save - Datos a guardar:', favoriteData);
            
            const favoriteEntity = this.favoriteRepository.create({
                user_id: favoriteData.user_id,
                item_id: favoriteData.item_id,
                item_type: favoriteData.item_type,
                item_data: favoriteData.item_data
            });

            const savedEntity = await this.favoriteRepository.save(favoriteEntity);
            console.log('TypeORMFavoriteRepository.save - Favorito guardado:', savedEntity);
            
            return this.mapEntityToDomain(savedEntity);
        } catch (error) {
            console.error('TypeORMFavoriteRepository.save - Error:', error);
            throw error;
        }
    }

    async remove(userId: number, itemId: number, itemType: string): Promise<void> {
        try {
            console.log('TypeORMFavoriteRepository.remove - Removiendo favorito:', { userId, itemId, itemType });
            
            const result = await this.favoriteRepository.delete({
                user_id: userId,
                item_id: itemId,
                item_type: itemType
            });

            console.log('TypeORMFavoriteRepository.remove - Resultado:', result);
        } catch (error) {
            console.error('TypeORMFavoriteRepository.remove - Error:', error);
            throw error;
        }
    }

    async findByUserAndItem(userId: number, itemId: number, itemType: string): Promise<Favorite | null> {
        try {
            const entity = await this.favoriteRepository.findOne({
                where: {
                    user_id: userId,
                    item_id: itemId,
                    item_type: itemType
                }
            });

            return entity ? this.mapEntityToDomain(entity) : null;
        } catch (error) {
            console.error('TypeORMFavoriteRepository.findByUserAndItem - Error:', error);
            throw error;
        }
    }

    async findByUser(userId: number): Promise<Favorite[]> {
        try {
            const entities = await this.favoriteRepository.find({
                where: { user_id: userId },
                order: { created_at: 'DESC' }
            });

            return entities.map(entity => this.mapEntityToDomain(entity));
        } catch (error) {
            console.error('TypeORMFavoriteRepository.findByUser - Error:', error);
            throw error;
        }
    }

    async findByUserAndType(userId: number, itemType: string): Promise<Favorite[]> {
        try {
            const entities = await this.favoriteRepository.find({
                where: { 
                    user_id: userId,
                    item_type: itemType
                },
                order: { created_at: 'DESC' }
            });

            return entities.map(entity => this.mapEntityToDomain(entity));
        } catch (error) {
            console.error('TypeORMFavoriteRepository.findByUserAndType - Error:', error);
            throw error;
        }
    }

    async isFavorite(userId: number, itemId: number, itemType: string): Promise<boolean> {
        try {
            const count = await this.favoriteRepository.count({
                where: {
                    user_id: userId,
                    item_id: itemId,
                    item_type: itemType
                }
            });

            return count > 0;
        } catch (error) {
            console.error('TypeORMFavoriteRepository.isFavorite - Error:', error);
            throw error;
        }
    }

    private mapEntityToDomain(entity: FavoriteEntity): Favorite {
        return {
            id: entity.id,
            user_id: entity.user_id,
            item_id: entity.item_id,
            item_type: entity.item_type as 'product' | 'entrepreneurship' | 'investment_idea',
            item_data: entity.item_data,
            created_at: entity.created_at
        };
    }
} 