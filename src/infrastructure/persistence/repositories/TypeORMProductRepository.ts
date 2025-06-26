import { Repository, DataSource } from 'typeorm';
import { ProductEntity } from '../entities/ProductEntity';
import { IProductRepository } from '../../../domain/ports/IProductRepository';

/**
 * Repositorio TypeORM para productos. Solo acceso a datos.
 */
export class TypeORMProductRepository implements IProductRepository {
  private repository: Repository<ProductEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(ProductEntity);
  }

  /**
   * Crea un nuevo producto en la base de datos
   */
  async create(data: Partial<ProductEntity>): Promise<ProductEntity> {
    const product = this.repository.create(data);
    return this.repository.save(product);
  }

  /**
   * Obtiene todos los productos
   */
  async findAll(): Promise<ProductEntity[]> {
    return this.repository.find();
  }

  /**
   * Busca un producto por su ID
   */
  async findById(id: number): Promise<ProductEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Obtiene todos los productos de un emprendimiento
   */
  async findByEntrepreneurshipId(entrepreneurshipId: number): Promise<ProductEntity[]> {
    return this.repository.find({ where: { entrepreneurship_id: entrepreneurshipId } });
  }

  /**
   * Actualiza un producto por su ID
   */
  async update(id: number, data: Partial<ProductEntity>): Promise<ProductEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async addImageUrl(id: number, imageUrl: string): Promise<ProductEntity | null> {
    const product = await this.findById(id);
    if (product) {
      const currentImages = Array.isArray(product.images) ? product.images : [];
      product.images = [...currentImages, imageUrl];
      return this.repository.save(product);
    }
    return null;
  }

  async updateImages(id: number, images: string[]): Promise<ProductEntity | null> {
    const product = await this.findById(id);
    if (product) {
      product.images = images;
      return this.repository.save(product);
    }
    return null;
  }

  /**
   * Elimina un producto por su ID
   */
  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  // Puedes agregar más métodos según necesidad
} 