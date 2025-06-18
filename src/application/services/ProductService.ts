import { CreateProductDTO, ProductResponseDTO } from '../dto/ProductDTO';
import { TypeORMProductRepository } from '../../infrastructure/persistence/repositories/TypeORMProductRepository';
import { ProductEntity } from '../../infrastructure/persistence/entities/ProductEntity';

export class ProductService {
  constructor(private readonly repository: TypeORMProductRepository) {}

  async create(dto: CreateProductDTO): Promise<ProductResponseDTO> {
    const entity = await this.repository.create(dto);
    return {
      id: entity.id,
      entrepreneurship_id: entity.entrepreneurship_id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      images: entity.images,
      wants_investor: entity.wants_investor,
      investment_value: entity.investment_value,
      investor_message: entity.investor_message,
      created_at: entity.created_at,
    };
  }

  async findAll(): Promise<ProductResponseDTO[]> {
    const entities = await this.repository.findAll();
    return entities.map(entity => ({
      id: entity.id,
      entrepreneurship_id: entity.entrepreneurship_id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      images: entity.images,
      wants_investor: entity.wants_investor,
      investment_value: entity.investment_value,
      investor_message: entity.investor_message,
      created_at: entity.created_at,
    }));
  }

  async findByEntrepreneurshipId(entrepreneurship_id: number): Promise<ProductResponseDTO[]> {
    const entities = await this.repository.findByEntrepreneurshipId(entrepreneurship_id);
    return entities.map(entity => ({
      id: entity.id,
      entrepreneurship_id: entity.entrepreneurship_id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      images: entity.images,
      wants_investor: entity.wants_investor,
      investment_value: entity.investment_value,
      investor_message: entity.investor_message,
      created_at: entity.created_at,
    }));
  }
} 