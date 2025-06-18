import { CreateEntrepreneurshipDTO, EntrepreneurshipResponseDTO } from '../dto/EntrepreneurshipDTO';
import { TypeORMEntrepreneurshipRepository } from '../../infrastructure/persistence/repositories/TypeORMEntrepreneurshipRepository';
import { EntrepreneurshipEntity } from '../../infrastructure/persistence/entities/EntrepreneurshipEntity';

export class EntrepreneurshipService {
  constructor(private readonly repository: TypeORMEntrepreneurshipRepository) {}

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
} 