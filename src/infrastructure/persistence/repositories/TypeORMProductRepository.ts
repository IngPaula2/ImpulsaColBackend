import { Repository, DataSource } from 'typeorm';
import { ProductEntity } from '../entities/ProductEntity';

export class TypeORMProductRepository {
  private repository: Repository<ProductEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(ProductEntity);
  }

  async create(data: Partial<ProductEntity>): Promise<ProductEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(): Promise<ProductEntity[]> {
    return this.repository.find();
  }

  async findByEntrepreneurshipId(entrepreneurship_id: number): Promise<ProductEntity[]> {
    return this.repository.find({
      where: { entrepreneurship: { id: entrepreneurship_id } },
      relations: ['entrepreneurship'],
    });
  }

  async findById(id: number): Promise<ProductEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<ProductEntity>): Promise<ProductEntity | null> {
    const product = await this.findById(id);
    if (product) {
      Object.assign(product, data);
      return this.repository.save(product);
    }
    return null;
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

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  // Puedes agregar más métodos según necesidad
} 