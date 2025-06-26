import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CityEntity } from "./CityEntity";

@Entity({ name: "departments" })
export class DepartmentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @OneToMany(() => CityEntity, city => city.department)
  cities!: CityEntity[];
} 