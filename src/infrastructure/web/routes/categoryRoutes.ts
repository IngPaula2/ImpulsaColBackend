import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { CategoryController } from '../controllers/CategoryController';

const router = Router();
const categoryController = new CategoryController(AppDataSource);

router.get('/', categoryController.getCategoriesByType);

export default router; 