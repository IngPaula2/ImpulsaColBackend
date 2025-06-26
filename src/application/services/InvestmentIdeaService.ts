import { CreateInvestmentIdeaDTO, InvestmentIdeaResponseDTO, UpdateInvestmentIdeaDTO } from '../dto/InvestmentIdeaDTO';
import { TypeORMInvestmentIdeaRepository } from '../../infrastructure/persistence/repositories/TypeORMInvestmentIdeaRepository';
import { InvestmentIdeaEntity } from '../../infrastructure/persistence/entities/InvestmentIdeaEntity';

export class InvestmentIdeaService {
  constructor(private readonly repository: TypeORMInvestmentIdeaRepository) {}

  private async validateNewIdea(userId: number, entrepreneurshipId?: number): Promise<void> {
    console.log('[InvestmentIdeaService] Iniciando validación de nueva idea');
    console.log('[InvestmentIdeaService] Validando para usuario:', userId);
    console.log('[InvestmentIdeaService] Emprendimiento ID (si existe):', entrepreneurshipId);

    // Solo validar ideas activas si es para un emprendimiento existente
    if (entrepreneurshipId) {
      console.log('[InvestmentIdeaService] Validando ideas activas para emprendimiento:', entrepreneurshipId);
      const activeIdeasForEntrepreneurship = await this.repository.findActiveIdeasByEntrepreneurship(entrepreneurshipId);
      console.log('[InvestmentIdeaService] Ideas activas encontradas para el emprendimiento:', activeIdeasForEntrepreneurship.length);
      
      if (activeIdeasForEntrepreneurship.length > 0) {
        console.log('[InvestmentIdeaService] Emprendimiento ya tiene ideas activas');
        throw new Error('Este emprendimiento ya tiene una idea de inversión activa');
      }
    }

    console.log('[InvestmentIdeaService] Validación completada exitosamente');
  }

  async create(dto: CreateInvestmentIdeaDTO): Promise<InvestmentIdeaResponseDTO> {
    console.log('[InvestmentIdeaService] Iniciando creación de idea de inversión');
    console.log('[InvestmentIdeaService] DTO recibido:', JSON.stringify(dto, null, 2));

    // Validar antes de crear
    await this.validateNewIdea(dto.user_id, dto.entrepreneurship_id);
    console.log('[InvestmentIdeaService] Validación completada, procediendo a crear');

    const entity = await this.repository.create({
      ...dto,
      is_active: true // Nueva idea siempre inicia como activa
    });
    console.log('[InvestmentIdeaService] Entidad creada:', JSON.stringify(entity, null, 2));

    const mappedDTO = this.mapToDTO(entity);
    console.log('[InvestmentIdeaService] DTO mapeado para respuesta:', JSON.stringify(mappedDTO, null, 2));
    
    return mappedDTO;
  }

  async update(id: number, dto: UpdateInvestmentIdeaDTO): Promise<InvestmentIdeaResponseDTO> {
    const entity = await this.repository.update(id, dto);
    return this.mapToDTO(entity);
  }

  async findAll(): Promise<InvestmentIdeaResponseDTO[]> {
    const entities = await this.repository.findAll();
    return entities.map(entity => this.mapToDTO(entity));
  }

  async findMine(userId: number): Promise<InvestmentIdeaResponseDTO[]> {
    console.log('[InvestmentIdeaService] Buscando ideas de inversión del usuario:', userId);
    const entities = await this.repository.findActiveIdeasByUser(userId);
    console.log('[InvestmentIdeaService] Ideas encontradas:', entities.length);
    return entities.map(entity => this.mapToDTO(entity));
  }

  async findById(id: number): Promise<InvestmentIdeaResponseDTO | null> {
    console.log('[InvestmentIdeaService] Buscando idea por ID:', id);
    const entity = await this.repository.findById(id);
    
    if (!entity) {
      console.log('[InvestmentIdeaService] Idea no encontrada');
      return null;
    }

    console.log('[InvestmentIdeaService] Idea encontrada:', entity);
    return this.mapToDTO(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async addImages(id: number, imageUrls: string[]): Promise<InvestmentIdeaResponseDTO> {
    console.log('[InvestmentIdeaService] Iniciando addImages');
    console.log('[InvestmentIdeaService] ID:', id);
    console.log('[InvestmentIdeaService] URLs de imágenes:', imageUrls);

    const entity = await this.repository.findById(id);
    if (!entity) {
        console.error('[InvestmentIdeaService] Idea de inversión no encontrada:', id);
        throw new Error('Idea de inversión no encontrada');
    }

    console.log('[InvestmentIdeaService] Idea encontrada:', entity);
    const currentImages = entity.images || [];
    console.log('[InvestmentIdeaService] Imágenes actuales:', currentImages);

    if (currentImages.length + imageUrls.length > 2) {
        console.error('[InvestmentIdeaService] Excede el límite de imágenes');
        throw new Error('No se pueden agregar más de 2 imágenes');
    }

    entity.images = [...currentImages, ...imageUrls];
    console.log('[InvestmentIdeaService] Nuevas imágenes a guardar:', entity.images);

    try {
        const updatedEntity = await this.repository.update(id, { images: entity.images });
        console.log('[InvestmentIdeaService] Entidad actualizada:', updatedEntity);
        return this.mapToDTO(updatedEntity);
    } catch (error) {
        console.error('[InvestmentIdeaService] Error al actualizar la entidad:', error);
        throw error;
    }
  }

  async removeImage(id: number, imageUrl: string): Promise<InvestmentIdeaResponseDTO> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new Error('Idea de inversión no encontrada');
    }

    const currentImages = entity.images || [];
    const updatedImages = currentImages.filter(img => img !== imageUrl);
    const updatedEntity = await this.repository.update(id, { images: updatedImages });
    return this.mapToDTO(updatedEntity);
  }

  async updateImage(id: number, oldImageUrl: string, newImageUrl: string): Promise<InvestmentIdeaResponseDTO> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new Error('Idea de inversión no encontrada');
    }

    const currentImages = entity.images || [];
    const imageIndex = currentImages.indexOf(oldImageUrl);
    if (imageIndex === -1) {
      throw new Error('Imagen no encontrada');
    }

    currentImages[imageIndex] = newImageUrl;
    const updatedEntity = await this.repository.update(id, { images: currentImages });
    return this.mapToDTO(updatedEntity);
  }

  async addVideo(id: number, videoUrl: string): Promise<InvestmentIdeaResponseDTO> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new Error('Idea de inversión no encontrada');
    }

    // Si ya existe un video, eliminarlo (la lógica de eliminación del archivo se maneja en el controlador)
    if (entity.video_url) {
      throw new Error('La idea ya tiene un video. Debe eliminarlo primero.');
    }

    const updatedEntity = await this.repository.update(id, { video_url: videoUrl });
    return this.mapToDTO(updatedEntity);
  }

  async removeVideo(id: number): Promise<InvestmentIdeaResponseDTO> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new Error('Idea de inversión no encontrada');
    }

    if (!entity.video_url) {
      throw new Error('La idea no tiene video para eliminar');
    }

    const updatedEntity = await this.repository.update(id, { video_url: null });
    return this.mapToDTO(updatedEntity);
  }

  async addImage(id: number, imageUrl: string): Promise<InvestmentIdeaResponseDTO> {
    console.log('[InvestmentIdeaService] Iniciando addImage');
    console.log('[InvestmentIdeaService] ID:', id);
    console.log('[InvestmentIdeaService] URL de imagen:', imageUrl);

    const entity = await this.repository.findById(id);
    if (!entity) {
        console.error('[InvestmentIdeaService] Idea de inversión no encontrada:', id);
        throw new Error('Idea de inversión no encontrada');
    }

    console.log('[InvestmentIdeaService] Idea encontrada:', entity);
    const currentImages = entity.images || [];
    console.log('[InvestmentIdeaService] Imágenes actuales:', currentImages);

    if (currentImages.length >= 2) {
        console.error('[InvestmentIdeaService] Excede el límite de imágenes');
        throw new Error('No se pueden agregar más de 2 imágenes');
    }

    entity.images = [...currentImages, imageUrl];
    console.log('[InvestmentIdeaService] Nuevas imágenes a guardar:', entity.images);

    try {
        const updatedEntity = await this.repository.update(id, { images: entity.images });
        console.log('[InvestmentIdeaService] Entidad actualizada:', updatedEntity);
        return this.mapToDTO(updatedEntity);
    } catch (error) {
        console.error('[InvestmentIdeaService] Error al actualizar la entidad:', error);
        throw error;
    }
  }

  private mapToDTO(entity: InvestmentIdeaEntity): InvestmentIdeaResponseDTO {
    return {
      id: entity.id,
      user_id: entity.user_id,
      user_name: entity.user ? entity.user.full_name : undefined,
      user_profile_image: entity.user ? entity.user.profile_image : undefined,
      title: entity.title,
      description: entity.description,
      category: entity.category,
      target_amount: entity.target_amount,
      investors_needed: entity.investors_needed,
      investor_message: entity.investor_message,
      images: entity.images,
      video_url: entity.video_url,
      entrepreneurship_id: entity.entrepreneurship_id,
      entrepreneurship: entity.entrepreneurship ? {
        id: entity.entrepreneurship.id,
        title: entity.entrepreneurship.title
      } : undefined,
      is_active: entity.is_active,
      created_at: entity.created_at,
    };
  }
} 