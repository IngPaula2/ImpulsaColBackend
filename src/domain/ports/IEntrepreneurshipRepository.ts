import { EntrepreneurshipEntity } from "../../infrastructure/persistence/entities/EntrepreneurshipEntity";

export interface IEntrepreneurshipRepository {
    create(data: Partial<EntrepreneurshipEntity>): Promise<EntrepreneurshipEntity>;
    findAll(): Promise<EntrepreneurshipEntity[]>;
    findById(id: number): Promise<EntrepreneurshipEntity | null>;
    findByUserId(userId: number): Promise<EntrepreneurshipEntity[]>;
    update(id: number, data: Partial<EntrepreneurshipEntity>): Promise<EntrepreneurshipEntity | null>;
    delete(id: number): Promise<void>;
} 