import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 50 })
  type!: string;

  @Column({ nullable: true, length: 255 })
  image_url?: string;

  @CreateDateColumn()
  created_at!: Date;
} 