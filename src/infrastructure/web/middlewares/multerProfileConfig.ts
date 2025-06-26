import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';

export const multerProfileConfig = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: () => ({
      folder: 'profile',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 300, height: 300, crop: 'limit' }]
    })
  })
}); 