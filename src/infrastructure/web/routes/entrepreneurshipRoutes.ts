import { Router, json } from 'express';
import { AppDataSource } from '../../config/database';
import { TypeORMEntrepreneurshipRepository } from '../../persistence/repositories/TypeORMEntrepreneurshipRepository';
import { EntrepreneurshipService } from '../../../application/services/EntrepreneurshipService';
import { EntrepreneurshipController } from '../controllers/EntrepreneurshipController';
import upload from '../middlewares/multerEntrepreneurshipConfig';

export const entrepreneurshipRoutes = (controller: EntrepreneurshipController) => {
    const router = Router();
    const jsonParser = json();

    router.post('/', jsonParser, controller.create);
    router.get('/', controller.findAll);
    router.get('/mine', controller.findMine);
    router.get('/:id', controller.findById);
    router.put('/:id', jsonParser, controller.update);
    router.delete('/:id', controller.delete);
    router.post(
        '/:id/cover-image',
        upload.single('cover_image'),
        controller.updateCoverImage
    );

    return router;
}; 