import { CreateEntrepreneurshipDTO, EntrepreneurshipResponseDTO } from '../dto/EntrepreneurshipDTO';
import { TypeORMEntrepreneurshipRepository } from '../../infrastructure/persistence/repositories/TypeORMEntrepreneurshipRepository';
import { EntrepreneurshipEntity } from '../../infrastructure/persistence/entities/EntrepreneurshipEntity';
import fs from 'fs';
import path from 'path';
import { ProductService } from './ProductService';
import { TypeORMProductRepository as ProductRepository } from '../../infrastructure/persistence/repositories/TypeORMProductRepository';
import { AppDataSource } from '../../infrastructure/config/database';

// Función auxiliar para eliminar un archivo de forma segura
function deletePhysicalFile(imageUrl: string, subfolder: 'entrepreneurships' | 'products') {
  try {
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      console.warn(`No se pudo extraer el nombre del archivo de: ${imageUrl}`);
      return;
    }

    const filePath = path.join(__dirname, `../../../../uploads/${subfolder}/${fileName}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Archivo físico eliminado: ${filePath}`);
    } else {
      console.warn(`Se intentó eliminar un archivo que no existe: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error al eliminar archivo físico:`, error);
  }
}

export class EntrepreneurshipService {
  private productService: ProductService;

  constructor(private repository: TypeORMEntrepreneurshipRepository) {
    const productRepository = new ProductRepository(AppDataSource);
    this.productService = new ProductService(productRepository);
  }

  async create(dto: CreateEntrepreneurshipDTO): Promise<EntrepreneurshipResponseDTO> {
    const entity = await this.repository.create(dto);
    return {
      id: entity.id,
      user_id: entity.user_id,
      user_name: entity.user?.full_name || '',
      title: entity.title,
      description: entity.description,
      category: entity.category,
      cover_image: entity.cover_image,
      created_at: entity.created_at,
    };
  }

  async findAll(): Promise<EntrepreneurshipResponseDTO[]> {
    const entities = await this.repository.findAll();
    return entities.map(entity => ({
      id: entity.id,
      user_id: entity.user_id,
      user_name: entity.user?.full_name || '',
      title: entity.title,
      description: entity.description,
      category: entity.category,
      cover_image: entity.cover_image,
      created_at: entity.created_at,
    }));
  }

  async findByUserId(userId: number): Promise<EntrepreneurshipResponseDTO[]> {
    const entities = await this.repository.findByUserId(userId);
    return entities.map(entity => ({
      id: entity.id,
      user_id: entity.user_id,
      user_name: entity.user?.full_name || '',
      title: entity.title,
      description: entity.description,
      category: entity.category,
      cover_image: entity.cover_image,
      created_at: entity.created_at,
    }));
  }

  async findOne(id: number): Promise<EntrepreneurshipResponseDTO | null> {
    const entity = await this.repository.findOne(id);
    if (!entity) return null;
    return {
      id: entity.id,
      user_id: entity.user_id,
      user_name: entity.user?.full_name || '',
      title: entity.title,
      description: entity.description,
      category: entity.category,
      cover_image: entity.cover_image,
      created_at: entity.created_at,
    };
  }

  async update(id: number, data: Partial<CreateEntrepreneurshipDTO>): Promise<EntrepreneurshipResponseDTO | null> {
    const entity = await this.repository.update(id, data);
    if (!entity) return null;
    return {
      id: entity.id,
      user_id: entity.user_id,
      user_name: entity.user?.full_name || '',
      title: entity.title,
      description: entity.description,
      category: entity.category,
      cover_image: entity.cover_image,
      created_at: entity.created_at,
    };
  }

  async updateCoverImage(id: number, imageUrl: string): Promise<EntrepreneurshipResponseDTO | null> {
    const entrepreneurship = await this.repository.findOne(id);
    if (!entrepreneurship) {
      deletePhysicalFile(imageUrl, 'entrepreneurships'); // Limpiar archivo huérfano
      throw new Error('Emprendimiento no encontrado al intentar actualizar imagen.');
    }

    // Eliminar la imagen anterior si existe
    if (entrepreneurship.cover_image) {
      deletePhysicalFile(entrepreneurship.cover_image, 'entrepreneurships');
    }

    // Actualizar con la nueva imagen
    const entity = await this.repository.updateCoverImage(id, imageUrl);
    if (!entity) {
      return null;
    }
    
    return {
      id: entity.id,
      user_id: entity.user_id,
      user_name: entity.user?.full_name || '',
      title: entity.title,
      description: entity.description,
      category: entity.category,
      cover_image: entity.cover_image,
      created_at: entity.created_at,
    };
  }

  async delete(id: number): Promise<boolean> {
    const entrepreneurship = await this.repository.findOneWithProducts(id);

    if (!entrepreneurship) {
      throw new Error('Emprendimiento no encontrado');
    }

    // 1. Eliminar todos los productos asociados
    if (entrepreneurship.products && entrepreneurship.products.length > 0) {
      for (const product of entrepreneurship.products) {
        await this.productService.delete(product.id);
      }
    }

    // 2. Eliminar la imagen de portada del emprendimiento
    if (entrepreneurship.cover_image) {
      deletePhysicalFile(entrepreneurship.cover_image, 'entrepreneurships');
    }

    // 3. Eliminar el emprendimiento de la base de datos
    await this.repository.delete(id);
    return true;
  }
} 