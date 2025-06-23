import * as fs from 'fs/promises';
import * as path from 'path';
import { IEntrepreneurshipRepository, IProductRepository } from '../../domain/ports';
import { EntrepreneurshipEntity } from '../../infrastructure/persistence/entities/EntrepreneurshipEntity';
import { CreateEntrepreneurshipDTO, EntrepreneurshipResponseDTO } from '../dto/EntrepreneurshipDTO';

export class EntrepreneurshipService {
    constructor(
        private readonly entrepreneurshipRepository: IEntrepreneurshipRepository,
        private readonly productRepository: IProductRepository
    ) {}

    private mapToDTO(entity: EntrepreneurshipEntity): EntrepreneurshipResponseDTO {
        return {
            id: entity.id,
            user_id: entity.user_id,
            user_name: entity.user?.full_name || '',
            user_profile_image: entity.user?.profile_image || null,
            title: entity.title,
            description: entity.description,
            category: entity.category,
            cover_image: entity.cover_image,
            created_at: entity.created_at,
            location: entity.user?.department || 'N/A',
        };
    }

    async create(createDto: CreateEntrepreneurshipDTO): Promise<EntrepreneurshipResponseDTO> {
        const newEntity = await this.entrepreneurshipRepository.create({
            ...createDto,
            cover_image: createDto.cover_image || 'default_cover.jpg'
        });
        return this.mapToDTO(newEntity);
    }

    async findAll(): Promise<EntrepreneurshipResponseDTO[]> {
        const entities = await this.entrepreneurshipRepository.findAll();
        return entities.map(e => this.mapToDTO(e));
    }

    async findMine(userId: number): Promise<EntrepreneurshipResponseDTO[]> {
        const entities = await this.entrepreneurshipRepository.findByUserId(userId);
        return entities.map(e => this.mapToDTO(e));
    }

    async findById(id: number): Promise<EntrepreneurshipResponseDTO | null> {
        const entity = await this.entrepreneurshipRepository.findById(id);
        return entity ? this.mapToDTO(entity) : null;
    }

    async update(id: number, updateDto: Partial<CreateEntrepreneurshipDTO>): Promise<EntrepreneurshipResponseDTO | null> {
        const updatedEntity = await this.entrepreneurshipRepository.update(id, updateDto);
        return updatedEntity ? this.mapToDTO(updatedEntity) : null;
    }

    async updateCoverImage(id: number, imageUrl: string): Promise<EntrepreneurshipResponseDTO | null> {
        const entrepreneurship = await this.entrepreneurshipRepository.findById(id);
        if (!entrepreneurship) {
            try {
                const fullPath = path.resolve(process.cwd(), imageUrl);
                await fs.unlink(fullPath);
            } catch (error) {
                console.error(`Error al eliminar imagen huérfana: ${imageUrl}`, error);
            }
            throw new Error('Emprendimiento no encontrado');
        }

        if (entrepreneurship.cover_image) {
            try {
                const fullPath = path.resolve(process.cwd(), entrepreneurship.cover_image);
                await fs.unlink(fullPath);
            } catch (error) {
                console.error(`Error al eliminar imagen de portada anterior: ${entrepreneurship.cover_image}`, error);
            }
        }
        
        const updatedEntity = await this.entrepreneurshipRepository.update(id, { cover_image: imageUrl });
        return updatedEntity ? this.mapToDTO(updatedEntity) : null;
    }

    async delete(id: number): Promise<void> {
        const products = await this.productRepository.findByEntrepreneurshipId(id);

        for (const product of products) {
            if (product.images) {
                for (const imagePath of product.images) {
                    try {
                        const fullPath = path.resolve(process.cwd(), imagePath);
                        await fs.unlink(fullPath);
                    } catch (error) {
                        console.error(`Error al eliminar la imagen del producto ${product.id}: ${imagePath}`, error);
                    }
                }
            }
            await this.productRepository.delete(product.id);
        }

        const entrepreneurship = await this.entrepreneurshipRepository.findById(id);
        if (entrepreneurship?.cover_image) {
            try {
                const fullPath = path.resolve(process.cwd(), entrepreneurship.cover_image);
                await fs.unlink(fullPath);
            } catch (error) {
                console.error(`Error al eliminar la imagen de portada del emprendimiento ${id}: ${entrepreneurship.cover_image}`, error);
            }
        }

        await this.entrepreneurshipRepository.delete(id);
    }
}