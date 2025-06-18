import { Repository, DataSource } from 'typeorm';
import { InvestmentIdeaEntity } from '../entities/InvestmentIdeaEntity';

export class TypeORMInvestmentIdeaRepository {
  private repository: Repository<InvestmentIdeaEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(InvestmentIdeaEntity);
  }

  async create(data: Partial<InvestmentIdeaEntity>): Promise<InvestmentIdeaEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(): Promise<InvestmentIdeaEntity[]> {
    return this.repository.find();
  }

  // Puedes agregar más métodos según necesidad
} 