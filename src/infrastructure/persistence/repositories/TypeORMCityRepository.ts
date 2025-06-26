import { AppDataSource } from "../../config/database";
import { CityEntity } from "../entities/CityEntity";

export class TypeORMCityRepository {
  private repository = AppDataSource.getRepository(CityEntity);

  async findByDepartment(departmentId: number): Promise<CityEntity[]> {
    return this.repository.find({ where: { department: { id: departmentId } } });
  }
} 