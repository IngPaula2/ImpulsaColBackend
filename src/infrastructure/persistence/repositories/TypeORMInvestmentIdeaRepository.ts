import { Repository, DataSource } from 'typeorm';
import { InvestmentIdeaEntity } from '../entities/InvestmentIdeaEntity';

export class TypeORMInvestmentIdeaRepository {
  private repository: Repository<InvestmentIdeaEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(InvestmentIdeaEntity);
  }

  async create(data: Partial<InvestmentIdeaEntity>): Promise<InvestmentIdeaEntity> {
    console.log('[TypeORMInvestmentIdeaRepository] Iniciando creación de entidad');
    console.log('[TypeORMInvestmentIdeaRepository] Datos recibidos:', JSON.stringify(data, null, 2));
    
    const entity = this.repository.create(data);
    console.log('[TypeORMInvestmentIdeaRepository] Entidad creada (pre-save):', JSON.stringify(entity, null, 2));
    
    const savedEntity = await this.repository.save(entity);
    console.log('[TypeORMInvestmentIdeaRepository] Entidad guardada exitosamente:', JSON.stringify(savedEntity, null, 2));
    
    return savedEntity;
  }

  async update(id: number, data: Partial<InvestmentIdeaEntity>): Promise<InvestmentIdeaEntity> {
    await this.repository.update(id, data);
    const updated = await this.repository.findOne({ 
      where: { id },
      relations: ['entrepreneurship']
    });
    if (!updated) {
      throw new Error('Idea de inversión no encontrada');
    }
    return updated;
  }

  async findAll(): Promise<InvestmentIdeaEntity[]> {
    return this.repository.find({
      relations: ['entrepreneurship']
    });
  }

  async findById(id: number): Promise<InvestmentIdeaEntity | null> {
    console.log('[TypeORMInvestmentIdeaRepository] Buscando idea por ID:', id);
    const idea = await this.repository.findOne({
      where: { id },
      relations: ['entrepreneurship']
    });
    console.log('[TypeORMInvestmentIdeaRepository] Resultado de la búsqueda:', idea);
    return idea;
  }

  async findActiveIdeasByUser(userId: number): Promise<InvestmentIdeaEntity[]> {
    console.log('[TypeORMInvestmentIdeaRepository] Buscando ideas activas para usuario:', userId);
    const ideas = await this.repository.find({
      where: {
        user_id: userId,
        is_active: true
      }
    });
    console.log('[TypeORMInvestmentIdeaRepository] Ideas activas encontradas:', ideas.length);
    return ideas;
  }

  async findActiveIdeasByEntrepreneurship(entrepreneurshipId: number): Promise<InvestmentIdeaEntity[]> {
    console.log('[TypeORMInvestmentIdeaRepository] Buscando ideas activas para emprendimiento:', entrepreneurshipId);
    const ideas = await this.repository.find({
      where: {
        entrepreneurship_id: entrepreneurshipId,
        is_active: true
      }
    });
    console.log('[TypeORMInvestmentIdeaRepository] Ideas activas encontradas:', ideas.length);
    return ideas;
  }

  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error('Idea de inversión no encontrada');
    }
  }

  // Puedes agregar más métodos según necesidad
} 