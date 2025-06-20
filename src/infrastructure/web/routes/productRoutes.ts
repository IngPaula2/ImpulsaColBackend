import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import upload from '../middlewares/multerConfig';
import express from 'express';

export const productRoutes = (controller: ProductController) => {
    const router = Router();

    // Crear producto
    router.post('/', controller.create);
    // Listar todos los productos
    router.get('/', controller.findAll);
    // Obtener producto por ID
    router.get('/:id', controller.findById);
    // Actualizar producto por ID
    router.put('/:id', controller.update);
    // Eliminar producto por ID
    router.delete('/:id', controller.delete);

    // Subir imágenes a producto
    router.post(
        '/:id/images',
        upload.array('images', 3),
        controller.addImages
    );
    // Eliminar imagen de producto
    router.delete(
        '/:id/images',
        express.json(),
        controller.removeImage
    );

    // Reemplazar todas las imágenes de un producto
    router.put(
        '/:id/images',
        upload.array('images', 3),
        controller.updateImages
    );

    // Listar productos de un emprendimiento (endpoint legacy usado por el frontend)
    router.get('/by-entrepreneurship/:id', controller.findByEntrepreneurshipId);

    return router;
}; 