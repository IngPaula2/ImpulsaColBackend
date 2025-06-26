import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { DepartmentEntity } from "./DepartmentEntity";

@Entity({ name: "cities" })
export class CityEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @ManyToOne(() => DepartmentEntity, department => department.cities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department!: DepartmentEntity;
} 