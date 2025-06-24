import { Router, json } from 'express';
import { AppDataSource } from '../../config/database';
import { TypeORMInvestmentIdeaRepository } from '../../persistence/repositories/TypeORMInvestmentIdeaRepository';
import { InvestmentIdeaService } from '../../../application/services/InvestmentIdeaService';
import { InvestmentIdeaController } from '../controllers/InvestmentIdeaController';
import upload from '../middlewares/multerInvestmentIdeaConfig';
import videoUpload from '../middlewares/multerVideoConfig';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { JWTAuthService } from '../../adapters/security/JWTAuthService';

const router = Router();
const repository = new TypeORMInvestmentIdeaRepository(AppDataSource);
const service = new InvestmentIdeaService(repository);
const controller = new InvestmentIdeaController(service);
const authService = new JWTAuthService();

// Rutas CRUD básicas (usando JSON)
router.post('/', [authMiddleware(authService), json()], controller.create);
router.get('/', controller.findAll);
router.get('/mine', authMiddleware(authService), controller.findMine);
router.get('/:id', authMiddleware(authService), controller.findById);
router.put('/:id', [authMiddleware(authService), json()], controller.update);
router.delete('/:id', authMiddleware(authService), controller.delete);

// Rutas para imágenes (usando multipart/form-data)
router.post('/:id/images', authMiddleware(authService), upload.array('images', 2), controller.addImages);
router.put('/:id/images', authMiddleware(authService), upload.single('images'), controller.updateImage);
router.delete('/:id/images', [authMiddleware(authService), json()], controller.removeImage);

// Ruta para video (usando multipart/form-data)
router.post('/:id/video', authMiddleware(authService), videoUpload.single('video'), controller.addVideo);
router.delete('/:id/video', authMiddleware(authService), controller.removeVideo);

export default router; 