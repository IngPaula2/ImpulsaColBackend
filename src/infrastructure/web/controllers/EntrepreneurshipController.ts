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
      const dto = { ...req.body, user_id: req.user?.userId };
      const result = await this.service.create(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ success: false, message });
    }
  };

  findAll = async (_req: Request, res: Response) => {
    try {
      const result = await this.service.findAll();
      console.log('Datos de emprendimientos a enviar:', JSON.stringify(result, null, 2));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, message });
    }
  };

  findMine = async (req: RequestWithUser, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
      }
      const result = await this.service.findMine(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, message });
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
      const result = await this.service.findById(id);
      if (!result) return res.status(404).json({ success: false, message: 'Emprendimiento no encontrado' });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
      }
      const result = await this.service.update(id, req.body);
      if (!result) {
          return res.status(404).json({ success: false, message: 'Emprendimiento no encontrado para actualizar' });
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el emprendimiento';
      res.status(500).json({ success: false, message });
    }
  };

  updateCoverImage = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID de emprendimiento inválido' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se ha subido ninguna imagen' });
      }
      const imageUrl = req.file.path;
      const result = await this.service.updateCoverImage(id, imageUrl);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir la imagen';
      res.status(500).json({ success: false, message });
    }
  };

  delete = async (req: RequestWithUser, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
      }
      const userId = req.user?.userId;
      const entrepreneurship = await this.service.findById(id);
      if (entrepreneurship?.user_id !== userId) {
          return res.status(403).json({ success: false, message: 'No autorizado para eliminar este emprendimiento' });
      }
      await this.service.delete(id);
      res.status(200).json({ success: true, message: 'Emprendimiento eliminado correctamente' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar el emprendimiento';
      res.status(500).json({ success: false, message });
    }
  };
} 