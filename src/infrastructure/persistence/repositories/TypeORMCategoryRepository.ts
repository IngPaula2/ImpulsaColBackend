import { Repository, DataSource } from 'typeorm';
import { CategoryEntity } from '../entities/CategoryEntity';

export class TypeORMCategoryRepository {
  private repository: Repository<CategoryEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(CategoryEntity);
  }

  async findByType(type: string): Promise<CategoryEntity[]> {
    return this.repository.find({ where: { type } });
  }
} 