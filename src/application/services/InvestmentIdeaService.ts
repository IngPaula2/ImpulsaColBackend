import { CreateInvestmentIdeaDTO, InvestmentIdeaResponseDTO } from '../dto/InvestmentIdeaDTO';
import { TypeORMInvestmentIdeaRepository } from '../../infrastructure/persistence/repositories/TypeORMInvestmentIdeaRepository';
import { InvestmentIdeaEntity } from '../../infrastructure/persistence/entities/InvestmentIdeaEntity';

export class InvestmentIdeaService {
  constructor(private readonly repository: TypeORMInvestmentIdeaRepository) {}

  async create(dto: CreateInvestmentIdeaDTO): Promise<InvestmentIdeaResponseDTO> {
    const entity = await this.repository.create(dto);
    return {
      id: entity.id,
      user_id: entity.user_id,
      title: entity.title,
      description: entity.description,
      category: entity.category,
      target_amount: entity.target_amount,
      investors_needed: entity.investors_needed,
      investor_message: entity.investor_message,
      created_at: entity.created_at,
    };
  }

  async findAll(): Promise<InvestmentIdeaResponseDTO[]> {
    const entities = await this.repository.findAll();
    return entities.map(entity => ({
      id: entity.id,
      user_id: entity.user_id,
      title: entity.title,
      description: entity.description,
      category: entity.category,
      target_amount: entity.target_amount,
      investors_needed: entity.investors_needed,
      investor_message: entity.investor_message,
      created_at: entity.created_at,
    }));
  }
} 