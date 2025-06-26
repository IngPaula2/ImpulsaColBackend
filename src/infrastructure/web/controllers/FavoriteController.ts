import { Request, Response } from 'express';
import { FavoriteApplicationService } from '../../../application/services/FavoriteApplicationService';
import { CreateFavoriteDTO, RemoveFavoriteDTO } from '../../../application/dto/FavoriteDTO';

// Interfaz para request autenticado
interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
}

export class FavoriteController {
    constructor(
        private readonly favoriteService: FavoriteApplicationService
    ) {}

    // GET /api/favorites - Obtener todos los favoritos del usuario
    getUserFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            console.log('FavoriteController.getUserFavorites - UserId:', userId);

            const favorites = await this.favoriteService.getUserFavorites(userId);

            res.status(200).json(favorites);
        } catch (error) {
            console.error('FavoriteController.getUserFavorites - Error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener favoritos'
            });
        }
    };

    // POST /api/favorites - Agregar a favoritos
    addToFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const createFavoriteData: CreateFavoriteDTO = req.body;

            console.log('FavoriteController.addToFavorites - Datos:', { userId, createFavoriteData });

            // Validaciones básicas
            if (!createFavoriteData.item_id || !createFavoriteData.item_type || !createFavoriteData.item_data) {
                res.status(400).json({
                    success: false,
                    message: 'Datos incompletos'
                });
                return;
            }

            const favorite = await this.favoriteService.addToFavorites(userId, createFavoriteData);

            res.status(201).json({
                success: true,
                message: 'Agregado a favoritos exitosamente',
                data: favorite
            });
        } catch (error) {
            console.error('FavoriteController.addToFavorites - Error:', error);
            const statusCode = error instanceof Error && error.message.includes('ya está en tus favoritos') ? 409 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al agregar a favoritos'
            });
        }
    };

    // DELETE /api/favorites - Remover de favoritos
    removeFromFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const { item_id, item_type } = req.body as RemoveFavoriteDTO;

            console.log('FavoriteController.removeFromFavorites - Datos:', { userId, item_id, item_type });

            // Validaciones básicas
            if (!item_id || !item_type) {
                res.status(400).json({
                    success: false,
                    message: 'item_id y item_type son requeridos'
                });
                return;
            }

            await this.favoriteService.removeFromFavorites(userId, item_id, item_type);

            res.status(200).json({
                success: true,
                message: 'Eliminado de favoritos exitosamente'
            });
        } catch (error) {
            console.error('FavoriteController.removeFromFavorites - Error:', error);
            const statusCode = error instanceof Error && error.message.includes('no está en tus favoritos') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al eliminar de favoritos'
            });
        }
    };

    // GET /api/favorites/status/:item_type/:item_id - Verificar estado de favorito
    checkFavoriteStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const { item_type, item_id } = req.params;
            const itemIdNumber = parseInt(item_id);

            if (isNaN(itemIdNumber)) {
                res.status(400).json({
                    success: false,
                    message: 'item_id debe ser un número válido'
                });
                return;
            }

            const status = await this.favoriteService.checkFavoriteStatus(userId, itemIdNumber, item_type);

            res.status(200).json({
                success: true,
                data: status
            });
        } catch (error) {
            console.error('FavoriteController.checkFavoriteStatus - Error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al verificar estado de favorito'
            });
        }
    };

    // POST /api/favorites/toggle - Toggle favorito (agregar o quitar)
    toggleFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const { item_id, item_type, item_data } = req.body;

            console.log('FavoriteController.toggleFavorite - Datos:', { userId, item_id, item_type, item_data });

            // Validaciones básicas
            if (!item_id || !item_type || !item_data) {
                res.status(400).json({
                    success: false,
                    message: 'item_id, item_type y item_data son requeridos'
                });
                return;
            }

            const result = await this.favoriteService.toggleFavorite(userId, item_id, item_type, item_data);

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    is_favorite: result.is_favorite
                }
            });
        } catch (error) {
            console.error('FavoriteController.toggleFavorite - Error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al cambiar estado de favorito'
            });
        }
    };
} 