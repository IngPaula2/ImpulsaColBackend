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

  update = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }

      const updateData = req.body;
      const result = await this.service.update(id, updateData);

      if (!result) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el producto';
      res.status(500).json({ success: false, message });
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
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
      }
      const result = await this.service.findById(id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al buscar el producto';
      res.status(404).json({ success: false, message });
    }
  };

  uploadImage = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se ha subido ninguna imagen' });
      }

      // NO guardamos la URL completa, solo la ruta relativa.
      // El frontend se encargará de construir la URL final.
      const imageUrl = `/uploads/products/${req.file.filename}`;

      const result = await this.service.addImage(id, imageUrl);

      if (!result) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir la imagen';
      res.status(500).json({ success: false, message });
    }
  };

  deleteImage = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { imageUrl } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }

      if (!imageUrl) {
        return res.status(400).json({ success: false, message: 'La URL de la imagen es requerida' });
      }

      const result = await this.service.deleteImage(id, imageUrl);
      res.status(200).json({ success: true, data: result });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar la imagen';
      res.status(500).json({ success: false, message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }

      const result = await this.service.delete(id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado para eliminar' });
      }

      res.status(204).send(); // 204 No Content es una respuesta común para delete exitoso
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar el producto';
      res.status(500).json({ success: false, message });
    }
  };
} 