import { Request, Response } from 'express';
import { ProductService } from '../../../application/services/ProductService';

export class ProductController {
  constructor(private readonly service: ProductService) {}

  /**
   * Crea un nuevo producto
   */
  create = async (req: Request, res: Response) => {
    try {
      const dto = req.body;
      // Validación básica de entrada
      if (!dto || typeof dto !== 'object') {
        return res.status(400).json({ success: false, message: 'Datos de producto inválidos' });
      }
      const result = await this.service.create(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ success: false, message });
    }
  };

  /**
   * Actualiza un producto existente
   */
  update = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }
      const updateData = req.body;
      if (!updateData || typeof updateData !== 'object') {
        return res.status(400).json({ success: false, message: 'Datos de actualización inválidos' });
      }
      const result = await this.service.update(id, updateData);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el producto';
      res.status(400).json({ success: false, message });
    }
  };

  /**
   * Obtiene todos los productos
   */
  findAll = async (_req: Request, res: Response) => {
    try {
      const result = await this.service.findAll();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, message });
    }
  };

  /**
   * Obtiene un producto por su ID
   */
  findById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
      }
      const result = await this.service.findById(id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al buscar el producto';
      res.status(500).json({ success: false, message });
    }
  };

  /**
   * Agrega imágenes a un producto
   */
  addImages = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ success: false, message: 'ID de producto inválido' });
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No se han subido imágenes' });
        }
        let result;
        for (const file of req.files) {
            const imageUrl = `/uploads/products/${file.filename}`;
            result = await this.service.addImage(id, imageUrl);
        }
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al subir las imágenes';
        res.status(500).json({ success: false, message });
    }
  };

  /**
   * Elimina una imagen de un producto
   */
  removeImage = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { imageUrl } = req.body;
      if (isNaN(id) || id <= 0 || !imageUrl) {
        return res.status(400).json({ success: false, message: 'ID de producto o URL de imagen inválidos' });
      }
      const result = await this.service.removeImage(id, imageUrl);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar la imagen';
      res.status(500).json({ success: false, message });
    }
  };

  /**
   * Elimina un producto
   */
  delete = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }
      await this.service.delete(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar el producto';
      res.status(500).json({ success: false, message });
    }
  };

  /**
   * Obtiene los productos de un emprendimiento por su ID
   */
  findByEntrepreneurshipId = async (req: Request, res: Response) => {
    try {
      const entrepreneurshipId = Number(req.params.id);
      if (isNaN(entrepreneurshipId) || entrepreneurshipId <= 0) {
        return res.status(400).json({ success: false, message: 'ID de emprendimiento inválido' });
      }
      const result = await this.service.findByEntrepreneurshipId(entrepreneurshipId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al buscar productos por emprendimiento';
      res.status(500).json({ success: false, message });
    }
  };

  /**
   * Reemplaza todas las imágenes de un producto
   * Acepta archivos nuevos en req.files y URLs existentes en req.body.existingImages (JSON)
   */
  updateImages = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }
      // Archivos subidos
      console.log('PUT /api/products/:id/images req.files:', req.files);
      console.log('PUT /api/products/:id/images req.body.existingImages:', req.body.existingImages);
      const uploadedImages = req.files && Array.isArray(req.files)
        ? req.files.map((file: any) => `/uploads/products/${file.filename}`)
        : [];
      // URLs existentes
      let existingImages: string[] = [];
      if (req.body.existingImages) {
        try {
          existingImages = JSON.parse(req.body.existingImages);
        } catch (e) {
          return res.status(400).json({ success: false, message: 'existingImages debe ser un array JSON' });
        }
      }
      // Combinar ambos
      const imageUrls = [...existingImages, ...uploadedImages];
      if (imageUrls.length === 0) {
        return res.status(400).json({ success: false, message: 'No se han proporcionado imágenes' });
      }
      const result = await this.service.updateImages(id, imageUrls);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar las imágenes';
      res.status(500).json({ success: false, message });
    }
  };
} 