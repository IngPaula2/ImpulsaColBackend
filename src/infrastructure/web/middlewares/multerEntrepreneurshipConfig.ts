import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurarse de que el directorio de subidas existe
const uploadDir = path.join(__dirname, '../../../../uploads/entrepreneurships');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento de Multer
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtro de archivos para aceptar solo imágenes
const fileFilter = (req: any, file: any, cb: any) => {
  // Acepta jpeg, jpg, png, gif, webp
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb('Error: El archivo debe ser una imagen válida (JPG, PNG, GIF, WEBP).');
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
  fileFilter: fileFilter,
});

export default upload; 