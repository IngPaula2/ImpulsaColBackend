import { Request, Response } from 'express';
import { InvestmentIdeaService } from '../../../application/services/InvestmentIdeaService';
import { MulterError } from 'multer';

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
      console.log('[InvestmentIdeaController] Iniciando creación de idea de inversión');
      console.log('[InvestmentIdeaController] Datos recibidos:', JSON.stringify(req.body, null, 2));
      console.log('[InvestmentIdeaController] Usuario autenticado:', req.user);
      
      const dto = {
        ...req.body,
        user_id: req.user?.userId // Sobrescribe el user_id con el del token
      };
      
      console.log('[InvestmentIdeaController] DTO preparado:', JSON.stringify(dto, null, 2));
      const result = await this.service.create(dto);
      console.log('[InvestmentIdeaController] Idea creada exitosamente:', JSON.stringify(result, null, 2));
      
      res.status(201).json(result);
    } catch (error) {
      console.error('[InvestmentIdeaController] Error al crear idea:', error);
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };

  update = async (req: RequestWithUser, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.update(id, req.body);
      res.status(200).json(result);
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

  findMine = async (req: RequestWithUser, res: Response) => {
    try {
      console.log('[InvestmentIdeaController] Iniciando findMine');
      console.log('[InvestmentIdeaController] Usuario autenticado:', req.user);

      const userId = req.user?.userId;
      if (!userId) {
        console.error('[InvestmentIdeaController] No se encontró el ID de usuario en el token');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const result = await this.service.findMine(userId);
      console.log('[InvestmentIdeaController] Ideas encontradas:', result.length);
      
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[InvestmentIdeaController] Error en findMine:', error);
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };

  findById = async (req: Request, res: Response) => {
    try {
      console.log('[InvestmentIdeaController] Buscando idea por ID:', req.params.id);
      const id = parseInt(req.params.id);
      const result = await this.service.findById(id);
      
      if (!result) {
        console.log('[InvestmentIdeaController] Idea no encontrada');
        return res.status(404).json({ 
          success: false, 
          message: 'Idea de inversión no encontrada',
          data: null 
        });
      }

      console.log('[InvestmentIdeaController] Idea encontrada:', result);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[InvestmentIdeaController] Error en findById:', error);
      const message = error instanceof Error ? error.message : String(error);
      res.status(404).json({ 
        success: false, 
        message,
        data: null 
      });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.delete(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };

  addImages = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      console.log('[InvestmentIdeaController] Iniciando addImages para idea:', id);
      console.log('[InvestmentIdeaController] Files recibidos:', req.files);
      console.log('[InvestmentIdeaController] Content-Type:', req.headers['content-type']);

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.log('[InvestmentIdeaController] No se recibieron archivos');
        return res.status(400).json({ error: 'No se han subido imágenes' });
      }

      const files = req.files as Express.Multer.File[];
      console.log('[InvestmentIdeaController] Archivos procesados:', files.map(f => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        path: f.path
      })));

      let result;
      for (const file of files) {
        const imageUrl = file.path;
        console.log('[InvestmentIdeaController] Procesando imagen:', imageUrl);
        result = await this.service.addImage(id, imageUrl);
      }

      console.log('[InvestmentIdeaController] Imágenes agregadas exitosamente:', result);
      return res.status(200).json(result);
    } catch (error) {
      console.error('[InvestmentIdeaController] Error al subir imágenes:', error);
      if (error instanceof MulterError) {
        console.error('[InvestmentIdeaController] Stack trace:', error.stack);
        return res.status(400).json({ 
          error: 'Error en la subida de archivos',
          details: error.message,
          code: error.code
        });
      }
      return res.status(500).json({ 
        error: 'Error interno del servidor al procesar las imágenes',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  removeImage = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { imageUrl } = req.body;
      const result = await this.service.removeImage(id, imageUrl);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };

  updateImage = async (req: Request, res: Response) => {
    try {
      console.log('[InvestmentIdeaController] Iniciando updateImage');
      const id = parseInt(req.params.id);
      const { oldImageUrl } = req.body;
      
      if (!req.file) {
        console.error('[InvestmentIdeaController] No se recibió ningún archivo');
        return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
      }

      console.log('[InvestmentIdeaController] Archivo recibido:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });

      const result = await this.service.updateImage(id, oldImageUrl, req.file.path);
      console.log('[InvestmentIdeaController] Imagen actualizada exitosamente:', result);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('[InvestmentIdeaController] Error al actualizar imagen:', error);
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };

  addVideo = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún video' });
      }
      const videoUrl = req.file.path;
      const result = await this.service.addVideo(id, videoUrl);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };

  removeVideo = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.removeVideo(id);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };
} 