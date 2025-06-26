import { Router } from 'express';
import express from 'express';
import { FavoriteController } from '../controllers/FavoriteController';

export const createFavoriteRoutes = (favoriteController: FavoriteController): Router => {
    const router = Router();
    const jsonParser = express.json();

    // Todas las rutas de favoritos requieren autenticación
    
    // GET /api/favorites - Obtener favoritos del usuario
    router.get('/', favoriteController.getUserFavorites);

    // POST /api/favorites - Agregar a favoritos
    router.post('/', jsonParser, favoriteController.addToFavorites);

    // DELETE /api/favorites - Remover de favoritos
    router.delete('/', jsonParser, favoriteController.removeFromFavorites);

    // GET /api/favorites/status/:item_type/:item_id - Verificar estado de favorito
    router.get('/status/:item_type/:item_id', favoriteController.checkFavoriteStatus);

    // POST /api/favorites/toggle - Toggle favorito
    router.post('/toggle', jsonParser, favoriteController.toggleFavorite);

    return router;
}; 