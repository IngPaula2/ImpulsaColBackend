import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EntrepreneurshipEntity } from './EntrepreneurshipEntity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  entrepreneurship_id!: number;

  @ManyToOne(() => EntrepreneurshipEntity, ent => ent.products)
  @JoinColumn({ name: 'entrepreneurship_id' })
  entrepreneurship!: EntrepreneurshipEntity;

  @Column({ length: 100 })
  name!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  images!: string;

  @Column({ type: 'boolean', default: false })
  wants_investor!: boolean;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  investment_value!: number;

  @Column({ type: 'text', nullable: true })
  investor_message!: string;

  @CreateDateColumn()
  created_at!: Date;
} 