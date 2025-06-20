import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { TypeORMEntrepreneurshipRepository } from '../../persistence/repositories/TypeORMEntrepreneurshipRepository';
import { EntrepreneurshipService } from '../../../application/services/EntrepreneurshipService';
import { EntrepreneurshipController } from '../controllers/EntrepreneurshipController';
import upload from '../middlewares/multerEntrepreneurshipConfig';

const router = Router();
const repository = new TypeORMEntrepreneurshipRepository(AppDataSource);
const service = new EntrepreneurshipService(repository);
const controller = new EntrepreneurshipController(service);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/mine', controller.findMine);
router.get('/:id', controller.findOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.post(
  '/:id/upload-image',
  upload.single('entrepreneurshipImage'),
  controller.uploadImage
);

export default router; 