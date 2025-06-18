import { Request, Response } from 'express';
import { EntrepreneurshipService } from '../../../application/services/EntrepreneurshipService';

// Extiende Request para incluir user
interface RequestWithUser extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export class EntrepreneurshipController {
  constructor(private readonly service: EntrepreneurshipService) {}

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
      res.status(200).json({ data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };

  findMine = async (req: RequestWithUser, res: Response) => {
    try {
      const userId = req.user?.userId;
      console.log('findMine - userId:', userId);
      if (!userId) return res.status(401).json({ error: 'No autenticado' });
      const result = await this.service.findByUserId(userId);
      console.log('findMine - emprendimientos encontrados:', result);
      res.status(200).json({ data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };

  findOne = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
      const result = await this.service.findOne(id);
      if (!result) return res.status(404).json({ error: 'No encontrado' });
      res.status(200).json({ data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };
} 