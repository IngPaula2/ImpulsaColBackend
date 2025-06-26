import * as fs from 'fs/promises';
import * as path from 'path';
import { IProductRepository } from '../../domain/ports/IProductRepository';
import { CreateProductDTO, ProductResponseDTO } from '../dto/ProductDTO';
import { ProductEntity } from '../../infrastructure/persistence/entities/ProductEntity';

export class ProductService {
    constructor(private readonly productRepository: IProductRepository) {}

    private mapToDTO(entity: ProductEntity): ProductResponseDTO {
        return {
            id: entity.id,
            entrepreneurship_id: entity.entrepreneurship_id,
            name: entity.name,
            description: entity.description,
            price: entity.price,
            images: entity.images || [],
            wants_investor: entity.wants_investor,
            investment_value: entity.investment_value,
            investor_message: entity.investor_message,
            created_at: entity.created_at,
        };
    }

    /**
     * Crea un nuevo producto validando los datos de entrada
     */
    async create(createDto: CreateProductDTO): Promise<ProductResponseDTO> {
        // Validaciones de negocio
        if (!createDto.name || createDto.name.trim() === '') {
            throw new Error('El nombre del producto es obligatorio');
        }
        if (!createDto.description || createDto.description.trim() === '') {
            throw new Error('La descripción del producto es obligatoria');
        }
        if (typeof createDto.price !== 'number' || createDto.price <= 0) {
            throw new Error('El precio debe ser un número mayor a 0');
        }
        const newEntity = await this.productRepository.create(createDto);
        return this.mapToDTO(newEntity);
    }

    async findAll(): Promise<ProductResponseDTO[]> {
        const entities = await this.productRepository.findAll();
        return entities.map(e => this.mapToDTO(e));
    }

    async findById(id: number): Promise<ProductResponseDTO | null> {
        const entity = await this.productRepository.findById(id);
        return entity ? this.mapToDTO(entity) : null;
    }

    /**
     * Actualiza un producto existente validando los datos de entrada
     */
    async update(id: number, updateDto: import('../dto/ProductDTO').UpdateProductDTO): Promise<ProductResponseDTO | null> {
        // Validaciones de negocio solo si los campos están presentes
        if (updateDto.name !== undefined && updateDto.name.trim() === '') {
            throw new Error('El nombre del producto no puede estar vacío');
        }
        if (updateDto.description !== undefined && updateDto.description.trim() === '') {
            throw new Error('La descripción del producto no puede estar vacía');
        }
        if (updateDto.price !== undefined && (typeof updateDto.price !== 'number' || updateDto.price <= 0)) {
            throw new Error('El precio debe ser un número mayor a 0');
        }
        const updatedEntity = await this.productRepository.update(id, updateDto);
        return updatedEntity ? this.mapToDTO(updatedEntity) : null;
    }

    async delete(id: number): Promise<void> {
        const product = await this.productRepository.findById(id);
        if (product?.images) {
            for (const imagePath of product.images) {
                try {
                    const fullPath = path.resolve(process.cwd(), imagePath);
                    await fs.unlink(fullPath);
                } catch (error) {
                    console.error(`Error al eliminar imagen del producto ${id}: ${imagePath}`, error);
                }
            }
        }
        await this.productRepository.delete(id);
    }

    async addImage(id: number, imageUrl: string): Promise<ProductResponseDTO | null> {
        const product = await this.productRepository.findById(id);
        if (!product) {
            // Si el producto no existe, la imagen subida es huérfana y debe eliminarse.
            try {
                const fullPath = path.resolve(process.cwd(), imageUrl);
                await fs.unlink(fullPath);
            } catch (error) {
                console.error(`Error al eliminar imagen huérfana: ${imageUrl}`, error);
            }
            throw new Error('Producto no encontrado');
        }

        const images = product.images || [];
        images.push(imageUrl);

        const updatedEntity = await this.productRepository.update(id, { images });
        return updatedEntity ? this.mapToDTO(updatedEntity) : null;
    }

    async removeImage(id: number, imageUrl: string): Promise<ProductResponseDTO | null> {
        const product = await this.productRepository.findById(id);
        if (!product || !product.images) {
            throw new Error('Producto o imágenes no encontradas');
        }

        const updatedImages = product.images.filter(img => img !== imageUrl);

        try {
            const fullPath = path.resolve(process.cwd(), imageUrl);
            await fs.unlink(fullPath);
        } catch (error) {
            console.error(`Error al eliminar archivo de imagen: ${imageUrl}`, error);
            // No detenemos el proceso, la referencia en la BD es más importante de eliminar
        }

        const updatedEntity = await this.productRepository.update(id, { images: updatedImages });
        return updatedEntity ? this.mapToDTO(updatedEntity) : null;
    }

    async findByEntrepreneurshipId(entrepreneurshipId: number): Promise<ProductResponseDTO[]> {
        const entities = await this.productRepository.findByEntrepreneurshipId(entrepreneurshipId);
        return entities.map(e => this.mapToDTO(e));
    }

    /**
     * Reemplaza todas las imágenes de un producto
     */
    async updateImages(id: number, images: string[]): Promise<ProductResponseDTO | null> {
        const updatedEntity = await this.productRepository.update(id, { images });
        return updatedEntity ? this.mapToDTO(updatedEntity) : null;
    }
} 