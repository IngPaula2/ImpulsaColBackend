import { Repository, DataSource } from 'typeorm';
import { EntrepreneurshipEntity } from '../entities/EntrepreneurshipEntity';
import { IEntrepreneurshipRepository } from '../../../domain/ports/IEntrepreneurshipRepository';

export class TypeORMEntrepreneurshipRepository implements IEntrepreneurshipRepository {
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

  async findById(id: number): Promise<EntrepreneurshipEntity | null> {
    return this.repository.findOne({ where: { id }, relations: ['user'] });
  }

  async findOne(id: number): Promise<EntrepreneurshipEntity | null> {
    return this.repository.findOne({ where: { id }, relations: ['user'] });
  }

  async findOneWithProducts(id: number): Promise<EntrepreneurshipEntity | null> {
    return this.repository.findOne({ where: { id }, relations: ['user', 'products'] });
  }

  async update(id: number, data: Partial<EntrepreneurshipEntity>): Promise<EntrepreneurshipEntity | null> {
    await this.repository.update(id, data);
    return this.findOne(id);
  }

  async updateCoverImage(id: number, coverImage: string): Promise<EntrepreneurshipEntity | null> {
    const entrepreneurship = await this.findOne(id);
    if (entrepreneurship) {
      entrepreneurship.cover_image = coverImage;
      return this.repository.save(entrepreneurship);
    }
    return null;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  // Puedes agregar más métodos según necesidad
} 