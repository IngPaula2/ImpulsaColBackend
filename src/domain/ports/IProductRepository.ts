import { ProductEntity } from "../../infrastructure/persistence/entities/ProductEntity";

export interface IProductRepository {
    create(data: Partial<ProductEntity>): Promise<ProductEntity>;
    findAll(): Promise<ProductEntity[]>;
    findById(id: number): Promise<ProductEntity | null>;
    findByEntrepreneurshipId(entrepreneurshipId: number): Promise<ProductEntity[]>;
    update(id: number, data: Partial<ProductEntity>): Promise<ProductEntity | null>;
    delete(id: number): Promise<void>;
} 