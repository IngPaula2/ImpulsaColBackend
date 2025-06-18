import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { TypeORMInvestmentIdeaRepository } from '../../persistence/repositories/TypeORMInvestmentIdeaRepository';
import { InvestmentIdeaService } from '../../../application/services/InvestmentIdeaService';
import { InvestmentIdeaController } from '../controllers/InvestmentIdeaController';

const router = Router();
const repository = new TypeORMInvestmentIdeaRepository(AppDataSource);
const service = new InvestmentIdeaService(repository);
const controller = new InvestmentIdeaController(service);

router.post('/', controller.create);
router.get('/', controller.findAll);

export default router; 