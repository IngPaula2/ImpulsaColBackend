import { AppDataSource } from "../../config/database";
import { DepartmentEntity } from "../entities/DepartmentEntity";

export class TypeORMDepartmentRepository {
  private repository = AppDataSource.getRepository(DepartmentEntity);

  async findAll(): Promise<DepartmentEntity[]> {
    // Consulta sin relaciones para depuración
    return this.repository.find();
  }
} 