import { Request, Response } from 'express';
import { InvestmentIdeaService } from '../../../application/services/InvestmentIdeaService';

// Extiende Request para incluir user
interface RequestWithUser extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export class InvestmentIdeaController {
  constructor(private readonly service: InvestmentIdeaService) {}

  create = async (req: RequestWithUser, res: Response) => {
    try {
      const dto = {
        ...req.body,
        user_id: req.user?.userId // Sobrescribe el user_id con el del token
      };
      const result = await this.service.create(dto);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };

  findAll = async (_req: Request, res: Response) => {
    try {
      const result = await this.service.findAll();
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };
} 