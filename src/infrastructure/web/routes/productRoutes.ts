import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { TypeORMProductRepository } from '../../persistence/repositories/TypeORMProductRepository';
import { ProductService } from '../../../application/services/ProductService';
import { ProductController } from '../controllers/ProductController';
import upload from '../middlewares/multerConfig';

const router = Router();
const repository = new TypeORMProductRepository(AppDataSource);
const service = new ProductService(repository);
const controller = new ProductController(service);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/by-entrepreneurship/:id', controller.findByEntrepreneurshipId);
router.get('/:id', controller.findById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.post(
  '/:id/upload-image',
  upload.single('productImage'),
  controller.uploadImage
);
router.delete('/:id/image', controller.deleteImage);

export default router; 