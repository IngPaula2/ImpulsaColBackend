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
    return this.repository.find({ where: { entrepreneurship_id } });
  }

  // Puedes agregar más métodos según necesidad
} 