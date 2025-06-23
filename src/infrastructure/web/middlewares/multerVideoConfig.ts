import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'investment_idea_videos',
    allowed_formats: ['mp4', 'mov', 'avi'],
    resource_type: 'video',
    transformation: [
      { duration: 60 }, // Límite de 1 minuto
      { quality: 'auto' }, // Optimización automática de calidad
      { format: 'mp4' } // Convertir todo a mp4
    ]
  } as any,
});

const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 50, // Límite de 50MB para videos
  },
  fileFilter: (_req, file, cb) => {
    // Validar tipos de archivo
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('El archivo debe ser un video'));
    }
  }
});

export default videoUpload; 