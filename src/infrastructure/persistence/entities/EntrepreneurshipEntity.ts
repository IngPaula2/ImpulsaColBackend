import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import { ProductEntity } from './ProductEntity';

@Entity('entrepreneurships')
export class EntrepreneurshipEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => UserEntity, user => user.entrepreneurships)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ length: 100 })
  title!: string;

  @Column('text')
  description!: string;

  @Column({ length: 50, nullable: true })
  category!: string;

  @Column({ nullable: true })
  cover_image!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => ProductEntity, product => product.entrepreneurship)
  products!: ProductEntity[];
} 