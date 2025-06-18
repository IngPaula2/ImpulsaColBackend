import { Repository, DataSource } from 'typeorm';
import { EntrepreneurshipEntity } from '../entities/EntrepreneurshipEntity';

export class TypeORMEntrepreneurshipRepository {
  private repository: Repository<EntrepreneurshipEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(EntrepreneurshipEntity);
  }

  async create(data: Partial<EntrepreneurshipEntity>): Promise<EntrepreneurshipEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(): Promise<EntrepreneurshipEntity[]> {
    return this.repository.find({ relations: ['user'] });
  }

  async findByUserId(userId: number): Promise<EntrepreneurshipEntity[]> {
    return this.repository.find({ where: { user_id: userId }, relations: ['user'] });
  }

  async findOne(id: number): Promise<EntrepreneurshipEntity | null> {
    return this.repository.findOne({ where: { id }, relations: ['user'] });
  }

  // Puedes agregar más métodos según necesidad
} 