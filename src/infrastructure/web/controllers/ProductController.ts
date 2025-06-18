import { Request, Response } from 'express';
import { ProductService } from '../../../application/services/ProductService';

export class ProductController {
  constructor(private readonly service: ProductService) {}

  create = async (req: Request, res: Response) => {
    try {
      const dto = req.body;
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

  findByEntrepreneurshipId = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
      const result = await this.service.findByEntrepreneurshipId(id);
      res.status(200).json({ data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };
} 