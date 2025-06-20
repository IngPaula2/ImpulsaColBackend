import { CreateProductDTO, ProductResponseDTO } from '../dto/ProductDTO';
import { TypeORMProductRepository } from '../../infrastructure/persistence/repositories/TypeORMProductRepository';
import { ProductEntity } from '../../infrastructure/persistence/entities/ProductEntity';
import fs from 'fs';
import path from 'path';
import fsPromises from 'fs/promises';

// Función auxiliar para eliminar un archivo de forma segura.
// Maneja tanto rutas relativas como URLs completas.
function deletePhysicalFile(imageUrl: string) {
  try {
    // Extrae la última parte de la URL/ruta, que debería ser el nombre del archivo.
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      console.warn(`No se pudo extraer el nombre del archivo de: ${imageUrl}`);
      return;
    }

    const filePath = path.join(__dirname, `../../../../uploads/products/${fileName}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Archivo físico eliminado: ${filePath}`);
    } else {
      console.warn(`Se intentó eliminar un archivo que no existe: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error al eliminar el archivo físico para la URL ${imageUrl}:`, error);
    // No relanzamos el error para no detener el proceso de actualización de la DB.
  }
}

export class ProductService {
  constructor(private readonly repository: TypeORMProductRepository) {}

  async create(dto: CreateProductDTO): Promise<ProductResponseDTO> {
    let imagesArray: string[] = [];
    if (Array.isArray(dto.images)) {
      imagesArray = dto.images;
    } else if (typeof dto.images === 'string' && (dto.images as string).length > 0) {
      imagesArray = [dto.images as string];
    }
    const entity = await this.repository.create({ ...dto, images: imagesArray });
    return {
      id: entity.id,
      entrepreneurship_id: entity.entrepreneurship_id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      images: entity.images || [],
      wants_investor: entity.wants_investor,
      investment_value: entity.investment_value,
      investor_message: entity.investor_message,
      created_at: entity.created_at,
    };
  }

  async findAll(): Promise<ProductResponseDTO[]> {
    const entities = await this.repository.findAll();
    return entities.map(entity => ({
      id: entity.id,
      entrepreneurship_id: entity.entrepreneurship_id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      images: entity.images || [],
      wants_investor: entity.wants_investor,
      investment_value: entity.investment_value,
      investor_message: entity.investor_message,
      created_at: entity.created_at,
    }));
  }

  async findByEntrepreneurshipId(entrepreneurship_id: number): Promise<ProductResponseDTO[]> {
    const entities = await this.repository.findByEntrepreneurshipId(entrepreneurship_id);
    return entities.map(entity => ({
      id: entity.id,
      entrepreneurship_id: entity.entrepreneurship_id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      images: entity.images || [],
      wants_investor: entity.wants_investor,
      investment_value: entity.investment_value,
      investor_message: entity.investor_message,
      created_at: entity.created_at,
    }));
  }

  async findById(id: number): Promise<ProductResponseDTO | null> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      return null;
    }
    return {
      id: entity.id,
      entrepreneurship_id: entity.entrepreneurship_id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      images: entity.images || [],
      wants_investor: entity.wants_investor,
      investment_value: entity.investment_value,
      investor_message: entity.investor_message,
      created_at: entity.created_at,
    };
  }

  async update(id: number, updateData: Partial<CreateProductDTO>): Promise<ProductResponseDTO | null> {
    const entity = await this.repository.update(id, updateData);
    if (!entity) {
      return null;
    }
    return {
      id: entity.id,
      entrepreneurship_id: entity.entrepreneurship_id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      images: entity.images || [],
      wants_investor: entity.wants_investor,
      investment_value: entity.investment_value,
      investor_message: entity.investor_message,
      created_at: entity.created_at,
    };
  }

  async addImage(id: number, imageUrl: string): Promise<ProductResponseDTO | null> {
    const product = await this.repository.findById(id);
    if (!product) {
      deletePhysicalFile(imageUrl); // Limpiar archivo huérfano
      throw new Error('Producto no encontrado al intentar añadir imagen.');
    }

    // Verificar que no exceda el límite de 3 imágenes
    const currentImages = product.images || [];
    if (currentImages.length >= 3) {
      deletePhysicalFile(imageUrl); // Limpiar archivo huérfano
      throw new Error('No se pueden agregar más de 3 imágenes por producto.');
    }

    // Agregar la nueva imagen a la lista existente
    const entity = await this.repository.addImageUrl(id, imageUrl);
    if (!entity) {
      return null;
    }
    
    return {
        id: entity.id,
        entrepreneurship_id: entity.entrepreneurship_id,
        name: entity.name,
        description: entity.description,
        price: entity.price,
        images: entity.images || [],
        wants_investor: entity.wants_investor,
        investment_value: entity.investment_value,
        investor_message: entity.investor_message,
        created_at: entity.created_at,
    };
  }

  async deleteImage(id: number, imageUrlToDelete: string): Promise<ProductResponseDTO | null> {
    const product = await this.repository.findById(id);
    if (!product || !product.images) {
      throw new Error('Producto no encontrado o sin imágenes.');
    }

    if (product.images.length <= 1) {
      throw new Error('No se puede eliminar la última imagen del producto.');
    }

    const updatedImages = product.images.filter(url => url !== imageUrlToDelete);

    if (updatedImages.length === product.images.length) {
      console.warn(`La imagen a eliminar no fue encontrada en el producto: ${imageUrlToDelete}`);
    } else {
      deletePhysicalFile(imageUrlToDelete);
    }

    const updatedEntity = await this.repository.updateImages(id, updatedImages);
    if (!updatedEntity) {
        return null; 
    }
    
    return {
        id: updatedEntity.id,
        entrepreneurship_id: updatedEntity.entrepreneurship_id,
        name: updatedEntity.name,
        description: updatedEntity.description,
        price: updatedEntity.price,
        images: updatedEntity.images || [],
        wants_investor: updatedEntity.wants_investor,
        investment_value: updatedEntity.investment_value,
        investor_message: updatedEntity.investor_message,
        created_at: updatedEntity.created_at,
    };
  }

  async delete(id: number): Promise<boolean> {
    const product = await this.repository.findById(id);
    if (!product) {
      return false; // Retorna false si no se encuentra
    }

    // 1. Eliminar las imágenes del sistema de archivos
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        // La URL guardada es relativa (ej: /uploads/products/image.jpg)
        // Necesitamos la ruta absoluta para borrarla del disco
        const imagePath = path.join(__dirname, '../../../../', imageUrl);
        try {
          await fsPromises.unlink(imagePath);
          console.log(`Imagen eliminada: ${imagePath}`);
        } catch (error) {
          // Si el archivo no existe, no es un error crítico.
          // Puede que se haya borrado manualmente o haya un error en la ruta.
          console.error(`No se pudo eliminar la imagen ${imagePath}:`, error);
        }
      }
    }
    
    // 2. Eliminar el producto de la base de datos
    await this.repository.delete(id);
    return true; // Retorna true si fue exitoso
  }
} 